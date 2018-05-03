import Queue from 'better-queue';
import Backup from './models/backup';
import Scheduler from './models/scheduler';
import Cron from 'node-cron';
import fs from 'fs';
import Crypto from 'crypto';
import Providers from './providers/server';

var Tasks = {}

function CalculateHashes(buf) {
    let md5 = Crypto.createHash('md5').update(buf).digest('hex');
    let sha1 = Crypto.createHash('sha1').update(buf).digest('hex');
    let sha256 = Crypto.createHash('sha256').update(buf).digest('hex');
    let sha512 = Crypto.createHash('sha512').update(buf).digest('hex');

    return {md5, sha1, sha256, sha512};
}

var BackupQueue = new Queue(function (input, cb) {
    let databaseMethods = Providers.engines[input.database.engine].methods;
    var filename = databaseMethods.generateFilename(input);
    Backup.findOne({_id: input._id}, function(err, backup) {
        databaseMethods.performBackup(input, function(err, backupLog, buf) {
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
                let hashList = CalculateHashes(buf);
                let storageMethods = Providers.storages[input.destination.provider].methods;
                storageMethods.storeBackup(filename, buf, input, function(err, storageLog) {
                    backup.log = backupLog + storageLog;
                    if (err) {
                        backup.status = "failed";
                    } else {
                        backup.status = "finished";
                        backup.filename = filename;
                        backup.hashes = hashList;
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

function AddSchedule(schedule) {
    Tasks[schedule._id] = Cron.schedule(schedule.rule, function() {
        var newBackup = new Backup({
            database: schedule.database._id,
            destination: schedule.destination,
            filename: "",
            startDate: Date.now(),
            type: "scheduled",
            status: "queued",
            hashes: {},
            log: ""
        })

        newBackup.save(function(err) {
            if (err) {
                throw err;
            } else {
                Backup.findOne({_id: newBackup._id}).populate('database').populate('destination').exec(function(err, backup) {
                    BackupQueue.push(backup);
                })
            }
        })
    });
}

function RemoveSchedule(id) {
    Tasks[id].destroy()
}

function InitData() {
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

export { BackupQueue, AddSchedule, RemoveSchedule, InitData};