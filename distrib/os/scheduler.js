///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            this.quantum = 2;
        }
        Scheduler.prototype.schedule = function () {
            if ((_CPU.PC % this.quantum) == 0 && _ProcessManager.readyQueue.getSize() > 0) {
                _ProcessManager.next();
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
