///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("taHostLog")).value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement>document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            (document.getElementById("systemStatusIndicator").innerHTML = " Running.");

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... Create and initialize the Memory (because it's part of the hardware)  ...
            _Memory = new Memory();
            _Memory.init();

            _MemoryAccessor = new MemoryAccessor();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

            TSOS.Control.updateMemoryDisplay();
            TSOS.Control.updateCPUDisplay();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            (document.getElementById("systemStatusIndicator").innerHTML = " OS Halted.");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnFill12DONE_Click(btn): void {
            var textArea = (document.getElementById('taProgramInput'));
            textArea.innerHTML = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 A2 02 A0 42 FF 00";
        }

        public static hostBtnFillLoops_Click(btn): void {
            var textArea = (document.getElementById('taProgramInput'));
            textArea.innerHTML = "A9 00 8D EC 00 A9 00 8D EC 00 A9 00 8D ED 00 A9 00 8D ED 00 A9 00 8D EE 00 A9 00 8D EF 00 AD ED 00 8D FF 00 AE FF 00 A9 00 8D FF 00 EC FF 00 D0 BA AD EC 00 8D FF 00 A9 01 6D FF 00 8D EC 00 AD EC 00 8D FF 00 AE FF 00 A9 03 8D FF 00 EC FF 00 D0 05 A9 01 8D ED 00 A9 00 8D EE 00 A9 00 8D EF 00 AD EF 00 8D FF 00 AE FF 00 A9 00 8D FF 00 EC FF 00 D0 49 AD EE 00 8D FF 00 A9 01 6D FF 00 8D EE 00 AD EE 00 8D FF 00 AE FF 00 A9 02 8D FF 00 EC FF 00 D0 05 A9 01 8D EF 00 A9 F8 8D FF 00 A2 02 AC FF 00 FF AD EE 00 A2 01 8D FF 00 AC FF 00 FF A9 00 8D FF 00 A2 01 EC FF 00 D0 A4 A9 F1 8D FF 00 A2 02 AC FF 00 FF AD EC 00 A2 01 8D FF 00 AC FF 00 FF A9 EE 8D FF 00 A2 02 AC FF 00 FF A9 00 8D FF 00 A2 01 EC FF 00 D0 33 00 00 00 20 20 00 20 6F 75 74 65 72 00 20 69 6E 6E 65 72 00 00";
        }

        public static updateMemoryDisplay(): void {
            var table = (<HTMLTableElement>document.getElementById('memoryTable'));
            table.innerHTML = "";

            var row;
            for (var i = 0; i < _Memory.memoryArray.length; i++) {
                if (i % 8 == 0) {
                    row = table.insertRow();
                    var titleCell = row.insertCell();
                    titleCell.innerHTML = "0x" + (i).toString(16).toUpperCase();
                    titleCell.style.fontWeight = "bold";
                }
                var cell = row.insertCell();
                cell.innerHTML = _Memory.memoryArray[i];
            }
        }

        public static updateCPUDisplay(): void {
            var table = (<HTMLTableElement>document.getElementById('cpuTable'));
            var tableBody = (document.getElementById('cpuTableBody'));

            tableBody.innerHTML = "";

            while (table.rows.length > 1) {
                table.deleteRow(table.rows.length - 1);
            }

            var row = table.insertRow();

            var cell;

            cell = row.insertCell();
            cell.innerHTML = _CPU.PC.toString(16).toUpperCase();

            cell = row.insertCell();
            cell.innerHTML = _CPU.IR;

            cell = row.insertCell();
            cell.innerHTML = _CPU.Acc;

            cell = row.insertCell();
            cell.innerHTML = _CPU.Xreg;

            cell = row.insertCell();
            cell.innerHTML = _CPU.Yreg;

            cell = row.insertCell();
            cell.innerHTML = _CPU.Zflag;
        }

        public static updateProcessDisplay(): void {
            var table = (<HTMLTableElement>document.getElementById('processTable'));
            var tableBody = (document.getElementById('processTableBody'));

            tableBody.innerHTML = "";

            while (table.rows.length > 1) {
                table.deleteRow(table.rows.length - 1);
            }

            if (_ProcessManager.running != null) {
                var row = table.insertRow();

                var cell;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.PID;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.Partition;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.PC;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.Acc;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.Xreg;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.Yreg;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.Zflag;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.State;

                cell = row.insertCell();
                cell.innerHTML = _ProcessManager.running.Location;
            }

            for (var i = 0; i < _ProcessManager.readyQueue.getSize(); i++) {
                var currentProcess = _ProcessManager.readyQueue.dequeue();

                var row = table.insertRow();

                var cell;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.PID;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Partition;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.PC;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Acc;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Xreg;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Yreg;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Zflag;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.State;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Location;

                _ProcessManager.readyQueue.enqueue(currentProcess);
            }

            for (var i = 0; i < _ProcessManager.residentQueue.length; i++) {
                var currentProcess = _ProcessManager.residentQueue[i];

                if (currentProcess == null) {
                    continue;
                }

                var row = table.insertRow();

                var cell;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.PID;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Partition;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.PC;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Acc;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Xreg;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Yreg;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Zflag;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.State;

                cell = row.insertCell();
                cell.innerHTML = currentProcess.Location;

                //_ProcessManager.residentQueue.enqueue(currentProcess);
            }
        }
    }
}
