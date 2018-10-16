///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.getPartition = function () {
            return 0;
        };
        MemoryManager.prototype.loadProgram = function (opCodes, partition) {
            var start = partition * 256;
            var end = start + 256;
            for (var i = 0; i < opCodes.length; i++) {
                _MemoryAccessor.write((i + start).toString(16), opCodes[i]);
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
