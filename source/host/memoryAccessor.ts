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
    }
}