///<reference path="../globals.ts" />

module TSOS {
    export class ProcessControlBlock {

        public PID;
        public PC;
        public Partition;
        public ACC;
        public XReg;
        public YReg;
        public ZFlag;
        public Priority;
        public State;
        public Location;
        public IR;
        
        constructor() { 
            this.PC = 0;
            this.ACC = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
            this.Priority = 0;
            this.IR = null;
            this.State = "Resident";
            this.Location = "Memory";
        }
    }
}