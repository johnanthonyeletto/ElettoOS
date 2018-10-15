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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            // http://www.labouseur.com/commondocs/6502alan-instruction-set.pdf
            this.opCodes = {
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
                "FF": this.sys()
            };
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            var opCode = "A9";
            this.opCodes[opCode]();
        };
        // USE PARSEINT(VALUE, 16) TO CONVERT TO DECIMAL
        Cpu.prototype.ldaConstant = function () {
            //Load the accumulator with a constant A9 LDA LDA #$07 A9 07
        };
        Cpu.prototype.ldaMemory = function () {
            //Load the accumulator from memory AD LDA LDA $0010 AD 10 00
        };
        Cpu.prototype.sta = function () {
            //Store the accumulator in memory 8D STA STA $0010 8D 10 00
        };
        Cpu.prototype.acd = function () {
            //Add with carry 6D ADC ADC $0010 6D 10 00
            //Adds contents of an address to
            //the contents of the accumulator and
            //keeps the result in the accumulator
        };
        Cpu.prototype.ldxConstant = function () {
            //Load the X register with a constant A2 LDX LDX #$01 A2 01
        };
        Cpu.prototype.ldxMemory = function () {
            //Load the X register from memory AE LDX LDX $0010 AE 10 00
        };
        Cpu.prototype.ldyConstant = function () {
            //Load the Y register with a constant A0 LDY LDY #$04 A0 04
        };
        Cpu.prototype.ldyMemory = function () {
            //Load the Y register from memory AC LDY LDY $0010 AC 10 00
        };
        Cpu.prototype.nop = function () {
            //No Operation EA NOP EA EA
        };
        Cpu.prototype.brk = function () {
            //Break (which is really a system call) 00 BRK 00 00
            return;
        };
        Cpu.prototype.cpx = function () {
            //Compare a byte in memory to the X reg EC CPX EC $0010 EC 10 00
            //Sets the Z (zero) flag if equal
        };
        Cpu.prototype.bne = function () {
            //Branch n bytes if Z flag = 0 D0 BNE D0 $EF D0 EF
        };
        Cpu.prototype.inc = function () {
            //Increment the value of a byte EE INC EE $0021 EE 21 00
        };
        Cpu.prototype.sys = function () {
            //System Call FF SYS FF
            //#$01 in X reg = print the integer stored in the Y register.
            //#$02 in X reg = print the 00-terminated string stored at the address in
            //the Y register.
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
