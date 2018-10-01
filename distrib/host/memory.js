///<reference path="../globals.ts" />
/* ------------
     memory.ts

     Requires global.ts.

     Routines for the host memory simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memoryArray) {
            if (memoryArray === void 0) { memoryArray = []; }
            this.memoryArray = memoryArray;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < 3; i++) {
                this.memoryArray[i] = [];
                for (var j = 0; j < 256; j++) {
                    this.memoryArray[i][j] = "00";
                }
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
