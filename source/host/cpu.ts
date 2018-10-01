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
        private opCodes = {
            "A9": this.ldaConstant(),
            "AD": this.ldaMemory(),
            "8D": this.sta(),
            "6D": this.acd(),
            /////////////////////
            "A2": this.ldxConstant(),
            "AE": this.ldxMemory(),
            "A0": this.ldyConstant(),
            "AC": this.ldyMemory(),
            "EA": this.nop(),
            "00": this.brk(),
            "EC": this.cpx(),
            "D0": this.bne(),
            "EE": this.inc(),
            "FF": this.sys(),
        }

        constructor(public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
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

            var opCode = "A9";

            this.opCodes[opCode]();
        }

        private ldaConstant(): void {
            //Load the accumulator with a constant A9 LDA LDA #$07 A9 07
        }

        private ldaMemory(): void {
            //Load the accumulator from memory AD LDA LDA $0010 AD 10 00
        }

        private sta(): void {
            //Store the accumulator in memory 8D STA STA $0010 8D 10 00
        }

        private acd(): void {
            //Add with carry 6D ADC ADC $0010 6D 10 00
            //Adds contents of an address to
            //the contents of the accumulator and
            //keeps the result in the accumulator
        }

        private ldxConstant(): void {
            //Load the X register with a constant A2 LDX LDX #$01 A2 01
        }

        private ldxMemory(): void {
            //Load the X register from memory AE LDX LDX $0010 AE 10 00
        }

        private ldyConstant(): void {
            //Load the Y register with a constant A0 LDY LDY #$04 A0 04
        }

        private ldyMemory(): void {
            //Load the Y register from memory AC LDY LDY $0010 AC 10 00
        }

        private nop(): void {
            //No Operation EA NOP EA EA
        }

        private brk(): void {
            //Break (which is really a system call) 00 BRK 00 00
        }

        private cpx(): void {
            //Compare a byte in memory to the X reg EC CPX EC $0010 EC 10 00
            //Sets the Z (zero) flag if equal
        }

        private bne(): void {
            //Branch n bytes if Z flag = 0 D0 BNE D0 $EF D0 EF
        }

        private inc(): void {
            //Increment the value of a byte EE INC EE $0021 EE 21 00
        }

        private sys(): void {
            //System Call FF SYS FF
            //#$01 in X reg = print the integer stored in the Y register.
            //#$02 in X reg = print the 00-terminated string stored at the address in
            //the Y register.
        }
    }
}
