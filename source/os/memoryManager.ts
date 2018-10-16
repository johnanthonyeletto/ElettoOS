///<reference path="../globals.ts" />

module TSOS {
    export class MemoryManager {
        constructor() { }

        public getPartition(): number {
            return 0;
        }

        public clearPartition(partition): void {
            var start = partition * 256;
            var end = start + 256;

            for (var i = start; i < end; i++) {
                _MemoryAccessor.write(i.toString(16), "00");
            }
        }

        public loadProgram(opCodes, partition): void {
            var start = partition * 256;
            var end = start + 256;

            for (var i = 0; i < opCodes.length; i++) {
                _MemoryAccessor.write((i + start).toString(16), opCodes[i]);
            }
        }
    }
}