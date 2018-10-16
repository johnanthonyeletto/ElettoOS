///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.read = function (address) {
            return _Memory.memoryArray[parseInt(address, 16)];
        };
        MemoryAccessor.prototype.write = function (address, value) {
            _Memory.memoryArray[parseInt(address, 16)] = value;
            TSOS.Control.updateMemoryDisplay();
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
