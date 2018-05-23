'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InitData = exports.RemoveSchedule = exports.AddSchedule = exports.BackupQueue = undefined;

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

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _server = require('./providers/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tasks = {};

function CalculateHashes(cb) {
    var md5Val = void 0,
        sha1Val = void 0,
        sha256Val = void 0,
        sha512Val = void 0;

    function CheckHashes() {
        if (md5Val && sha1Val && sha256Val && sha512Val) {
            cb({ md5: md5Val, sha1: sha1Val, sha256: sha256Val, sha512: sha512Val });
        }
    }

    var md5 = _crypto2.default.createHash('md5');
    var sha1 = _crypto2.default.createHash('sha1');
    var sha256 = _crypto2.default.createHash('sha256');
    var sha512 = _crypto2.default.createHash('sha512');

    md5.on('readable', function () {
        var data = md5.read();
        if (data) {
            md5Val = data.toString('hex');
            CheckHashes();
        }
    });

    sha1.on('readable', function () {
        var data = sha1.read();
        if (data) {
            sha1Val = data.toString('hex');
            CheckHashes();
        }
    });

    sha256.on('readable', function () {
        var data = sha256.read();
        if (data) {
            sha512Val = data.toString('hex');
            CheckHashes();
        }
    });

    sha512.on('readable', function () {
        var data = sha512.read();
        if (data) {
            sha256Val = data.toString('hex');
            CheckHashes();
        }
    });

    return [md5, sha1, sha256, sha512];
}

var BackupQueue = new _betterQueue2.default(function (input, cb) {
    var bLog = void 0;
    var storageMethods = _server2.default.storages[input.destination.provider].methods;
    var databaseMethods = _server2.default.engines[input.database.engine].methods;
    var filename = databaseMethods.generateFilename(input);
    var storageStream = storageMethods.storeBackup(filename, input, function (err, storageLog) {
        input.log = bLog + storageLog;
        if (err) {
            input.status = "failed";
        } else {
            input.status = "finished";
            input.filename = filename;
        }
        input.save(function (err) {
            if (err) {
                throw err;
            }

            if (input.hashes) {
                cb(null, input.status);
            }
        });
    });

    var hashStreams = CalculateHashes(function (hashes) {
        input.hashes = hashes;
        input.save(function (err) {
            if (err) {
                throw err;
            }

            if (input.status == "completed") {
                cb(null, input.status);
            }
        });
    });
    databaseMethods.performBackup(input, hashStreams, storageStream, function (err, backupLog, buf) {
        if (err) {
            input.log = backupLog;
            input.status = "failed";
            input.save(function (err) {
                if (err) {
                    throw err;
                }

                cb(null, input.status);
            });
        } else {
            bLog = backupLog;
        }
    });
});

function AddSchedule(schedule) {
    Tasks[schedule._id] = _nodeCron2.default.schedule(schedule.rule, function () {
        var newBackup = new _backup2.default({
            database: schedule.database._id,
            destination: schedule.destination,
            filename: "",
            startDate: Date.now(),
            type: "scheduled",
            status: "queued",
            hashes: {},
            log: ""
        });
        newBackup.save(function (err) {
            if (err) {
                throw err;
            } else {
                _backup2.default.findOne({ _id: newBackup._id }).populate('database').populate('destination').exec(function (err, backup) {
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

exports.BackupQueue = BackupQueue;
exports.AddSchedule = AddSchedule;
exports.RemoveSchedule = RemoveSchedule;
exports.InitData = InitData;