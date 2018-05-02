import Queue from 'better-queue';
import Backup from './models/backup';
import Scheduler from './models/scheduler';
import Cron from 'node-cron';
import fs from 'fs';
import { AWSUploadToS3 } from './aws';
import Providers from './providers/server';

var Tasks = {}

export var BackupQueue = new Queue(function (input, cb) {
    let databaseMethods = Providers.engines[input.database.engine].methods;
    var filename = databaseMethods.generateFilename(input);
    Backup.findOne({_id: input._id}, function(err, backup) {
        databaseMethods.performBackup(filename, input, function(err, backupLog, path) {
            if (err) {
                backup.log = backupLog;
                backup.status = "failed";
                backup.save(function(err) {
                    if (err) {
                        throw err;
                    }

                    cb(null, backup.status);
                })
            } else {
                let storageMethods = Providers.storages[input.destination.provider].methods;
                storageMethods.storeBackup(filename, path, input, function(err, storageLog) {
                    backup.log = backupLog + storageLog;
                    if (err) {
                        backup.status = "failed";
                    } else {
                        backup.status = "finished";
                        backup.filename = filename;
                    }
                    backup.save(function(err) {
                        if (err) {
                            throw err;
                        }

                        cb(null, backup.status);
                    })
                });
            }
        });
    });
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
    Backup.find({}).populate('database').populate('destination').exec(function(err, backups) {
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

    Scheduler.find({}).populate('database').populate('destination').exec(function(err, schedules) {
        schedules.map(function(schedule) {
            AddSchedule(schedule);
        });
    });
}