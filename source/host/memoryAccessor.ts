///<reference path="../globals.ts" />

module TSOS {
    export class MemoryAccessor {

        constructor() { }

        public read(address): string {
            return _Memory.memoryArray[parseInt(address, 16)];
        }

        public write(address, value): void {
            _Memory.memoryArray[parseInt(address, 16)] = value;
            TSOS.Control.updateMemoryDisplay();
        }

        public translate(address): string {
            var addressInt = parseInt(address, 16);

            addressInt = addressInt % 256;

            var result = addressInt + (_ProcessManager.running.Partition * 256);

            return (result).toString(16);
        }
    }
}