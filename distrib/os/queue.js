/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */
var TSOS;
(function (TSOS) {
    var Queue = /** @class */ (function () {
        function Queue(q) {
            if (q === void 0) { q = new Array(); }
            this.q = q;
        }
        Queue.prototype.getSize = function () {
            return this.q.length;
        };
        Queue.prototype.isEmpty = function () {
            return (this.q.length == 0);
        };
        Queue.prototype.enqueue = function (element) {
            this.q.push(element);
        };
        Queue.prototype.dequeue = function () {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        };
        Queue.prototype.getHighestPriority = function () {
            if (this.q.length <= 0) {
                return null;
            }
            var highestPriority = this.q[0].Priority || Number.MAX_VALUE;
            var highestPriorityProcess = this.q[0];
            var highestPriorityIndex = 0;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].Priority < highestPriority) {
                    highestPriorityProcess = this.q[i];
                    highestPriority = this.q[i].Priority;
                    highestPriorityIndex = i;
                }
            }
            this.q[highestPriorityIndex] = null;
            // Remove any nulls left in array.
            this.q.filter(function (el) {
                return el != null;
            });
            return highestPriorityProcess;
        };
        Queue.prototype.peek = function (index) {
            return this.q[index];
        };
        Queue.prototype.toString = function () {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        };
        return Queue;
    }());
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
