///<reference path="../globals.ts" />

module TSOS {
    export class Scheduler {
        public quantum = 2;
        constructor() { }

        public schedule(): void {
            if ((_CPU.PC % this.quantum) == 0 && _ProcessManager.readyQueue.getSize() > 0) {
                _ProcessManager.next();
            }
        }
    }
}