///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk() {
            this.totalTracks = 4;
            this.totalSectors = 8;
            this.totalBlocks = 8;
            this.dataSize = 60;
        }
        Disk.prototype.init = function () {
            for (var i = 0; i < this.totalTracks; i++) {
                for (var j = 0; j < this.totalSectors; j++) {
                    for (var k = 0; k < this.totalBlocks; k++) {
                        var key = i + ":" + j + ":" + k;
                        var zeroes = new Array();
                        for (var l = 0; l < this.dataSize; l++) {
                            zeroes.push("00");
                        }
                        var block = {
                            pointer: "0:0:0",
                            inUse: false,
                            data: zeroes
                        };
                        sessionStorage.setItem(key, JSON.stringify(block));
                    }
                }
            }
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
