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

        public createProcess(opCodes) {
            if (opCodes.length > 256) {
                throw new Error("Program larger than 256 bytes.");
            }

            var partition = _MemoryManager.getPartition();
            if (partition == null) {
                throw new Error("Out of memory.");
                return;
            }

            _MemoryManager.loadProgram(opCodes, partition);

            var pcb = new ProcessControlBlock();
            pcb.PID = this.nextPID;
            pcb.Partition = partition;
            pcb.PC = partition * 256;

            this.residentQueue[pcb.PID] = pcb;

            this.nextPID++;

            TSOS.Control.updateProcessDisplay();

            return pcb;

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
            console.log(process);
            // Start running new process;
            this.running = process;
            this.running.State = "Running";
            this.running.location = "CPU";
            _CPU.PC = process.PC;
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
                this.updateRunning(this.readyQueue.dequeue());
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
    }
}