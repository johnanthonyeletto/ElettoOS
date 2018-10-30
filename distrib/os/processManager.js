///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager() {
            this.residentQueue = new TSOS.Queue();
            this.readyQueue = new TSOS.Queue();
            this.nextPID = 0;
        }
        ProcessManager.prototype.createProcess = function (opCodes) {
            if (opCodes.length > 256) {
                throw new Error("Program larger than 256 bytes.");
            }
            var partition = _MemoryManager.getPartition();
            _MemoryManager.loadProgram(opCodes, partition);
            var pcb = new TSOS.ProcessControlBlock();
            pcb.PID = this.nextPID;
            pcb.Partition = partition;
            this.residentQueue.enqueue(pcb);
            this.nextPID++;
            return pcb;
        };
        ProcessManager.prototype.runProcess = function (pid) {
            var foundProcess = null;
            for (var i = 0; i < this.residentQueue.getSize(); i++) {
                var currentProcess = this.residentQueue.dequeue();
                if (currentProcess.PID == pid) {
                    // Process Was Found
                    foundProcess = currentProcess;
                }
                else {
                    // This is not our dinosaur
                    this.readyQueue.enqueue(currentProcess);
                }
            }
            if (foundProcess == null) {
                throw new Error("No process was found with PID " + pid);
                return;
            }
            foundProcess.state = "Ready";
            this.readyQueue.enqueue(foundProcess);
            this.running = foundProcess;
            _CPU.isExecuting = true;
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
