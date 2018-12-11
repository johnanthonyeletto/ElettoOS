///<reference path="../globals.ts" />

module TSOS {
    export class ProcessManager {
        public residentQueue;
        public readyQueue;
        public running;
        private nextPID;

        constructor() {
            this.residentQueue = [];
            this.readyQueue = new Queue();
            this.nextPID = 0;
        }

        public createProcess(opCodes, priority = 0) {
            if (opCodes.length > 256) {
                throw new Error("Program larger than 256 bytes.");
            }

            var partition = _MemoryManager.getPartition();
            var swapFile;
            if (partition == null) {
                swapFile = this.putProcessOnDisk(opCodes, this.nextPID);
            } else {
                _MemoryManager.loadProgram(opCodes, partition);
            }


            var pcb = new ProcessControlBlock();
            pcb.PID = this.nextPID;
            pcb.Partition = ((partition == null) ? swapFile : partition);
            pcb.PC = ((partition == null) ? 0 : (partition * 256));
            pcb.Location = ((partition == null) ? "Disk" : "Memory");
            pcb.Priority = priority;


            this.residentQueue[pcb.PID] = pcb;

            this.nextPID++;

            TSOS.Control.updateProcessDisplay();

            return pcb;

        }

        public killProcess(pid): void {
            if (this.residentQueue[pid] != null) {
                this.residentQueue[pid] = null;
                return;
            } else if (this.running != null && this.running.PID == pid) {
                this.brkSysCall();
                this.next();
                return;
            }

            var found = false;
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                var currentProcess = this.readyQueue.dequeue();

                if (currentProcess.PID != pid) {
                    this.readyQueue.enqueue(currentProcess);
                } else {
                    found = true;
                }
            }

            if (!found) {
                throw new Error("No process was found with PID " + pid);
            }

            TSOS.Control.updateProcessDisplay();
        }

        public runAll(): void {
            for (var i = 0; i < this.residentQueue.length; i++) {
                if (this.residentQueue[i] != null) {
                    this.readyQueue.enqueue(this.residentQueue[i]);
                    this.residentQueue[i] = null;
                }
            }

            TSOS.Control.updateProcessDisplay();
            this.next();
        }

        public runProcess(pid): void {
            var foundProcess = this.residentQueue[pid];

            if (foundProcess == null) {
                throw new Error("No process was found with PID " + pid);
                return;
            }

            foundProcess.State = "Ready";
            this.readyQueue.enqueue(foundProcess);
            this.residentQueue[pid] = null;
            TSOS.Control.updateProcessDisplay();
            this.next();


        }

        public updateRunning(process): void {
            _CPU.isExecuting = false;
            // Save state of current running process and put it back on the ready queue.

            if (process.Location == "Disk") {

                // We have to decide which process to swap out.
                // First let's check if there's sn empty memory segment from a program that has ended already.
                var partition = _MemoryManager.getPartition();
                if (partition != null) {
                    // There's a free partition. Let's put it there.
                    process = this.moveFromDisk(process, partition);
                } else {
                    // There's no partition. We'll make one.
                    var partitionToMoveTo;
                    var processToMoveIndex;
                    if (this.running != null) {
                        // If there's a process running, it probably won't run again for a while. So let's swap that out.
                        partitionToMoveTo = this.running.Partition;
                        this.running = this.moveToDisk(this.running);
                    } else if (this.residentQueue.length > 0) {
                        // We'll just go with random from resident queue.

                        for (var i = 0; i < this.residentQueue.length; i++) {
                            if (this.residentQueue[i] == null) {
                                continue;
                            }

                            if (this.residentQueue[i].Location == "Disk") {
                                continue;
                            }

                            processToMoveIndex = i;
                            i = this.residentQueue.lentgh;
                        }


                        partitionToMoveTo = this.residentQueue[processToMoveIndex].Partition;
                        this.residentQueue[processToMoveIndex] = this.moveToDisk(this.residentQueue[processToMoveIndex]);
                    } else {
                        while (this.readyQueue.q[processToMoveIndex].Location == "Disk") {
                            // We'll just go with random from ready queue.
                            processToMoveIndex = Math.floor(Math.random() * this.readyQueue.getSize());
                        }

                        partitionToMoveTo = this.readyQueue.q[processToMoveIndex].Partition;
                        this.readyQueue.q[processToMoveIndex] = this.moveToDisk(this.readyQueue.q[processToMoveIndex]);
                    }

                    process = this.moveFromDisk(process, partitionToMoveTo);
                }
            }

            if (this.running != null) {
                this.running.PC = _CPU.PC;
                this.running.ACC = _CPU.Acc;
                this.running.Xreg = _CPU.Xreg;
                this.running.Yreg = _CPU.Yreg;
                this.running.Zflag = _CPU.Zflag;
                this.running.IR = _CPU.IR;
                this.running.State = "Ready";
                this.running.location = "Memory";
                this.readyQueue.enqueue(this.running);
            }
            // Start running new process;
            this.running = process;
            this.running.State = "Running";
            this.running.location = "CPU";
            _CPU.PC = process.PC || 0;
            _CPU.Acc = process.ACC;
            _CPU.Xreg = process.Xreg;
            _CPU.Yreg = process.Yreg;
            _CPU.Zflag = process.Zflag;
            _CPU.IR = process.IR;

            this.readyQueue[process.PID] = null;

            _CPU.isExecuting = true;

            TSOS.Control.updateProcessDisplay();
        }

