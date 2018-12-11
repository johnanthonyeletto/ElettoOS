///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   deviceDriverDisk.ts

   Requires deviceDriver.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverDisk = /** @class */ (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk() {
            var _this = _super.call(this) || this;
            _this.SUCCESS = 0;
            _this.DISK_FULL = 1;
            _this.FILE_NAME_EXISTS = 2;
            _this.FILE_NAME_NO_EXIST = 3;
            _this.driverEntry = _this.krnDiskDriverEntry;
            return _this;
        }
        DeviceDriverDisk.prototype.krnDiskDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
        };
        // Returns an array with all file names to show the user.
        // This always excludes files that start with '$' because these are swap files.
        // This excludes files that start with '.' (hidden files) if the '-a' flag is not present.
        DeviceDriverDisk.prototype.getAllFiles = function (flag) {
            if (flag === void 0) { flag = null; }
            var files = [];
            for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                    if (currentSector == 0 && currentBlock == 0) {
                        continue;
                    }
                    var dirBlock = JSON.parse(sessionStorage.getItem("0" + ":" + currentSector + ":" + currentBlock));
                    if (!dirBlock.inUse) {
                        continue;
                    }
                    var hexString = "";
                    for (var i = 4; i < 60; i++) {
                        hexString += dirBlock.data[i];
                    }
                    var fileString = this.hexToString(hexString);
                    if (fileString.substr(0, 1) == "$") {
                        // Skip swap files
                        continue;
                    }
                    if (fileString.substr(0, 1) == "." && flag != "-a") {
                        // Skip hidden files if there's no '-a' flag.
                        continue;
                    }
                    files.push(fileString);
                }
            }
            return files;
        };
        // Pretty self explanatory. Checks if a given file name exists already.
        DeviceDriverDisk.prototype.fileExists = function (fileName) {
            var hexArr = this.stringToHex(fileName);
            for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                    if (currentSector == 0 && currentBlock == 0) {
                        continue;
                    }
                    var block = JSON.parse(sessionStorage.getItem("0" + ":" + currentSector + ":" + currentBlock));
                    var foundFile = true;
                    if (block != "1") {
                        continue;
                    }
                    for (var i = 4, j = 0; j < hexArr.length; i++, j++) {
                        if (hexArr[j] != block.data[i]) {
                            foundFile = false;
                        }
                    }
                    if (block.data[hexArr.length + 4] != "00") {
                        foundFile = false;
                    }
                    if (foundFile) {
                        return foundFile;
                    }
                }
            }
            return false;
        };
        DeviceDriverDisk.prototype.readDiskData = function (tsb) {
            var block = JSON.parse(sessionStorage.getItem(tsb));
            var i = 0;
            var result = [];
            while (true) {
                result.push(block.data[i]);
                i++;
                if (i == _Disk.dataSize) {
                    if (block.pointer != "0:0:0") {
                        block = JSON.parse(sessionStorage.getItem(block.pointer));
                        i = 0;
                    }
                    else {
                        return result;
                    }
                }
            }
        };
        // Creates a new file given a file name.
        DeviceDriverDisk.prototype.createFile = function (fileName) {
            if (this.fileExists(fileName)) {
                return this.FILE_NAME_EXISTS;
            }
            for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                    if (currentSector == 0 && currentBlock == 0) {
                        continue;
                    }
                    var id = "0" + ":" + currentSector + ":" + currentBlock;
                    var block = JSON.parse(sessionStorage.getItem(id));
                    if (block.inUse) {
                        continue;
                    }
                    var currentTSB = this.findFreeBlock();
                    if (currentTSB != null) {
                        var thisBlock = JSON.parse(sessionStorage.getItem(currentTSB));
                        block.inUse = true;
                        thisBlock.inUse = true;
                        thisBlock = this.clearBlock(thisBlock);
                        block.pointer = currentTSB;
                        var hexArr = this.stringToHex(fileName);
                        block = this.clearBlock(block);
                        var today = new Date();
                        var month = ((today.getMonth() < 10) ? "0" : "") + (today.getMonth() + 1).toString(16);
                        var day = ((today.getDate() < 10) ? "0" : "") + (today.getDate()).toString(16);
                        var year = (today.getFullYear()).toString(16);
                        block.data[0] = month;
                        block.data[1] = day;
                        block.data[2] = year.substring(0, 2);
                        block.data[3] = year.substring(2);
                        for (var i = 4, j = 0; j < hexArr.length; i++, j++) {
                            block.data[i] = hexArr[j];
                        }
                        sessionStorage.setItem(id, JSON.stringify(block));
                        sessionStorage.setItem(currentTSB, JSON.stringify(thisBlock));
                        TSOS.Control.updateDiskDisplay();
                        return this.SUCCESS;
                    }
                    return this.DISK_FULL;
                }
            }
            return this.DISK_FULL;
        };
        DeviceDriverDisk.prototype.findFreeBlock = function () {
            for (var trackNum = 1; trackNum < _Disk.totalTracks; trackNum++) {
                for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                    for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                        var id = trackNum + ":" + currentSector + ":" + currentBlock;
                        var thisBlock = JSON.parse(sessionStorage.getItem(id));
                        if (!thisBlock.inUse) {
                            return id;
                        }
                    }
                }
            }
            return null;
        };
        DeviceDriverDisk.prototype.findFreeDataBlocks = function (numBlocks) {
            var blocks = [];
            for (var trackNum = 1; trackNum < _Disk.totalTracks; trackNum++) {
                for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                    for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                        var id = trackNum + ":" + currentSector + ":" + currentBlock;
                        var thisBlock = JSON.parse(sessionStorage.getItem(id));
                        if (!thisBlock.inUse) {
                            blocks.push(id);
                            numBlocks--;
                        }
                        if (numBlocks == 0) {
                            return blocks;
                        }
                    }
                }
            }
            if (numBlocks != 0) {
                return null;
            }
        };
        DeviceDriverDisk.prototype.reserveDiskSpace = function (file, tsb) {
            var stringLength = file.length;
            var currentTSB = tsb;
            var thisBlock = JSON.parse(sessionStorage.getItem(currentTSB));
            while (stringLength > _Disk.dataSize) {
                if (thisBlock.pointer != "0:0:0" && thisBlock.inUse) {
                    stringLength -= _Disk.dataSize;
                    currentTSB = thisBlock.pointer;
                    thisBlock = JSON.parse(sessionStorage.getItem(thisBlock.pointer));
                }
                else {
                    thisBlock.inUse = true;
                    var numBlocks = Math.ceil(stringLength / _Disk.dataSize);
                    var freeBlocks = this.findFreeDataBlocks(numBlocks);
                    if (freeBlocks != null) {
                        for (var _i = 0, freeBlocks_1 = freeBlocks; _i < freeBlocks_1.length; _i++) {
                            var block = freeBlocks_1[_i];
                            thisBlock.pointer = block;
                            thisBlock.inUse = true;
                            sessionStorage.setItem(currentTSB, JSON.stringify(thisBlock));
                            currentTSB = block;
                            thisBlock = JSON.parse(sessionStorage.getItem(currentTSB));
                        }
                        thisBlock.inUse = true;
                        sessionStorage.setItem(currentTSB, JSON.stringify(thisBlock));
                        return true;
                    }
                    else {
                        thisBlock.inUse = false;
                        return false;
                    }
                }
            }
            sessionStorage.setItem(currentTSB, JSON.stringify(thisBlock));
            return true;
        };
        DeviceDriverDisk.prototype.writeToDisk = function (fileName, text) {
            var hexArr = this.stringToHex(fileName);
            for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                    if (currentSector == 0 && currentBlock == 0) {
                        continue;
                    }
                    var id = "0" + ":" + currentSector + ":" + currentBlock;
                    var dirBlock = JSON.parse(sessionStorage.getItem(id));
                    var matchingfileName = true;
                    if (!dirBlock.inUse) {
                        // Not being used
                        continue;
                    }
                    for (var i = 4, j = 0; j < hexArr.length; i++, j++) {
                        if (hexArr[j] != dirBlock.data[i]) {
                            matchingfileName = false;
                        }
                    }
                    if (dirBlock.data[hexArr.length + 4] != "00") {
                        matchingfileName = false;
                    }
                    if (matchingfileName) {
                        var textHexArr = this.stringToHex(text.slice(1, -1));
                        var enoughFreeSpace = this.reserveDiskSpace(textHexArr, dirBlock.pointer);
                        if (!enoughFreeSpace) {
                            return this.DISK_FULL;
                        }
                        this.writeDataToDisk(dirBlock.pointer, textHexArr);
                        return this.SUCCESS;
                    }
                }
            }
            return this.FILE_NAME_NO_EXIST;
        };
        DeviceDriverDisk.prototype.readFile = function (fileName) {
            var hexArr = this.stringToHex(fileName);
            for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                    if (currentSector == 0 && currentBlock == 0) {
                        continue;
                    }
                    var id = "0" + ":" + currentSector + ":" + currentBlock;
                    var dirBlock = JSON.parse(sessionStorage.getItem(id));
                    var matchingfileName = true;
                    if (!dirBlock.inUse) {
                        continue;
                    }
                    for (var i = 4, j = 0; j < hexArr.length; i++, j++) {
                        if (hexArr[j] != dirBlock.data[i]) {
                            matchingfileName = false;
                        }
                    }
                    if (dirBlock.data[hexArr.length + 4] != "00") {
                        matchingfileName = false;
                    }
                    if (matchingfileName) {
                        var tsb = dirBlock.pointer;
                        var data = this.readDiskData(tsb);
                        var dataPtr = 0;
                        var fileData = [];
                        while (true) {
                            if (data[dataPtr] != "00") {
                                fileData.push(String.fromCharCode(parseInt(data[dataPtr], 16)));
                                dataPtr++;
                            }
                            else {
                                break;
                            }
                        }
                        return { "data": data, "fileData": fileData };
                    }
                }
            }
            return this.FILE_NAME_NO_EXIST;
        };
        DeviceDriverDisk.prototype.krnDiskDeleteData = function (tsb) {
            var ptrBlock = JSON.parse(sessionStorage.getItem(tsb));
            if (ptrBlock.pointer != "0:0:0") {
                this.krnDiskDeleteData(ptrBlock.pointer);
            }
            ptrBlock.inUse = false;
            sessionStorage.setItem(tsb, JSON.stringify(ptrBlock));
            return;
        };
        DeviceDriverDisk.prototype.deleteFile = function (fileName) {
            var hexArr = this.stringToHex(fileName);
            for (var currentSector = 0; currentSector < _Disk.totalSectors; currentSector++) {
                for (var currentBlock = 0; currentBlock < _Disk.totalBlocks; currentBlock++) {
                    if (currentSector == 0 && currentBlock == 0) {
                        continue;
                    }
                    var id = "0" + ":" + currentSector + ":" + currentBlock;
                    var dirBlock = JSON.parse(sessionStorage.getItem(id));
                    var matchingfileName = true;
                    if (dirBlock.inUse) {
                        for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                            if (hexArr[j] != dirBlock.data[k]) {
                                matchingfileName = false;
                            }
                        }
                        if (dirBlock.data[hexArr.length + 4] != "00") {
                            matchingfileName = false;
                        }
                        if (matchingfileName) {
                            this.krnDiskDeleteData(dirBlock.pointer);
                            dirBlock.inUse = false;
                            sessionStorage.setItem(id, JSON.stringify(dirBlock));
                            TSOS.Control.updateDiskDisplay();
                        }
                    }
                }
            }
        };
        DeviceDriverDisk.prototype.writeDataToDisk = function (tsb, textHexArr) {
            var dataPtr = 0;
            var currentTSB = tsb;
            var currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
            currentBlock = this.clearBlock(currentBlock);
            for (var k = 0; k < textHexArr.length; k++) {
                currentBlock.data[dataPtr] = textHexArr[k];
                dataPtr++;
                if (dataPtr == 60) {
                    sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
                    currentTSB = currentBlock.pointer;
                    currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
                    currentBlock = this.clearBlock(currentBlock);
                    dataPtr = 0;
                }
            }
            this.krnDiskDeleteData(currentBlock.pointer);
            currentBlock.pointer = "0:0:0";
            sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
            TSOS.Control.updateDiskDisplay();
        };
        DeviceDriverDisk.prototype.formatDisk = function () {
            if (_CPU.isExecuting) {
                return false;
            }
            _Disk.init();
            // Remove any processes that were on disk
            for (var i = 0; i < _ProcessManager.residentQueue.length; i++) {
                var pcb = _ProcessManager.residentQueue[i];
                if (pcb == null) {
                    continue;
                }
                if (pcb.Location != "Disk") {
                    continue;
                }
                _ProcessManager.killProcess(pcb.PID);
            }
            TSOS.Control.updateProcessDisplay();
            TSOS.Control.updateDiskDisplay();
            return true;
        };
        DeviceDriverDisk.prototype.stringToHex = function (text) {
            var hexArr = [];
            for (var i = 0; i < text.length; i++) {
                var hexChar = text.charCodeAt(i).toString(16);
                hexArr.push(hexChar);
            }
            return hexArr;
        };
        DeviceDriverDisk.prototype.hexToString = function (hexx) {
            var hex = hexx.toString();
            var str = '';
            for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            return str;
        };
        DeviceDriverDisk.prototype.clearBlock = function (block) {
            for (var i = 0; i < _Disk.dataSize; i++) {
                block.data[i] = "00";
            }
            return block;
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
