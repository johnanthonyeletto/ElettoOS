///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, commandHistory, commandHistoryPointer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (commandHistory === void 0) { commandHistory = []; }
            if (commandHistoryPointer === void 0) { commandHistoryPointer = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.commandHistory = commandHistory;
            this.commandHistoryPointer = commandHistoryPointer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.commandHistory.push(this.buffer);
                    // Limit command recall to 100 commands. This prevents slow computers like mine from crying.
                    if (this.commandHistory.length > 100) {
                        var tempCommandHistory = [];
                        for (var i = (this.commandHistory.length - 100); i < this.commandHistory.length; i++) {
                            tempCommandHistory.push(this.commandHistory[i]);
                        }
                        this.commandHistory = tempCommandHistory;
                    }
                    this.commandHistoryPointer = this.commandHistory.length;
                    console.log(this.commandHistoryPointer);
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    // Backspace
                    this.backspace();
                }
                else if (chr === String.fromCharCode(9)) {
                    // Tab
                    this.commandComplete();
                }
                else if (chr === String.fromCharCode(38)) {
                    // upArrow
                    this.arrowUp();
                }
                else if (chr === String.fromCharCode(40)) {
                    // downArrow
                    this.arrowDown();
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.clearCurrentLine = function () {
            // Clear current line
            var lineHeight = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            this.currentXPosition = 0;
            _DrawingContext.clearRect(0, this.currentYPosition - lineHeight + 5, _Canvas.width, lineHeight * 2);
        };
        Console.prototype.backspace = function () {
            this.clearCurrentLine();
            // Redraw buffer - 1
            this.putText(_OsShell.promptStr);
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
            this.putText(this.buffer);
        };
        Console.prototype.commandComplete = function () {
            var currentBuffer = this.buffer;
            var matchingCommand = this.buffer;
            _OsShell.commandList.forEach(function (command) {
                if (command.command.substring(0, currentBuffer.length) == currentBuffer) {
                    matchingCommand = command.command;
                }
            });
            this.clearCurrentLine();
            this.putText(_OsShell.promptStr);
            this.buffer = matchingCommand;
            this.putText(matchingCommand);
        };
        Console.prototype.arrowUp = function () {
            if (this.commandHistoryPointer > 0) {
                this.commandHistoryPointer--;
            }
            this.clearCurrentLine();
            this.putText(_OsShell.promptStr);
            this.buffer = this.commandHistory[this.commandHistoryPointer];
            this.putText(this.buffer);
        };
        Console.prototype.arrowDown = function () {
            if (this.commandHistoryPointer < this.commandHistory.length - 1) {
                this.commandHistoryPointer++;
            }
            else {
                this.clearCurrentLine();
                this.putText(_OsShell.promptStr);
                return;
            }
            this.clearCurrentLine();
            this.putText(_OsShell.promptStr);
            this.buffer = this.commandHistory[this.commandHistoryPointer];
            this.putText(this.buffer);
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            var lineHeight = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            if (this.currentYPosition + lineHeight < _Canvas.height) {
                // No need to scroll. Just update Y position.
                this.currentYPosition += lineHeight;
            }
            else {
                // Uh oh. It's time to scroll.
                var canvasLineData = [];
                for (var i = 0; i < _Canvas.height; i += lineHeight) {
                    // Collect data for each line.
                    canvasLineData.push(_DrawingContext.getImageData(0, i, _Canvas.width, lineHeight));
                }
                // Clear screen.
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                for (var i = 0; i < canvasLineData.length; i++) {
                    // Redraw the console line by line.
                    _DrawingContext.putImageData(canvasLineData[i], 0, (lineHeight * (i - 1)), 0, 0, _Canvas.width, _Canvas.height);
                }
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
