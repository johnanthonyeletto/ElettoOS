///<reference path="../globals.ts" />


module TSOS {
    export class Disk {
        public totalTracks = 4;
        public totalSectors = 8;
        public totalBlocks = 8;
        public dataSize = 60;
        constructor() { }

        public init() {
            for (var i = 0; i < this.totalTracks; i++) {
                for (var j = 0; j < this.totalSectors; j++) {
                    for (var k = 0; k < this.totalBlocks; k++) {
                        var key = i + ":" + j + ":" + k;
                        var zeroes = new Array<String>();
                        for (var l = 0; l < this.dataSize; l++) {
                            zeroes.push("00");
                        }
                        var block = {
                            pointer: "0:0:0",
                            inUse: false,
                            data: zeroes
                        }
                        sessionStorage.setItem(key, JSON.stringify(block));
                    }
                }
            }
        }
    }
}