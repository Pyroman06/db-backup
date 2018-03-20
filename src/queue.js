import Queue from 'better-queue';
import Backup from './models/backup';
import Scheduler from './models/scheduler';
import Cron from 'node-cron';
import fs from 'fs';

var Tasks = {}

export var BackupQueue = new Queue(function (input, cb) {
    const { spawnSync } = require( 'child_process' )
    var destination = '/tmp';
    if (input.destination.type) {
        destination = input.destination.path;
    }
    if (input.database.engine == "mongodb") {
        var folderName = input.database._id + "_" + input.database.engine + "_" + (+ new Date(input.startDate));
        const mongodump = spawnSync( 'mongodump', [ '--out', destination + "/" + folderName, '--uri', input.database.options.uri ] );
        if (mongodump.status == 0) {
            input.status = "finished";
            input.log = mongodump.stderr;
            input.save(function(err) {
                if (err) {
                    throw err;
                }
            })
        } else {
            input.status = "failed";
            input.log = mongodump.stderr;
            input.save(function(err) {
                if (err) {
                    throw err;
                }
            })
        }
    } else if (input.database.engine == "mysql") {
        console.log("STARTED")
        const mysqldump = spawnSync( 'mysqldump', [ '--all-databases', '--user=' + input.database.options.username, '--password=' + input.database.options.password, '--port=' + input.database.options.port, '--host=' + input.database.options.hostname, '--verbose' ] );
        console.log(mysqldump.status)
        if (mysqldump.status == 0) {
            console.log("OK111")
            var fileName = input.database._id + "_" + input.database.engine + "_" + (+ new Date(input.startDate)) + ".sql";
            console.log("FILENAME SET")
            console.log(fileName)
            fs.writeFile(destination + "/" + fileName, mysqldump.stdout, function(err) {
                if (err) {
                    console.log("ERROR")
                    input.status = "failed";
                    input.log = mysqldump.stderr + err;
                    input.save(function(err) {
                        if (err) {
                            throw err;
                        }
                    })
                } else {
                    console.log("FINISHED")
                    input.status = "finished";
                    input.log = mysqldump.stderr;
                    input.save(function(err) {
                        if (err) {
                            throw err;
                        }
                    })
                }
            })
        } else {
            input.status = "failed";
            input.log = mysqldump.stderr;
            input.save(function(err) {
                if (err) {
                    throw err;
                } else {

                }
            })
        }
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