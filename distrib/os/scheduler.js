///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            this.quantum = 6;
        }
        Scheduler.prototype.schedule = function () {
            if (SCHEDULING_ALGORITHM == PRIORITY) {
                return;
            }
            if ((_CPU.PC % this.quantum) == 0 && _ProcessManager.readyQueue.getSize() > 0) {
                _ProcessManager.next();
                _Kernel.krnTrace('Context switch');
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
