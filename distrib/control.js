/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "TSOS"; // 'cause Bob and I were at a loss for a better name.
var APP_VERSION = "0.07"; // What did you expect?
var CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue; // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue = null; // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers = null; // when clearly 'any' is not what we want. There is likely a better way, but what is it?
// Standard input and output
var _StdIn; // Same "to null or not to null" issue as above.
var _StdOut;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
/* ----------------- *
 * CanvasText.ts   *
 *
 * Downloaded from http://www.federated.com/~jim/canvastext.
 *
 * This code is released to the public domain by Jim Studt, 2007.
 * He may keep some sort of up to date copy at http://www.federated.com/~jim/canvastext/
 *
 * Modifications by Alan G. Labouseur:
 *  - fixed comma
 *  - added semi-colon
 *  - renamed 'letter' object to 'symbol'
 *
 * Port to TypeScript by Bob Nisco in 2014.
 *
 * Note: You could theoretically make up your own letters and symbols for your OS.
 *       That might be fun.
 * ----------------- */
var TSOS;
/* ----------------- *
 * CanvasText.ts   *
 *
 * Downloaded from http://www.federated.com/~jim/canvastext.
 *
 * This code is released to the public domain by Jim Studt, 2007.
 * He may keep some sort of up to date copy at http://www.federated.com/~jim/canvastext/
 *
 * Modifications by Alan G. Labouseur:
 *  - fixed comma
 *  - added semi-colon
 *  - renamed 'letter' object to 'symbol'
 *
 * Port to TypeScript by Bob Nisco in 2014.
 *
 * Note: You could theoretically make up your own letters and symbols for your OS.
 *       That might be fun.
 * ----------------- */
