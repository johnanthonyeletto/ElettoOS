///<reference path="../globals.ts" />

module TSOS {
    export class ProcessManager {
        public residentQueue;
        public readyQueue;
        public running;
        private nextPID;

        constructor() {
            this.residentQueue = new Queue();
            this.readyQueue = new Queue();
            this.nextPID = 0;
        }

        public createProcess(opCodes) {
            if (opCodes.length > 256) {
                throw new Error("Program larger than 256 bytes.");
            }

            var partition = _MemoryManager.getPartition();
            _MemoryManager.loadProgram(opCodes, partition);

            var pcb = new ProcessControlBlock();
            pcb.PID = this.nextPID;
            pcb.Partition = partition;

            this.residentQueue.enqueue(pcb);

            this.nextPID++;

            TSOS.Control.updateProcessDisplay();

            return pcb;

        }

        public runProcess(pid): void {
            var foundProcess = null;
            for (var i = 0; i < this.residentQueue.getSize(); i++) {
                var currentProcess = this.residentQueue.dequeue();
                if (currentProcess.PID == pid) {
                    // Process Was Found
                    foundProcess = currentProcess;
                } else {
                    // This is not our dinosaur
                    this.readyQueue.enqueue(currentProcess);
                }
            }

            if (foundProcess == null) {
                throw new Error("No process was found with PID " + pid);
                return;
            }

            foundProcess.State = "Ready";
            this.readyQueue.enqueue(foundProcess);
            this.updateRunning(foundProcess);
            _CPU.isExecuting = true;

            TSOS.Control.updateProcessDisplay();
        }

        public updateRunning(process): void {

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

            this.removeFromReadyQueue(this.running);

            TSOS.Control.updateProcessDisplay();
        }

        private removeFromResidentQueue(process): void {
            for (var i = 0; i < this.residentQueue.getSize(); i++) {
                var currentProcess = this.residentQueue.dequeue();
                if (currentProcess.PID == process.pid) {
                    continue;
                } else {
                    // This is not our dinosaur
                    this.residentQueue.enqueue(currentProcess);
                }
            }
        }

        private removeFromReadyQueue(process): void {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                var currentProcess = this.readyQueue.dequeue();
                if (currentProcess.PID == process.pid) {
                    continue;
                } else {
                    // This is not our dinosaur
                    this.readyQueue.enqueue(currentProcess);
                }
            }
        }
    }
}