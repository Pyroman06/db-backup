import Queue from 'better-queue';
import Backup from './models/backup';
import Scheduler from './models/scheduler';
import Cron from 'node-cron';
import fs from 'fs';
import Crypto from 'crypto';
import Providers from './providers/server';

var Tasks = {}

function CalculateHashes(cb) {
    let md5Val, sha1Val, sha256Val, sha512Val;

    function CheckHashes() {
        if (md5Val && sha1Val && sha256Val && sha512Val){
            cb({md5: md5Val, sha1: sha1Val, sha256: sha256Val, sha512: sha512Val});
        }
    }

    let md5 = Crypto.createHash('md5');
    let sha1 = Crypto.createHash('sha1');
    let sha256 = Crypto.createHash('sha256');
    let sha512 = Crypto.createHash('sha512');

    md5.on('readable', () => {
        const data = md5.read();
        if (data) {
            md5Val = data.toString('hex');
            CheckHashes();
        }
    })

    sha1.on('readable', () => {
        const data = sha1.read();
        if (data) {
            sha1Val = data.toString('hex');
            CheckHashes();
        }
    })
    
    sha256.on('readable', () => {
        const data = sha256.read();
        if (data) {
            sha256Val = data.toString('hex');
            CheckHashes();
        }
    })

    sha512.on('readable', () => {
        const data = sha512.read();
        if (data) {
            sha512Val = data.toString('hex');
            CheckHashes();
        }
    })

    return [ md5, sha1, sha256, sha512 ];
}

var BackupQueue = new Queue(function (input, cb) {
    let bLog;
    let storageMethods = Providers.storages[input.destination.provider].methods;
    let databaseMethods = Providers.engines[input.database.engine].methods;
    var filename = databaseMethods.generateFilename(input);
    let storageStream = storageMethods.storeBackup(filename, input, function (err, storageLog) {
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
        })
    });

    let hashStreams = CalculateHashes(function(hashes) {
        input.hashes = hashes;
        input.save(function (err) {
            if (err) {
                throw err;
            }

            if (input.status == "completed") {
                cb(null, input.status);
            }
        });
    })
    databaseMethods.performBackup(input, hashStreams, storageStream, function (err, backupLog, buf) {
        if (err) {
            input.log = backupLog;
            input.status = "failed";
            input.save(function (err) {
                if (err) {
                    throw err;
                }

                cb(null, input.status);
            })
        } else {
            bLog = backupLog;
        }
    });
})

function AddSchedule(schedule) {
    Tasks[schedule._id] = Cron.schedule(schedule.rule, function () {
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
        newBackup.save(function (err) {
            if (err) {
                throw err;
            } else {
                Backup.findOne({ _id: newBackup._id }).populate('database').populate('destination').exec(function (err, backup) {
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
    Backup.find({}).populate('database').populate('destination').exec(function (err, backups) {
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

    Scheduler.find({}).populate('database').populate('destination').exec(function (err, schedules) {
        schedules.map(function (schedule) {
            AddSchedule(schedule);
        });
    });
}

export { BackupQueue, AddSchedule, RemoveSchedule, InitData };