        public next(): void {
            if (this.readyQueue.getSize() > 0) {
                if (SCHEDULING_ALGORITHM == PRIORITY) {
                    this.updateRunning(this.readyQueue.getHighestPriority());
                } else {
                    this.updateRunning(this.readyQueue.dequeue());
                }

            } else {
                _CPU.isExecuting = false;
            }

            TSOS.Control.updateProcessDisplay();
        }

        public brkSysCall(): void {
            _CPU.isExecuting = false;
            _MemoryManager.clearPartition(this.running.Partition);
            _CPU.PC = 0;
            _CPU.IR = "00";
            _CPU.Acc = 0;
            _CPU.Xreg = 0;
            _CPU.Yreg = 0;
            _CPU.Zflag = 0;
            TSOS.Control.updateCPUDisplay();
            this.running = null;
            this.next();
        }


        private putProcessOnDisk(opCodes, pid) {
            var filename = "$SWAP" + pid;
            var result = _krnDiskDriver.createFile(filename);
            if (result == _krnDiskDriver.DISK_FULL) {
                _Kernel.krnTrapError("Fatal: Can't swap. Disk full.");
                return;
            }
            var opCodeString = "";

            for (var i = 0; i < opCodes.length; i++) {
                opCodeString += opCodes[i] + " ";
            }


            _krnDiskDriver.writeToDisk(filename, "\"" + opCodeString + "\"");
            return filename;
        }

        private moveToDisk(pcb) {
            var opCodes = [];
            for (var i = (pcb.Partition * 256); i < (pcb.Partition * 256) + 256; i++) {
                var op = _MemoryAccessor.read(i.toString(16));
                opCodes.push(op);
            }

            var fileName = this.putProcessOnDisk(opCodes, pcb.PID);

            _MemoryManager.clearPartition(pcb.Partition);

            pcb.Location = "Disk";
            // Interesting... Divide by zero error found in the wild.
            pcb.PC = pcb.PC - (pcb.Partition * 256);
            pcb.Partition = fileName;


            return pcb;
        }

        public moveFromDisk(pcb, partitionToMoveTo) {
            var filename = "$SWAP" + pcb.PID;

            var opCodes = _krnDiskDriver.readFile(filename).fileData.join("").trim().split(" ");

            _MemoryManager.loadProgram(opCodes, partitionToMoveTo);

            pcb.Location = "Memory";
            pcb.Partition = partitionToMoveTo;
            pcb.PC = pcb.PC * partitionToMoveTo;

            _krnDiskDriver.deleteFile(filename);
            return pcb;
        }
    }
}