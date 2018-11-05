///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            this.partitions = [
                { segment: 0, free: true },
                { segment: 1, free: true },
                { segment: 2, free: true },
            ];
        }
        MemoryManager.prototype.getPartition = function () {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].free == true) {
                    return this.partitions[i].segment;
                }
            }
            return null;
        };
        MemoryManager.prototype.clearPartition = function (partition) {
            var start = partition * 256;
            var end = start + 256;
            for (var i = start; i < end; i++) {
                _MemoryAccessor.write(i.toString(16), "00");
            }
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].segment == partition) {
                    this.partitions[i].free = true;
                }
            }
            TSOS.Control.updateMemoryDisplay();
        };
        MemoryManager.prototype.loadProgram = function (opCodes, partition) {
            var start = partition * 256;
            var end = start + 256;
            for (var i = 0; i < opCodes.length; i++) {
                _MemoryAccessor.write((i + start).toString(16), opCodes[i]);
            }
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].segment == partition) {
                    this.partitions[i].free = false;
                }
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
