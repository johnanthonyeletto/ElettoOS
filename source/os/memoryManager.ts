///<reference path="../globals.ts" />

module TSOS {
    export class MemoryManager {
        partitions;
        constructor() {
            this.partitions = [
                { segment: 0, free: true },
                { segment: 1, free: true },
                { segment: 2, free: true },
            ];
        }

        public getPartition(): number {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].free == true) {
                    return this.partitions[i].segment;
                }
            }
            return null;
        }

        public clearPartition(partition): void {
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
        }

        public loadProgram(opCodes, partition): void {
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
        }
    }
}