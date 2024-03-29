///<reference path="../globals.ts" />

module TSOS {
    export class Scheduler {
        public quantum = 6;
        constructor() { }

        public schedule(): void {
            if (SCHEDULING_ALGORITHM == PRIORITY) {
                return;
            }

            if ((_CPU.PC % this.quantum) == 0 && _ProcessManager.readyQueue.getSize() > 0) {
                _ProcessManager.next();
                _Kernel.krnTrace('Context switch');
            }
        }
    }
}