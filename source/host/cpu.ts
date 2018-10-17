///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        // http://www.labouseur.com/commondocs/6502alan-instruction-set.pdf

        constructor(public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public IR: string = "00",
            public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');

            this.IR = _MemoryAccessor.read(this.PC.toString(16));
            switch (this.IR) {
                case "A9":
                    this.ldaConstant();
                    break;
                case "AD":
                    this.ldaMemory();
                    break;
                case "8D":
                    this.sta();
                    break;
                case "6D":
                    this.acd();
                    break;

                case "A2":
                    this.ldxConstant();
                    break;
                case "AE":
                    this.ldxMemory();
                    break;
                case "A0":
                    this.ldyConstant();
                    break;
                case "AC":
                    this.ldyMemory();
                    break;
                case "EA":
                    this.nop();
                    break;
                case "00":
                    this.brk();
                    break;
                case "EC":
                    this.cpx();
                    break;
                case "D0":
                    this.bne();
                    break;
                case "EE":
                    this.inc();
                    break;
                case "FF":
                    this.sys();
                    break;
            }

            TSOS.Control.updateCPUDisplay();
        }


        // USE PARSEINT(VALUE, 16) TO CONVERT TO DECIMAL


        private ldaConstant(): void {
            //Load the accumulator with a constant A9 LDA LDA #$07 A9 07
            this.Acc = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16);
            this.PC += 2;
        }

        private ldaMemory(): void {
            //Load the accumulator from memory AD LDA LDA $0010 AD 10 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));

            this.Acc = parseInt(_MemoryAccessor.read(memoryAddress), 16);

            this.PC += 3;
        }

        private sta(): void {
            //Store the accumulator in memory 8D STA STA $0010 8D 10 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            _MemoryAccessor.write(memoryAddress, this.Acc.toString(16));
            this.PC += 3;
        }

        private acd(): void {
            //Add with carry 6D ADC ADC $0010 6D 10 00
            //Adds contents of an address to
            //the contents of the accumulator and
            //keeps the result in the accumulator
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));

            this.Acc += parseInt(_MemoryAccessor.read(memoryAddress), 16);
            this.PC += 3;
        }

        private ldxConstant(): void {
            //Load the X register with a constant A2 LDX LDX #$01 A2 01
            this.Xreg = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16);
            this.PC += 2;
        }

        private ldxMemory(): void {
            //Load the X register from memory AE LDX LDX $0010 AE 10 00

            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));

            this.Xreg = parseInt(_MemoryAccessor.read(memoryAddress), 16);
            this.PC += 3;
        }

        private ldyConstant(): void {
            //Load the Y register with a constant A0 LDY LDY #$04 A0 04
            this.Yreg = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16);
            this.PC += 2;
        }

        private ldyMemory(): void {
            //Load the Y register from memory AC LDY LDY $0010 AC 10 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));

            this.Yreg = parseInt(_MemoryAccessor.read(memoryAddress), 16);
            this.PC += 3;
        }

        private nop(): void {
            //No Operation EA NOP EA EA
            this.PC++;
        }

        private brk(): void {
            //Break (which is really a system call) 00 BRK 00 00
            this.isExecuting = false;
            return;
        }

        private cpx(): void {
            //Compare a byte in memory to the X reg EC CPX EC $0010 EC 10 00
            //Sets the Z (zero) flag if equal
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            var memoryValue = parseInt(_MemoryAccessor.read(memoryAddress), 16);

            if (this.Xreg == memoryValue) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }

            this.PC += 3;
        }

        private bne(): void {
            //Branch n bytes if Z flag = 0 D0 BNE D0 $EF D0 EF
            var branch = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16) % 256;
            if (this.Zflag == 0) {
                this.PC += (branch + 2);
            } else {
                this.PC += 2;
            }

        }

        private inc(): void {
            //Increment the value of a byte EE INC EE $0021 EE 21 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));

            var value = parseInt(_MemoryAccessor.read(memoryAddress));

            _MemoryAccessor.write(memoryAddress, (value + 1).toString(16));

            this.PC += 3;
        }

        private sys(): void {
            //System Call FF SYS FF
            //#$01 in X reg = print the integer stored in the Y register.
            //#$02 in X reg = print the 00-terminated string stored at the address in
            //the Y register.
            if (this.Xreg == 1) {
                _StdOut.putText(this.Yreg.toString() + " ");
            } else {
                var address = this.Yreg;
                var string = "";
                while (_MemoryAccessor.read(address.toString(16)) != "00") {

                    var dec = parseInt(_MemoryAccessor.read(address.toString(16)), 16);
                    string += String.fromCharCode(dec);
                    address++;
                }

                _StdOut.putText(string + " ");
            }

            this.PC++;
        }
    }
}
