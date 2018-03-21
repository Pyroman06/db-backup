import Queue from 'better-queue';
import Backup from './models/backup';
import Scheduler from './models/scheduler';
import Cron from 'node-cron';
import fs from 'fs';
import { AWSUploadToS3 } from './aws';

var Tasks = {}

export var BackupQueue = new Queue(function (input, cb) {
    const { spawn } = require( 'child_process' )
    var destination = '/tmp';
    if (input.destination.type == "local") {
        destination = input.destination.path;
    }
    if (input.database.engine == "mongodb") {
        var fileName = input.database._id + "_" + input.database.engine + "_" + (+ new Date(input.startDate)) + ".gz";
        var stderr = "";
        const mongodump = spawn( 'mongodump', [ '--uri', input.database.options.uri, '--gzip', '--archive=' + destination + "/" + fileName ] );
        mongodump.stderr.on('data', data => {
            stderr = stderr + data;
        });
        mongodump.on('close', code => {
            if (code == 0) {
                if (input.destination.type == "s3") {
                    AWSUploadToS3(input.destination.path, destination + "/" + fileName, fileName, function(err, res) {
                        if (err) {
                            input.status = "failed";
                            input.log = stderr + err;
                            input.save(function(err) {
                                if (err) {
                                    throw err;
                                }
                            })
                        } else {
                            input.status = "finished";
                            input.log = stderr + res;
                            input.save(function(err) {
                                if (err) {
                                    throw err;
                                }
                            })
                        }
                    })
                } else {
                    input.status = "finished";
                    input.log = stderr;
                    input.save(function(err) {
                        if (err) {
                            throw err;
                        }
                    })
                }
            } else {
                input.status = "failed";
                input.log = stderr;
                input.save(function(err) {
                    if (err) {
                        throw err;
                    }
                })
            }
        });
    } else if (input.database.engine == "mysql") {
        const mysqldump = spawn( 'mysqldump', [ '--all-databases', '--user=' + input.database.options.username, '--password=' + input.database.options.password, '--port=' + input.database.options.port, '--host=' + input.database.options.hostname, '--verbose' ] );
        var stderr, stdout = "";
        mysqldump.stdout.on('data', data => {
            stdout = stdout + data;
        });
        mysqldump.stderr.on('data', data => {
            stderr = stderr + data;
        });
        mysqldump.on('close', code => {
            if (code == 0) {
                var fileName = input.database._id + "_" + input.database.engine + "_" + (+ new Date(input.startDate)) + ".sql";
                fs.writeFile(destination + "/" + fileName, stdout, function(err) {
                    if (err) {
                        input.status = "failed";
                        input.log = stderr + err;
                        input.save(function(err) {
                            if (err) {
                                throw err;
                            }
                        })
                    } else {
                        if (input.destination.type == "s3") {
                            AWSUploadToS3(input.destination.path, destination + "/" + fileName, fileName, function(err, res) {
                                if (err) {
                                    input.status = "failed";
                                    input.log = stderr + err;
                                    input.save(function(err) {
                                        if (err) {
                                            throw err;
                                        }
                                    })
                                } else {
                                    input.status = "finished";
                                    input.log = stderr + res;
                                    input.save(function(err) {
                                        if (err) {
                                            throw err;
                                        }
                                    })
                                }
                            })
                        } else {
                            input.status = "finished";
                            input.log = stderr;
                            input.save(function(err) {
                                if (err) {
                                    throw err;
                                }
                            })
                        }
                    }
                })
            } else {
                input.status = "failed";
                input.log = stderr;
                input.save(function(err) {
                    if (err) {
                        throw err;
                    }
                })
            }
        });
    }

    cb(null, result);
})

export function AddSchedule(schedule) {
    Tasks[schedule._id] = Cron.schedule(schedule.rule, function() {
        var newBackup = new Backup({
            database: schedule.database._id,
            destination: schedule.destination,
            startDate: Date.now(),
            type: "scheduled",
            status: "queued",
            log: ""
        })

        newBackup.save(function(err) {
            if (err) {
                throw err;
            } else {
                Backup.findOne({_id: newBackup._id}).populate('database').exec(function(err, backup) {
                    BackupQueue.push(backup);
                })
            }
        })
    });
}

export function RemoveSchedule(id) {
    Tasks[id].destroy()
}

export function InitData() {
    Backup.find({}).populate('database').exec(function(err, backups) {
        if (err) {
            throw err;
        } else {
            backups.map(function(backupObj) {
                if (backupObj.status == "queued") {
                    BackupQueue.push(backupObj);
                }
            });
        }
    });

    Scheduler.find({}).populate('database').exec(function(err, schedules) {
        schedules.map(function(schedule) {
            AddSchedule(schedule);
        });
    });
}