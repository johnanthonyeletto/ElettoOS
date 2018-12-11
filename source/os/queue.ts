/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
    export class Queue {
        constructor(public q = new Array()) {
        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty() {
            return (this.q.length == 0);
        }

        public enqueue(element) {
            this.q.push(element);
        }

        public dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }

        public getHighestPriority() {
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
        }

        public peek(index) {
            return this.q[index];
        }

        public toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
    }
}