(function (TSOS) {
    var CanvasTextFunctions = /** @class */ (function () {
        function CanvasTextFunctions() {
        }
        CanvasTextFunctions.letter = function (ch) {
            return CanvasTextFunctions.symbols[ch];
        };
        CanvasTextFunctions.ascent = function (font, size) {
            return size;
        };
        CanvasTextFunctions.descent = function (font, size) {
            return 7.0 * size / 25.0;
        };
        CanvasTextFunctions.measure = function (font, size, str) {
            var total = 0;
            var len = str.length;
            for (var i = 0; i < len; i++) {
                var c = CanvasTextFunctions.letter(str.charAt(i));
                if (c) {
                    total += c.width * size / 25.0;
                }
            }
            return total;
        };
        CanvasTextFunctions.draw = function (ctx, font, size, x, y, str) {
            var total = 0;
            var len = str.length;
            var mag = size / 25.0;
            ctx.save();
            ctx.lineCap = "round";
            ctx.lineWidth = 2.0 * mag;
            ctx.strokeStyle = "black";
            for (var i = 0; i < len; i++) {
                var c = CanvasTextFunctions.letter(str.charAt(i));
                if (!c) {
                    continue;
                }
                ctx.beginPath();
                var penUp = true;
                var needStroke = 0;
                for (var j = 0; j < c.points.length; j++) {
                    var a = c.points[j];
                    if (a[0] === -1 && a[1] === -1) {
                        penUp = true;
                        continue;
                    }
                    if (penUp) {
                        ctx.moveTo(x + a[0] * mag, y - a[1] * mag);
                        penUp = false;
                    }
                    else {
                        ctx.lineTo(x + a[0] * mag, y - a[1] * mag);
                    }
                }
                ctx.stroke();
                x += c.width * mag;
            }
            ctx.restore();
            return total;
        };
        CanvasTextFunctions.enable = function (ctx) {
            ctx.drawText = function (font, size, x, y, text) { return CanvasTextFunctions.draw(ctx, font, size, x, y, text); };
            ctx.measureText = function (font, size, text) { return CanvasTextFunctions.measure(font, size, text); };
            ctx.fontAscent = function (font, size) { return CanvasTextFunctions.ascent(font, size); };
            ctx.fontDescent = function (font, size) { return CanvasTextFunctions.descent(font, size); };
            ctx.drawTextRight = function (font, size, x, y, text) {
                var w = CanvasTextFunctions.measure(font, size, text);
                return CanvasTextFunctions.draw(ctx, font, size, x - w, y, text);
            };
            ctx.drawTextCenter = function (font, size, x, y, text) {
                var w = CanvasTextFunctions.measure(font, size, text);
                return CanvasTextFunctions.draw(ctx, font, size, x - w / 2, y, text);
            };
        };
        CanvasTextFunctions.symbols = {
            ' ': { width: 16, points: [] },
            '!': { width: 10, points: [[5, 21], [5, 7], [-1, -1], [5, 2], [4, 1], [5, 0], [6, 1], [5, 2]] },
            '"': { width: 16, points: [[4, 21], [4, 14], [-1, -1], [12, 21], [12, 14]] },
            '#': { width: 21, points: [[11, 25], [4, -7], [-1, -1], [17, 25], [10, -7], [-1, -1], [4, 12], [18, 12], [-1, -1], [3, 6], [17, 6]] },
            '$': { width: 20, points: [[8, 25], [8, -4], [-1, -1], [12, 25], [12, -4], [-1, -1], [17, 18], [15, 20], [12, 21], [8, 21], [5, 20], [3, 18], [3, 16], [4, 14], [5, 13], [7, 12], [13, 10], [15, 9], [16, 8], [17, 6], [17, 3], [15, 1], [12, 0], [8, 0], [5, 1], [3, 3]] },
            '%': { width: 24, points: [[21, 21], [3, 0], [-1, -1], [8, 21], [10, 19], [10, 17], [9, 15], [7, 14], [5, 14], [3, 16], [3, 18], [4, 20], [6, 21], [8, 21], [10, 20], [13, 19], [16, 19], [19, 20], [21, 21], [-1, -1], [17, 7], [15, 6], [14, 4], [14, 2], [16, 0], [18, 0], [20, 1], [21, 3], [21, 5], [19, 7], [17, 7]] },
            '&': { width: 26, points: [[23, 12], [23, 13], [22, 14], [21, 14], [20, 13], [19, 11], [17, 6], [15, 3], [13, 1], [11, 0], [7, 0], [5, 1], [4, 2], [3, 4], [3, 6], [4, 8], [5, 9], [12, 13], [13, 14], [14, 16], [14, 18], [13, 20], [11, 21], [9, 20], [8, 18], [8, 16], [9, 13], [11, 10], [16, 3], [18, 1], [20, 0], [22, 0], [23, 1], [23, 2]] },
            '\'': { width: 10, points: [[5, 19], [4, 20], [5, 21], [6, 20], [6, 18], [5, 16], [4, 15]] },
            '(': { width: 14, points: [[11, 25], [9, 23], [7, 20], [5, 16], [4, 11], [4, 7], [5, 2], [7, -2], [9, -5], [11, -7]] },
            ')': { width: 14, points: [[3, 25], [5, 23], [7, 20], [9, 16], [10, 11], [10, 7], [9, 2], [7, -2], [5, -5], [3, -7]] },
            '*': { width: 16, points: [[8, 21], [8, 9], [-1, -1], [3, 18], [13, 12], [-1, -1], [13, 18], [3, 12]] },
            '+': { width: 26, points: [[13, 18], [13, 0], [-1, -1], [4, 9], [22, 9]] },
            '-': { width: 26, points: [[4, 9], [22, 9]] },
            '.': { width: 10, points: [[5, 2], [4, 1], [5, 0], [6, 1], [5, 2]] },
            '/': { width: 22, points: [[20, 25], [2, -7]] },
            '0': { width: 20, points: [[9, 21], [6, 20], [4, 17], [3, 12], [3, 9], [4, 4], [6, 1], [9, 0], [11, 0], [14, 1], [16, 4], [17, 9], [17, 12], [16, 17], [14, 20], [11, 21], [9, 21]] },
            '1': { width: 20, points: [[6, 17], [8, 18], [11, 21], [11, 0]] },
            '2': { width: 20, points: [[4, 16], [4, 17], [5, 19], [6, 20], [8, 21], [12, 21], [14, 20], [15, 19], [16, 17], [16, 15], [15, 13], [13, 10], [3, 0], [17, 0]] },
            '3': { width: 20, points: [[5, 21], [16, 21], [10, 13], [13, 13], [15, 12], [16, 11], [17, 8], [17, 6], [16, 3], [14, 1], [11, 0], [8, 0], [5, 1], [4, 2], [3, 4]] },
            '4': { width: 20, points: [[13, 21], [3, 7], [18, 7], [-1, -1], [13, 21], [13, 0]] },
            '5': { width: 20, points: [[15, 21], [5, 21], [4, 12], [5, 13], [8, 14], [11, 14], [14, 13], [16, 11], [17, 8], [17, 6], [16, 3], [14, 1], [11, 0], [8, 0], [5, 1], [4, 2], [3, 4]] },
            '6': { width: 20, points: [[16, 18], [15, 20], [12, 21], [10, 21], [7, 20], [5, 17], [4, 12], [4, 7], [5, 3], [7, 1], [10, 0], [11, 0], [14, 1], [16, 3], [17, 6], [17, 7], [16, 10], [14, 12], [11, 13], [10, 13], [7, 12], [5, 10], [4, 7]] },
            '7': { width: 20, points: [[17, 21], [7, 0], [-1, -1], [3, 21], [17, 21]] },
            '8': { width: 20, points: [[8, 21], [5, 20], [4, 18], [4, 16], [5, 14], [7, 13], [11, 12], [14, 11], [16, 9], [17, 7], [17, 4], [16, 2], [15, 1], [12, 0], [8, 0], [5, 1], [4, 2], [3, 4], [3, 7], [4, 9], [6, 11], [9, 12], [13, 13], [15, 14], [16, 16], [16, 18], [15, 20], [12, 21], [8, 21]] },
            '9': { width: 20, points: [[16, 14], [15, 11], [13, 9], [10, 8], [9, 8], [6, 9], [4, 11], [3, 14], [3, 15], [4, 18], [6, 20], [9, 21], [10, 21], [13, 20], [15, 18], [16, 14], [16, 9], [15, 4], [13, 1], [10, 0], [8, 0], [5, 1], [4, 3]] },
            ':': { width: 10, points: [[5, 14], [4, 13], [5, 12], [6, 13], [5, 14], [-1, -1], [5, 2], [4, 1], [5, 0], [6, 1], [5, 2]] },
            ',': { width: 10, points: [[6, 1], [5, 0], [4, 1], [5, 2], [6, 1], [6, -1], [5, -3], [4, -4]] },
            ';': { width: 10, points: [[5, 14], [4, 13], [5, 12], [6, 13], [5, 14], [-1, -1], [6, 1], [5, 0], [4, 1], [5, 2], [6, 1], [6, -1], [5, -3], [4, -4]] },
            '<': { width: 24, points: [[20, 18], [4, 9], [20, 0]] },
            '=': { width: 26, points: [[4, 12], [22, 12], [-1, -1], [4, 6], [22, 6]] },
            '>': { width: 24, points: [[4, 18], [20, 9], [4, 0]] },
            '?': { width: 18, points: [[3, 16], [3, 17], [4, 19], [5, 20], [7, 21], [11, 21], [13, 20], [14, 19], [15, 17], [15, 15], [14, 13], [13, 12], [9, 10], [9, 7], [-1, -1], [9, 2], [8, 1], [9, 0], [10, 1], [9, 2]] },
            '@': { width: 27, points: [[18, 13], [17, 15], [15, 16], [12, 16], [10, 15], [9, 14], [8, 11], [8, 8], [9, 6], [11, 5], [14, 5], [16, 6], [17, 8], [-1, -1], [12, 16], [10, 14], [9, 11], [9, 8], [10, 6], [11, 5], [-1, -1], [18, 16], [17, 8], [17, 6], [19, 5], [21, 5], [23, 7], [24, 10], [24, 12], [23, 15], [22, 17], [20, 19], [18, 20], [15, 21], [12, 21], [9, 20], [7, 19], [5, 17], [4, 15], [3, 12], [3, 9], [4, 6], [5, 4], [7, 2], [9, 1], [12, 0], [15, 0], [18, 1], [20, 2], [21, 3], [-1, -1], [19, 16], [18, 8], [18, 6], [19, 5]] },
            'A': { width: 18, points: [[9, 21], [1, 0], [-1, -1], [9, 21], [17, 0], [-1, -1], [4, 7], [14, 7]] },
            'B': { width: 21, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [13, 21], [16, 20], [17, 19], [18, 17], [18, 15], [17, 13], [16, 12], [13, 11], [-1, -1], [4, 11], [13, 11], [16, 10], [17, 9], [18, 7], [18, 4], [17, 2], [16, 1], [13, 0], [4, 0]] },
            'C': { width: 21, points: [[18, 16], [17, 18], [15, 20], [13, 21], [9, 21], [7, 20], [5, 18], [4, 16], [3, 13], [3, 8], [4, 5], [5, 3], [7, 1], [9, 0], [13, 0], [15, 1], [17, 3], [18, 5]] },
            'D': { width: 21, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [11, 21], [14, 20], [16, 18], [17, 16], [18, 13], [18, 8], [17, 5], [16, 3], [14, 1], [11, 0], [4, 0]] },
            'E': { width: 19, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [17, 21], [-1, -1], [4, 11], [12, 11], [-1, -1], [4, 0], [17, 0]] },
            'F': { width: 18, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [17, 21], [-1, -1], [4, 11], [12, 11]] },
            'G': { width: 21, points: [[18, 16], [17, 18], [15, 20], [13, 21], [9, 21], [7, 20], [5, 18], [4, 16], [3, 13], [3, 8], [4, 5], [5, 3], [7, 1], [9, 0], [13, 0], [15, 1], [17, 3], [18, 5], [18, 8], [-1, -1], [13, 8], [18, 8]] },
            'H': { width: 22, points: [[4, 21], [4, 0], [-1, -1], [18, 21], [18, 0], [-1, -1], [4, 11], [18, 11]] },
            'I': { width: 8, points: [[4, 21], [4, 0]] },
            'J': { width: 16, points: [[12, 21], [12, 5], [11, 2], [10, 1], [8, 0], [6, 0], [4, 1], [3, 2], [2, 5], [2, 7]] },
            'K': { width: 21, points: [[4, 21], [4, 0], [-1, -1], [18, 21], [4, 7], [-1, -1], [9, 12], [18, 0]] },
            'L': { width: 17, points: [[4, 21], [4, 0], [-1, -1], [4, 0], [16, 0]] },
            'M': { width: 24, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [12, 0], [-1, -1], [20, 21], [12, 0], [-1, -1], [20, 21], [20, 0]] },
            'N': { width: 22, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [18, 0], [-1, -1], [18, 21], [18, 0]] },
            'O': { width: 22, points: [[9, 21], [7, 20], [5, 18], [4, 16], [3, 13], [3, 8], [4, 5], [5, 3], [7, 1], [9, 0], [13, 0], [15, 1], [17, 3], [18, 5], [19, 8], [19, 13], [18, 16], [17, 18], [15, 20], [13, 21], [9, 21]] },
            'P': { width: 21, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [13, 21], [16, 20], [17, 19], [18, 17], [18, 14], [17, 12], [16, 11], [13, 10], [4, 10]] },
            'Q': { width: 22, points: [[9, 21], [7, 20], [5, 18], [4, 16], [3, 13], [3, 8], [4, 5], [5, 3], [7, 1], [9, 0], [13, 0], [15, 1], [17, 3], [18, 5], [19, 8], [19, 13], [18, 16], [17, 18], [15, 20], [13, 21], [9, 21], [-1, -1], [12, 4], [18, -2]] },
            'R': { width: 21, points: [[4, 21], [4, 0], [-1, -1], [4, 21], [13, 21], [16, 20], [17, 19], [18, 17], [18, 15], [17, 13], [16, 12], [13, 11], [4, 11], [-1, -1], [11, 11], [18, 0]] },
            'S': { width: 20, points: [[17, 18], [15, 20], [12, 21], [8, 21], [5, 20], [3, 18], [3, 16], [4, 14], [5, 13], [7, 12], [13, 10], [15, 9], [16, 8], [17, 6], [17, 3], [15, 1], [12, 0], [8, 0], [5, 1], [3, 3]] },
            'T': { width: 16, points: [[8, 21], [8, 0], [-1, -1], [1, 21], [15, 21]] },
            'U': { width: 22, points: [[4, 21], [4, 6], [5, 3], [7, 1], [10, 0], [12, 0], [15, 1], [17, 3], [18, 6], [18, 21]] },
            'V': { width: 18, points: [[1, 21], [9, 0], [-1, -1], [17, 21], [9, 0]] },
            'W': { width: 24, points: [[2, 21], [7, 0], [-1, -1], [12, 21], [7, 0], [-1, -1], [12, 21], [17, 0], [-1, -1], [22, 21], [17, 0]] },
            'X': { width: 20, points: [[3, 21], [17, 0], [-1, -1], [17, 21], [3, 0]] },
            'Y': { width: 18, points: [[1, 21], [9, 11], [9, 0], [-1, -1], [17, 21], [9, 11]] },
            'Z': { width: 20, points: [[17, 21], [3, 0], [-1, -1], [3, 21], [17, 21], [-1, -1], [3, 0], [17, 0]] },
            '[': { width: 14, points: [[4, 25], [4, -7], [-1, -1], [5, 25], [5, -7], [-1, -1], [4, 25], [11, 25], [-1, -1], [4, -7], [11, -7]] },
            '\\': { width: 22, points: [[20, -7], [2, 25]] },
            ']': { width: 14, points: [[9, 25], [9, -7], [-1, -1], [10, 25], [10, -7], [-1, -1], [3, 25], [10, 25], [-1, -1], [3, -7], [10, -7]] },
            '^': { width: 16, points: [[2, 10], [8, 18], [14, 10]] },
            '_': { width: 16, points: [[0, -2], [16, -2]] },
            '`': { width: 10, points: [[6, 21], [5, 20], [4, 18], [4, 16], [5, 15], [6, 16], [5, 17]] },
            'a': { width: 19, points: [[15, 14], [15, 0], [-1, -1], [15, 11], [13, 13], [11, 14], [8, 14], [6, 13], [4, 11], [3, 8], [3, 6], [4, 3], [6, 1], [8, 0], [11, 0], [13, 1], [15, 3]] },
            'b': { width: 19, points: [[4, 21], [4, 0], [-1, -1], [4, 11], [6, 13], [8, 14], [11, 14], [13, 13], [15, 11], [16, 8], [16, 6], [15, 3], [13, 1], [11, 0], [8, 0], [6, 1], [4, 3]] },
            'c': { width: 18, points: [[15, 11], [13, 13], [11, 14], [8, 14], [6, 13], [4, 11], [3, 8], [3, 6], [4, 3], [6, 1], [8, 0], [11, 0], [13, 1], [15, 3]] },
            'd': { width: 19, points: [[15, 21], [15, 0], [-1, -1], [15, 11], [13, 13], [11, 14], [8, 14], [6, 13], [4, 11], [3, 8], [3, 6], [4, 3], [6, 1], [8, 0], [11, 0], [13, 1], [15, 3]] },
            'e': { width: 18, points: [[3, 8], [15, 8], [15, 10], [14, 12], [13, 13], [11, 14], [8, 14], [6, 13], [4, 11], [3, 8], [3, 6], [4, 3], [6, 1], [8, 0], [11, 0], [13, 1], [15, 3]] },
            'f': { width: 12, points: [[10, 21], [8, 21], [6, 20], [5, 17], [5, 0], [-1, -1], [2, 14], [9, 14]] },
            'g': { width: 19, points: [[15, 14], [15, -2], [14, -5], [13, -6], [11, -7], [8, -7], [6, -6], [-1, -1], [15, 11], [13, 13], [11, 14], [8, 14], [6, 13], [4, 11], [3, 8], [3, 6], [4, 3], [6, 1], [8, 0], [11, 0], [13, 1], [15, 3]] },
            'h': { width: 19, points: [[4, 21], [4, 0], [-1, -1], [4, 10], [7, 13], [9, 14], [12, 14], [14, 13], [15, 10], [15, 0]] },
            'i': { width: 8, points: [[3, 21], [4, 20], [5, 21], [4, 22], [3, 21], [-1, -1], [4, 14], [4, 0]] },
            'j': { width: 10, points: [[5, 21], [6, 20], [7, 21], [6, 22], [5, 21], [-1, -1], [6, 14], [6, -3], [5, -6], [3, -7], [1, -7]] },
            'k': { width: 17, points: [[4, 21], [4, 0], [-1, -1], [14, 14], [4, 4], [-1, -1], [8, 8], [15, 0]] },
            'l': { width: 8, points: [[4, 21], [4, 0]] },
            'm': { width: 30, points: [[4, 14], [4, 0], [-1, -1], [4, 10], [7, 13], [9, 14], [12, 14], [14, 13], [15, 10], [15, 0], [-1, -1], [15, 10], [18, 13], [20, 14], [23, 14], [25, 13], [26, 10], [26, 0]] },
            'n': { width: 19, points: [[4, 14], [4, 0], [-1, -1], [4, 10], [7, 13], [9, 14], [12, 14], [14, 13], [15, 10], [15, 0]] },
            'o': { width: 19, points: [[8, 14], [6, 13], [4, 11], [3, 8], [3, 6], [4, 3], [6, 1], [8, 0], [11, 0], [13, 1], [15, 3], [16, 6], [16, 8], [15, 11], [13, 13], [11, 14], [8, 14]] },
            'p': { width: 19, points: [[4, 14], [4, -7], [-1, -1], [4, 11], [6, 13], [8, 14], [11, 14], [13, 13], [15, 11], [16, 8], [16, 6], [15, 3], [13, 1], [11, 0], [8, 0], [6, 1], [4, 3]] },
            'q': { width: 19, points: [[15, 14], [15, -7], [-1, -1], [15, 11], [13, 13], [11, 14], [8, 14], [6, 13], [4, 11], [3, 8], [3, 6], [4, 3], [6, 1], [8, 0], [11, 0], [13, 1], [15, 3]] },
            'r': { width: 13, points: [[4, 14], [4, 0], [-1, -1], [4, 8], [5, 11], [7, 13], [9, 14], [12, 14]] },
            's': { width: 17, points: [[14, 11], [13, 13], [10, 14], [7, 14], [4, 13], [3, 11], [4, 9], [6, 8], [11, 7], [13, 6], [14, 4], [14, 3], [13, 1], [10, 0], [7, 0], [4, 1], [3, 3]] },
            't': { width: 12, points: [[5, 21], [5, 4], [6, 1], [8, 0], [10, 0], [-1, -1], [2, 14], [9, 14]] },
            'u': { width: 19, points: [[4, 14], [4, 4], [5, 1], [7, 0], [10, 0], [12, 1], [15, 4], [-1, -1], [15, 14], [15, 0]] },
            'v': { width: 16, points: [[2, 14], [8, 0], [-1, -1], [14, 14], [8, 0]] },
            'w': { width: 22, points: [[3, 14], [7, 0], [-1, -1], [11, 14], [7, 0], [-1, -1], [11, 14], [15, 0], [-1, -1], [19, 14], [15, 0]] },
            'x': { width: 17, points: [[3, 14], [14, 0], [-1, -1], [14, 14], [3, 0]] },
            'y': { width: 16, points: [[2, 14], [8, 0], [-1, -1], [14, 14], [8, 0], [6, -4], [4, -6], [2, -7], [1, -7]] },
            'z': { width: 17, points: [[14, 14], [3, 0], [-1, -1], [3, 14], [14, 14], [-1, -1], [3, 0], [14, 0]] },
            '{': { width: 14, points: [[9, 25], [7, 24], [6, 23], [5, 21], [5, 19], [6, 17], [7, 16], [8, 14], [8, 12], [6, 10], [-1, -1], [7, 24], [6, 22], [6, 20], [7, 18], [8, 17], [9, 15], [9, 13], [8, 11], [4, 9], [8, 7], [9, 5], [9, 3], [8, 1], [7, 0], [6, -2], [6, -4], [7, -6], [-1, -1], [6, 8], [8, 6], [8, 4], [7, 2], [6, 1], [5, -1], [5, -3], [6, -5], [7, -6], [9, -7]] },
            '|': { width: 8, points: [[4, 25], [4, -7]] },
            '}': { width: 14, points: [[5, 25], [7, 24], [8, 23], [9, 21], [9, 19], [8, 17], [7, 16], [6, 14], [6, 12], [8, 10], [-1, -1], [7, 24], [8, 22], [8, 20], [7, 18], [6, 17], [5, 15], [5, 13], [6, 11], [10, 9], [6, 7], [5, 5], [5, 3], [6, 1], [7, 0], [8, -2], [8, -4], [7, -6], [-1, -1], [8, 8], [6, 6], [6, 4], [7, 2], [8, 1], [9, -1], [9, -3], [8, -5], [7, -6], [5, -7]] },
            '~': { width: 24, points: [[3, 6], [3, 8], [4, 11], [6, 12], [8, 12], [10, 11], [14, 8], [16, 7], [18, 7], [20, 8], [21, 10], [-1, -1], [3, 8], [4, 10], [6, 11], [8, 11], [10, 10], [14, 7], [16, 6], [18, 6], [20, 7], [21, 10], [21, 12]] }
        };
        return CanvasTextFunctions;
    }());
    TSOS.CanvasTextFunctions = CanvasTextFunctions;
})(TSOS || (TSOS = {}));
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
var TSOS;
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
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
