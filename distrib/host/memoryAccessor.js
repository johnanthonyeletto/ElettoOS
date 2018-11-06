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
        MemoryAccessor.prototype.translate = function (address) {
            var addressInt = parseInt(address, 16);
            addressInt = addressInt % 256;
            var result = addressInt + (_ProcessManager.running.Partition * 256);
            return (result).toString(16);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
