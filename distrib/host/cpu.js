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
        // http://www.labouseur.com/commondocs/6502alan-instruction-set.pdf
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, IR, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (IR === void 0) { IR = "00"; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.IR = IR;
            this.isExecuting = isExecuting;
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
            //this.PC = parseInt(_MemoryAccessor.translate(this.PC.toString(16)), 16);
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
        };
        // USE PARSEINT(VALUE, 16) TO CONVERT TO DECIMAL
        Cpu.prototype.ldaConstant = function () {
            //Load the accumulator with a constant A9 LDA LDA #$07 A9 07
            this.Acc = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16);
            this.PC += 2;
        };
        Cpu.prototype.ldaMemory = function () {
            //Load the accumulator from memory AD LDA LDA $0010 AD 10 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            memoryAddress = _MemoryAccessor.translate(memoryAddress);
            this.Acc = parseInt(_MemoryAccessor.read(memoryAddress), 16);
            this.PC += 3;
        };
        Cpu.prototype.sta = function () {
            //Store the accumulator in memory 8D STA STA $0010 8D 10 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            memoryAddress = _MemoryAccessor.translate(memoryAddress);
            _MemoryAccessor.write(memoryAddress, this.Acc.toString(16));
            this.PC += 3;
        };
        Cpu.prototype.acd = function () {
            //Add with carry 6D ADC ADC $0010 6D 10 00
            //Adds contents of an address to
            //the contents of the accumulator and
            //keeps the result in the accumulator
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            memoryAddress = _MemoryAccessor.translate(memoryAddress);
            this.Acc += parseInt(_MemoryAccessor.read(memoryAddress), 16);
            this.PC += 3;
        };
        Cpu.prototype.ldxConstant = function () {
            //Load the X register with a constant A2 LDX LDX #$01 A2 01
            this.Xreg = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16);
            this.PC += 2;
        };
        Cpu.prototype.ldxMemory = function () {
            //Load the X register from memory AE LDX LDX $0010 AE 10 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            memoryAddress = _MemoryAccessor.translate(memoryAddress);
            this.Xreg = parseInt(_MemoryAccessor.read(memoryAddress), 16);
            this.PC += 3;
        };
        Cpu.prototype.ldyConstant = function () {
            //Load the Y register with a constant A0 LDY LDY #$04 A0 04
            this.Yreg = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16);
            this.PC += 2;
        };
        Cpu.prototype.ldyMemory = function () {
            //Load the Y register from memory AC LDY LDY $0010 AC 10 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            memoryAddress = _MemoryAccessor.translate(memoryAddress);
            this.Yreg = parseInt(_MemoryAccessor.read(memoryAddress), 16);
            this.PC += 3;
        };
        Cpu.prototype.nop = function () {
            //No Operation EA NOP EA EA
            this.PC++;
        };
        Cpu.prototype.brk = function () {
            //Break (which is really a system call) 00 BRK 00 00
            this.isExecuting = false;
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_BRK_IRQ, null));
            return;
        };
        Cpu.prototype.cpx = function () {
            //Compare a byte in memory to the X reg EC CPX EC $0010 EC 10 00
            //Sets the Z (zero) flag if equal
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            memoryAddress = _MemoryAccessor.translate(memoryAddress);
            var memoryValue = parseInt(_MemoryAccessor.read(memoryAddress), 16);
            if (this.Xreg == memoryValue) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
            this.PC += 3;
        };
        Cpu.prototype.bne = function () {
            //Branch n bytes if Z flag = 0 D0 BNE D0 $EF D0 EF
            var branch = parseInt(_MemoryAccessor.read((this.PC + 1).toString(16)), 16);
            if (this.Zflag == 0) {
                this.PC = (this.PC + (branch + 2)) % (256 * (_ProcessManager.running.Partition + 1));
                // if (this.PC < (_ProcessManager.running.Partition * 265) || this.PC > (_ProcessManager.running.Partition * 255)) {
                //     this.PC += (_ProcessManager.running.Partition * 256);
                //     console.log("BNE:" + this.PC + " Partition: " + _ProcessManager.running.Partition);
                // }
                this.PC = parseInt(_MemoryAccessor.translate(this.PC.toString(16)), 16);
                console.log("BNE:" + this.PC + " Partition: " + _ProcessManager.running.Partition);
            }
            else {
                this.PC += 2;
            }
        };
        Cpu.prototype.inc = function () {
            //Increment the value of a byte EE INC EE $0021 EE 21 00
            var memoryAddress = _MemoryAccessor.read((this.PC + 2).toString(16)) + _MemoryAccessor.read((this.PC + 1).toString(16));
            memoryAddress = _MemoryAccessor.translate(memoryAddress);
            var value = parseInt(_MemoryAccessor.read(memoryAddress));
            _MemoryAccessor.write(memoryAddress, (value + 1).toString(16));
            this.PC += 3;
        };
        Cpu.prototype.sys = function () {
            //System Call FF SYS FF
            //#$01 in X reg = print the integer stored in the Y register.
            //#$02 in X reg = print the 00-terminated string stored at the address in
            //the Y register.
            if (this.Xreg == 1) {
                _StdOut.putText(this.Yreg.toString() + " ");
            }
            else {
                var address = this.Yreg.toString(16);
                console.log(address);
                address = _MemoryAccessor.translate(address);
                console.log(address);
                var string = "";
                while (_MemoryAccessor.read(address) != "00") {
                    console.log(address);
                    var dec = parseInt(_MemoryAccessor.read(address), 16);
                    string += String.fromCharCode(dec);
                    address = (parseInt(address, 16) + 1).toString(16);
                }
                _StdOut.putText(string + " ");
            }
            this.PC++;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
