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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tasks = {};

var BackupQueue = exports.BackupQueue = new _betterQueue2.default(function (input, cb) {
    var _require = require('child_process'),
        spawn = _require.spawn;

    var destination = '/tmp';
    if (input.destination.type == "local") {
        destination = input.destination.path;
    }
    if (input.database.engine == "mongodb") {
        var fileName = input.database._id + "_" + input.database.engine + "_" + +new Date(input.startDate) + ".gz";
        var stderr = "";
        var mongodump = spawn('mongodump', ['--uri', input.database.options.uri, '--gzip', '--archive=' + destination + "/" + fileName]);
        mongodump.stderr.on('data', function (data) {
            stderr = stderr + data;
        });
        mongodump.on('close', function (code) {
            if (code == 0) {
                if (input.destination.type == "s3") {
                    (0, _aws.AWSUploadToS3)(input.destination.path, destination + "/" + fileName, fileName, function (err, res) {
                        if (err) {
                            input.status = "failed";
                            input.log = stderr + err;
                            input.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        } else {
                            input.status = "finished";
                            input.log = stderr + res;
                            input.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                    });
                } else {
                    input.status = "finished";
                    input.log = stderr;
                    input.save(function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            } else {
                input.status = "failed";
                input.log = stderr;
                input.save(function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    } else if (input.database.engine == "mysql") {
        var mysqldump = spawn('mysqldump', ['--all-databases', '--user=' + input.database.options.username, '--password=' + input.database.options.password, '--port=' + input.database.options.port, '--host=' + input.database.options.hostname, '--verbose']);
        var stderr = "";
        var stdout = "";
        mysqldump.stdout.on('data', function (data) {
            stdout = stdout + data;
        });
        mysqldump.stderr.on('data', function (data) {
            stderr = stderr + data;
        });
        mysqldump.on('close', function (code) {
            if (code == 0) {
                var fileName = input.database._id + "_" + input.database.engine + "_" + +new Date(input.startDate) + ".sql";
                _fs2.default.writeFile(destination + "/" + fileName, stdout, function (err) {
                    if (err) {
                        input.status = "failed";
                        input.log = stderr + err;
                        input.save(function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    } else {
                        if (input.destination.type == "s3") {
                            (0, _aws.AWSUploadToS3)(input.destination.path, destination + "/" + fileName, fileName, function (err, res) {
                                if (err) {
                                    input.status = "failed";
                                    input.log = stderr + err;
                                    input.save(function (err) {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                } else {
                                    input.status = "finished";
                                    input.log = stderr + res;
                                    input.save(function (err) {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                }
                            });
                        } else {
                            input.status = "finished";
                            input.log = stderr;
                            input.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                    }
                });
            } else {
                input.status = "failed";
                input.log = stderr;
                input.save(function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    }

    cb(null, result);
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
    _backup2.default.find({}).populate('database').exec(function (err, backups) {
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

    _scheduler2.default.find({}).populate('database').exec(function (err, schedules) {
        schedules.map(function (schedule) {
            AddSchedule(schedule);
        });
    });
}