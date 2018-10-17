///<reference path="../globals.ts" />

module TSOS {
    export class ProcessManager {
        public residentQueue;
        public readyQueue;
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

            foundProcess.state = "Ready";
            this.readyQueue.enqueue(foundProcess);
            _CPU.isExecuting = true;
        }
    }
}