///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock() {
            this.PC = 0;
            this.ACC = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
            this.Priority = 0;
            this.IR = "00";
            this.State = "Resident";
            this.Location = "Memory";
        }
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
