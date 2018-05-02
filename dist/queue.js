'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BackupQueue = undefined;
exports.AddSchedule = AddSchedule;
exports.RemoveSchedule = RemoveSchedule;
exports.InitData = InitData;

var _betterQueue = require('better-queue');

var _betterQueue2 = _interopRequireDefault(_betterQueue);

var _backup = require('./models/backup');

var _backup2 = _interopRequireDefault(_backup);

var _scheduler = require('./models/scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _nodeCron = require('node-cron');

var _nodeCron2 = _interopRequireDefault(_nodeCron);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _aws = require('./aws');

var _server = require('./providers/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tasks = {};

var BackupQueue = exports.BackupQueue = new _betterQueue2.default(function (input, cb) {
    var databaseMethods = _server2.default.engines[input.database.engine].methods;
    var filename = databaseMethods.generateFilename(input);
    _backup2.default.findOne({ _id: input._id }, function (err, backup) {
        databaseMethods.performBackup(filename, input, function (err, backupLog, path) {
            if (err) {
                backup.log = backupLog;
                backup.status = "failed";
                backup.save(function (err) {
                    if (err) {
                        throw err;
                    }

                    cb(null, backup.status);
                });
            } else {
                var storageMethods = _server2.default.storages[input.destination.provider].methods;
                storageMethods.storeBackup(filename, path, input, function (err, storageLog) {
                    backup.log = backupLog + storageLog;
                    if (err) {
                        backup.status = "failed";
                    } else {
                        backup.status = "finished";
                        backup.filename = filename;
                    }
                    backup.save(function (err) {
                        if (err) {
                            throw err;
                        }

                        cb(null, backup.status);
                    });
                });
            }
        });
    });
});

function AddSchedule(schedule) {
    Tasks[schedule._id] = _nodeCron2.default.schedule(schedule.rule, function () {
        var newBackup = new _backup2.default({
            database: schedule.database._id,
            destination: schedule.destination,
            startDate: Date.now(),
            type: "scheduled",
            status: "queued",
            log: ""
        });

        newBackup.save(function (err) {
            if (err) {
                throw err;
            } else {
                _backup2.default.findOne({ _id: newBackup._id }).populate('database').exec(function (err, backup) {
                    BackupQueue.push(backup);
                });
            }
        });
    });
}

function RemoveSchedule(id) {
    Tasks[id].destroy();
}

function InitData() {
    _backup2.default.find({}).populate('database').populate('destination').exec(function (err, backups) {
        if (err) {
            throw err;
        } else {
            backups.map(function (backupObj) {
                if (backupObj.status == "queued") {
                    BackupQueue.push(backupObj);
                }
            });
        }
    });

    _scheduler2.default.find({}).populate('database').populate('destination').exec(function (err, schedules) {
        schedules.map(function (schedule) {
            AddSchedule(schedule);
        });
    });
}