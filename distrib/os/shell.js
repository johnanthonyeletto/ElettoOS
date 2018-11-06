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
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.shellWhereAmI = function (args) {
                if (args.length > 0) {
                    _StdOut.putText("Usage: whereami  whereami does not take any args.");
                }
                else {
                    if (navigator.geolocation && _SarcasticMode) {
                        _StdOut.putText("Locating...");
                        _StdOut.advanceLine();
                        navigator.geolocation.getCurrentPosition(function (position) {
                            _StdOut.putText("(" + position.coords.latitude + ", " + position.coords.longitude + ")." + " I'm watching you.");
                            _StdOut.advanceLine();
                        }, function (error) {
                            _StdOut.putText("Who Knows?");
                            _StdOut.advanceLine();
                        });
                    }
                    else {
                        _StdOut.putText("Who Knows?");
                        _StdOut.advanceLine();
                    }
                }
            };
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Returns the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", " - Returns your current location.");
            this.commandList[this.commandList.length] = sc;
            // sarcastic <on | off>
            sc = new TSOS.ShellCommand(this.shellSarcastic, "sarcastic", "<on | off> - Turns sarcastic mode on or off.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Changes current status of OS.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - Loads hex program.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", " <PID> - Runs program from memory.");
            this.commandList[this.commandList.length] = sc;
            // fail
            sc = new TSOS.ShellCommand(this.shellFail, "fail", " - Causes the OS to fail.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", " - Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPS, "ps", " - Displays a list of processes.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", " - Runs all processes.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else if (cmd == "") {
                    // User just wants a new line.
                    _StdOut.advanceLine();
                    _StdOut.putText(_OsShell.promptStr);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
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
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length == 1) {
                var topic = args[0];
                var response = "No manual entry was found for " + topic;
                _OsShell.commandList.forEach(function (cmd) {
                    if (args[0] == cmd.command) {
                        response = cmd.description;
                    }
                });
                _StdOut.putText(response);
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: date  date does not take any args.");
            }
            else {
                var currentDate = new Date().toString();
                _StdOut.putText(currentDate);
            }
            _StdOut.advanceLine();
        };
        Shell.prototype.shellSarcastic = function (args) {
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
            }
            else {
                _StdOut.putText("Usage: toggleSarcasticMode <on | off>  Please supply <on | off>.");
            }
            _StdOut.advanceLine();
        };
        Shell.prototype.shellStatus = function (args) {
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
        };
        Shell.prototype.shellLoad = function (args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: load - Load does not take any args.");
            }
            else {
                // validate hex
                var hexRegex = new RegExp("^[0-9A-F ]+$");
                // REGEX replaces multiple spaces with just one space. This help on .split()
                var input = document.getElementById("taProgramInput").value.replace(/ +(?= )/g, '').trim();
                if (hexRegex.test(input)) {
                    document.getElementById("taProgramInput").style.backgroundColor = "#C8E6C9";
                    var commands = input.split(" ");
                    try {
                        var process = _ProcessManager.createProcess(commands);
                        _StdOut.putText("Program loaded. PID - " + process.PID);
                    }
                    catch (error) {
                        _StdOut.putText(error.message);
                        return;
                    }
                }
                else {
                    _StdOut.putText("Invalid Hex.");
                    document.getElementById("taProgramInput").style.backgroundColor = "#FFCDD2";
                }
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length < 1 || args.length > 1) {
                _StdOut.putText("Usage: run <PID> - run need exactly 1 arg.");
                return;
            }
            try {
                _ProcessManager.runProcess(args[0]);
            }
            catch (error) {
                _StdOut.putText(error.message);
                return;
            }
        };
        Shell.prototype.shellFail = function (args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: fail - Fail does not take any args.");
            }
            else {
                _Kernel.krnTrapError("OS Failed.");
            }
        };
        Shell.prototype.shellClearMem = function (args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: clearmem - clearmem does not take any args.");
            }
            else {
                _MemoryManager.clearPartition(0);
                _MemoryManager.clearPartition(1);
                _MemoryManager.clearPartition(2);
            }
        };
        Shell.prototype.shellPS = function (args) {
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
        };
        Shell.prototype.shellRunAll = function (args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: ps - ps does not take any args.");
            }
            else {
                _ProcessManager.runAll();
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
