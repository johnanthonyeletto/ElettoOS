///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                "ver",
                "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                "help",
                "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                "shutdown",
                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                "cls",
                "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                "man",
                "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                "trace",
                "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                "rot13",
                "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                "prompt",
                "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                " - Returns the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellWhereAmI,
                "whereami",
                " - Returns your current location.");
            this.commandList[this.commandList.length] = sc;

            // sarcastic <on | off>
            sc = new ShellCommand(this.shellSarcastic,
                "sarcastic",
                "<on | off> - Turns sarcastic mode on or off.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Changes current status of OS.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                " - Loads hex program.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                " <PID> - Runs program from memory.");
            this.commandList[this.commandList.length] = sc;

            // fail
            sc = new ShellCommand(this.shellFail,
                "fail",
                " - Causes the OS to fail.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                " - Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPS,
                "ps",
                " - Displays a list of processes.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                " - Runs all processes.");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "<value> - sets the round robin quantum.");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.shellKill,
                "kill",
                "<pid> - kills a process with a specified pid.");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new ShellCommand(this.shellCreate,
                "create",
                "<filename> - creates a file with a specified name");
            this.commandList[this.commandList.length] = sc;

            // read
            sc = new ShellCommand(this.shellRead,
                "read",
                "<filename> - reads a file with a specified name");
            this.commandList[this.commandList.length] = sc;

            // write
            sc = new ShellCommand(this.shellWrite,
                "write",
                "<filename> \"data\"- writes to a specific file");
            this.commandList[this.commandList.length] = sc;

            // delete
            sc = new ShellCommand(this.shellDelete,
                "delete",
                "<filename> \"data\"- deletes a specified file.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat,
                "format",
                " - formats the disk");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.shellLS,
                "ls",
                " - lists available files (optional flag '-a')");
            this.commandList[this.commandList.length] = sc;

            // setschedule
            sc = new ShellCommand(this.shellSetSchedule,
                "setschedule",
                " <algorighm> - sets the scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                "getschedule",
                " - returns the current scheduleing algorithm.");
            this.commandList[this.commandList.length] = sc;


            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else if (cmd == "") {
                    // User just wants a new line.
                    _StdOut.advanceLine();
                    _StdOut.putText(_OsShell.promptStr);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            if (_SarcasticMode) {
                _StdOut.putText("I 'aint helping you.");
                _StdOut.advanceLine();
                _StdOut.putText("Kidding...");
                _StdOut.advanceLine();
            }
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length == 1) {
                var topic = args[0];
                var response = "No manual entry was found for " + topic;
                _OsShell.commandList.forEach(function (cmd) {
                    if (args[0] == cmd.command) {
                        response = cmd.description;
                    }
                });
                _StdOut.putText(response);
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: date  date does not take any args.");

            }
            else {
                var currentDate = new Date().toString();

                _StdOut.putText(currentDate);
            }

            _StdOut.advanceLine();

        }

        public shellWhereAmI = (args) => {
            if (args.length > 0) {
                _StdOut.putText("Usage: whereami  whereami does not take any args.");

            } else {
                if (navigator.geolocation && _SarcasticMode) {
                    _StdOut.putText("Locating...");
                    _StdOut.advanceLine();
                    navigator.geolocation.getCurrentPosition((position) => {
                        _StdOut.putText("(" + position.coords.latitude + ", " + position.coords.longitude + ")." + " I'm watching you.");
                        _StdOut.advanceLine();
                    }, (error) => {
                        _StdOut.putText("Who Knows?");
                        _StdOut.advanceLine();
                    });
                } else {
                    _StdOut.putText("Who Knows?");
                    _StdOut.advanceLine();
                }
            }


        }

        public shellSarcastic(args) {
            if (args.length == 1) {
                switch (args[0]) {
                    case "on":
                        _SarcasticMode = true;
                        _StdOut.putText("Sarcastic mode turned on. Watch out.");
                        break;
                    case "off":
                        _SarcasticMode = false;
                        _StdOut.putText("Sarcastic mode turned off. You're safe here.");
                        break;
                    default:
                        _StdOut.putText("Usage: sarcastic <on | off>  Please supply <on | off>.");
                        break;
                }
            } else {
                _StdOut.putText("Usage: toggleSarcasticMode <on | off>  Please supply <on | off>.");
            }
            _StdOut.advanceLine();
        }

        public shellStatus(args) {
            if (args.length > 0) {
                var statusIndicator = document.getElementById("systemStatusIndicator");
                (statusIndicator.innerHTML = "");
                for (var i = 0; i < args.length; i++) {
                    (statusIndicator.innerHTML += " " + args[i]);
                }
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a new status.");
            }
            _StdOut.advanceLine();
        }

        public shellLoad(args) {
            if (args.length > 1) {
                _StdOut.putText("Usage: load - Load only takes one optional argument.");
            }
            else {
                // validate hex
                var hexRegex = new RegExp("^[0-9A-F ]+$");

                // REGEX replaces multiple spaces with just one space. This help on .split()
                var input = (<HTMLInputElement>document.getElementById("taProgramInput")).value.replace(/ +(?= )/g, '').trim();

                if (hexRegex.test(input)) {

                    document.getElementById("taProgramInput").style.backgroundColor = "#C8E6C9";

                    var commands = input.split(" ");

                    try {
                        var process = _ProcessManager.createProcess(commands, ((args[0]) ? args[0] : null));
                        _StdOut.putText("Program loaded. PID - " + process.PID);
                    } catch (error) {
                        _StdOut.putText(error.message);
                        return;
                    }


                } else {
                    _StdOut.putText("Invalid Hex.");
                    document.getElementById("taProgramInput").style.backgroundColor = "#FFCDD2";
                }

            }
        }

        public shellRun(args) {
            if (args.length < 1 || args.length > 1) {
                _StdOut.putText("Usage: run <PID> - run need exactly 1 arg.");
                return;
            }

            try {
                _ProcessManager.runProcess(args[0]);
            } catch (error) {
                _StdOut.putText(error.message);
                return;
            }
        }

        public shellFail(args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: fail - Fail does not take any args.");
            }
            else {
                _Kernel.krnTrapError("OS Failed.");
            }
        }

        public shellClearMem(args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: clearmem - clearmem does not take any args.");
            }
            else {
                _MemoryManager.clearPartition(0);
                _MemoryManager.clearPartition(1);
                _MemoryManager.clearPartition(2);
            }
        }

        public shellPS(args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: ps - ps does not take any args.");
            }
            else {
                for (var i = 0; i < _ProcessManager.residentQueue.getSize(); i++) {
                    var currentProcess = _ProcessManager.residentQueue.dequeue();
                    _StdOut.putText("PID - " + currentProcess.PID);
                    _StdOut.advanceLine();
                    _ProcessManager.residentQueue.enqueue(currentProcess);

                }
            }
        }

        public shellRunAll(args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: ps - ps does not take any args.");
            }
            else {
                _ProcessManager.runAll();
            }
        }

        public shellQuantum(args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: quantum <value> - quantum expects one argument.");
                return;
            } else if (args[0] < 1) {
                _StdOut.putText("Quantum must be >= 1");
                return;
            } else {
                _Scheduler.quantum = args[0];
                _StdOut.putText("Quantum set to " + args[0]);
            }
        }

        public shellKill(args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: kill <pid> - kill expects one argument.");
                return;
            } else {
                try {
                    _ProcessManager.killProcess(args[0]);
                    _StdOut.putText("Process killed.");
                } catch (error) {
                    _StdOut.putText(error.message);
                }
            }
        }

        public shellCreate(args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: create <filename> - create expects a filename.");
                return;
            }

            if (args[0].length > 56) {
                _StdOut.putText("The file name must be 56 characters or less.");
                return;
            }

            let status = _krnDiskDriver.createFile(args[0]);
            if (status == _krnDiskDriver.SUCCESS) {
                _StdOut.putText(args[0] + " created successfully.");
            }
            else if (status == _krnDiskDriver.FILE_NAME_EXISTS) {
                _StdOut.putText("File name already exists.");
            }
            else if (status == _krnDiskDriver.DISK_FULL) {
                _StdOut.putText("Could not create " + args[0] + " no more space on disk.");
            }

        }

        public shellRead(args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: read <filename> - read expects a filename.");
                return;
            }

            let status = _krnDiskDriver.readFile(args[0]);
            if (status == _krnDiskDriver.FILE_NAME_NO_EXIST || args[0].includes("$")) {
                _StdOut.putText(args[0] + " does not exist.");
                return;
            }
            // Print out file
            _StdOut.putText(status.fileData.join(""));
        }

        public shellWrite(args) {
            if (args.length < 2) {
                _StdOut.putText("Usage: write <filename> \"<text>\"  Please supply a filename and text surrounded by quotes.");
                return;
            }

            let data = "";
            for (var i = 1; i < args.length; i++) {
                data += args[i] + " ";
            }

            if (data.charAt(0) != "\"" || data.charAt(data.length - 2) != "\"") {
                _StdOut.putText("Usage: write <filename> \"<text>\"  Please supply a filename and text surrounded by quotes.");
                return;
            }

            data = data.trim();

            let status = _krnDiskDriver.writeToDisk(args[0], data);
            if (status == _krnDiskDriver.SUCCESS) {
                _StdOut.putText("Success: wrote to " + args[0]);
            } else if (status == _krnDiskDriver.FILE_NAME_NO_EXIST) {
                // Just create the file if it doesn't exist. 
                // This is like doing: nano <filename>. It still opens a file for you.
                _OsShell.shellCreate([args[0]]);
                _OsShell.shellWrite(args);
            } else if (args[0].includes("$")) {
                _StdOut.putText(args[0] + " does not exist.");
            }
            else if (status == _krnDiskDriver.DISK_FULL) {
                _StdOut.putText("Unable to write. Not enough disk space.");
            }
        }

        public shellDelete(args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: delete <filename> - you must provide a filename to delete.");
                return;
            }

            if (!args[0].includes("$")) {
                _krnDiskDriver.deleteFile(args[0]);
            }
            _StdOut.putText("Successfully deleted " + args[0]);


        }

        public shellFormat(args) {
            if (args != 0) {
                _StdOut.putText("Usage: format - format does not take any arguments.");
            }
            _krnDiskDriver.formatDisk();
        }

        public shellLS(args) {
            var files = _krnDiskDriver.getAllFiles(args[0]);

            for (var i = 0; i < files.length; i++) {
                _StdOut.putText(files[i] + "  ");
            }
        }

        public shellSetSchedule(args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: setschedule <algorithm> - set schedule expects exactly one argument..");
                return;
            }

            switch (args[0]) {
                case 'rr':
                    SCHEDULING_ALGORITHM = ROUND_ROBIN;
                    _Scheduler.quantum = 6;
                    _StdOut.putText("Scheule changed to round robin with quantum 6.");
                    break;
                case 'fcfs':
                    SCHEDULING_ALGORITHM = FCFS;
                    _Scheduler.quantum = 1000;
                    _StdOut.putText("Scheule changed to first come, first served.");
                    break;
                case 'priority':
                    SCHEDULING_ALGORITHM = PRIORITY;
                    _Scheduler.quantum = 6;
                    _StdOut.putText("Scheule changed to priority.");
                    break;
                default:
                    _StdOut.putText(args[0] + " is not a valid scheduleing algorithm.");
                    break;
            }
        }

        public shellGetSchedule(args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: getschedule - get schedule does not take any arguments.");
                return;
            }

            switch (SCHEDULING_ALGORITHM) {
                case ROUND_ROBIN:
                    _StdOut.putText("round robin quantum " + _Scheduler.quantum);
                    break;
                case FCFS:
                    _StdOut.putText("first come, first served");
                    break;
                case PRIORITY:
                    _StdOut.putText("priority.");
                    break;
                default:
                    //  We should never get here
                    _StdOut.putText("Uh oh, no algorithm set.");
                    break;
            }
        }
    }
}
