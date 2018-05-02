import { Router } from 'express';
import Passport from 'passport';
import Bcrypt from 'bcrypt';
import Formidable from 'formidable';
import fs from 'fs';
import User from '../models/user';
import Settings from '../models/settings';
import Database from '../models/database';
import Backup from '../models/backup';
import Scheduler from '../models/scheduler';
import Destination from '../models/destination';
import Providers from '../providers/server';
import Cron from 'node-cron';
import { BackupQueue, AddSchedule, RemoveSchedule, InitData } from '../queue';
import { AWSLoadConfig, AWSUpdateConfig } from '../aws';
import { ENUM } from '../providers/types';

InitData();
AWSLoadConfig();

const router = new Router();

//Middleware for auth verification
function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }

    res.json({
        error: true,
        message: "Access denied"
    });
}

//Login
router.post('/login', function (req, res, next) {
    Passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.json({ error: true, message: "Incorrect username or password" }); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            if (req.body.remember) {
                req.session.cookie.maxAge = 2592000000;
            } else {
                req.session.cookie.maxAge = 86400000;
            }
            return res.json({
                error: false,
                message: "Signed in",
                user: { username: user.username, email: user.email, group: user.group, isLoggedIn: true }
            });
        });
    })(req, res, next);
});

//Logout
router.post('/logout', function (req, res) {
    req.logout();
    res.json({ error: false });
});

//Get user data
router.post('/getuser', function (req, res, next) {
    if (req.user) {
        return res.json({
            error: false,
            message: "Session found",
            user: { username: req.user.username, email: req.user.email, group: req.user.group, isLoggedIn: true }
        });
    } else {
        User.count({}, function (err, count) {
            if (count == 0) {
                return res.json({
                    error: true,
                    message: "Session not found",
                    setupComplete: false
                });
            } else {
                return res.json({
                    error: true,
                    message: "Session not found",
                    setupComplete: true
                });
            }
        })
    }
})

//Create initial root account
router.post('/createroot', function (req, res, next) {
    User.count({}, function (err, count) {
        if (err) {
            res.json({
                error: true,
                message: "An internal error occurred"
            });
        } else {
            if (req.body.username && req.body.password && typeof req.body.username == "string" && typeof req.body.password == "string" && req.body.username.length > 0 && req.body.password.length > 0) {
                var root = new User({
                    username: req.body.username,
                    password: Bcrypt.hashSync(req.body.password, 10),
                    group: "admin"
                })

                root.save(function (err) {
                    if (err) {
                        res.json({
                            error: true,
                            message: "An internal error occurred"
                        });
                    } else {
                        res.json({
                            error: false,
                            message: "Root account was created"
                        });
                    }
                })
            }
        }
    })
})

router.post('/settings/get', isAuthenticated, function (req, res, next) {
    Settings.find({}, function (err, settings) {
        if (settings.length == 0) {
            Settings.insertMany([new Settings({ uniqueId: "region", value: "" }), new Settings({ uniqueId: "accessKey", value: "" }), new Settings({ uniqueId: "secretKey", value: "" })]);
            return res.json({ error: false, message: "Settings retrieved", settings: { region: "", accessKey: "", secretKey: "" } });
        } else {
            var settingsJson = {}
            settings.map(function (setting, index) {
                settingsJson[setting.uniqueId] = setting.value;
                if (index == (settings.length - 1)) {
                    return res.json({ error: false, message: "Settings retrieved", settings: settingsJson });
                }
            });
        }
    });
});

router.post('/settings/save', isAuthenticated, function (req, res, next) {
    if (req.body.region && req.body.accessKey && req.body.secretKey) {
        Settings.find({}, function (err, settings) {
            settings.map(function (setting, index) {
                setting.value = req.body[setting.uniqueId];
                setting.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
            AWSUpdateConfig(req.body.accessKey, req.body.secretKey, req.body.region);
            res.json({
                error: false,
                message: "Settings were saved"
            });
        });
    } else {
        return res.json({
            error: true,
            message: "Missing parameters"
        });
    }
});

router.post('/dashboard/get', isAuthenticated, function (req, res, next) {
    Database.find({}, function (err, databases) {
        if (err) {
            res.json({
                error: true,
                message: "An internal error occurred"
            });
        } else {
            Destination.find({}, function (err, destinations) {
                if (err) {
                    res.json({
                        error: true,
                        message: "An internal error occurred"
                    });
                } else {
                    Scheduler.find({}).populate('database').populate('destination').exec(function (err, schedules) {
                        if (err) {
                            res.json({
                                error: true,
                                message: "An internal error occurred"
                            });
                        } else {
                            Backup.find({}).populate('database').populate('destination').sort({ 'startDate': -1, '_id': -1 }).limit(20)
                                .exec(function (err, backups) {
                                    if (err) {
                                        res.json({
                                            error: true,
                                            message: "An internal error occurred"
                                        });
                                    } else {
                                        res.json({
                                            error: false,
                                            message: "Dashboard was loaded",
                                            backups,
                                            destinations,
                                            schedules,
                                            databases
                                        });
                                    }
                                })
                        }
                    })
                }
            })
        }
    })
});

router.post('/database/add', isAuthenticated, function (req, res, next) {
    if (req.body.name && req.body.name.length > 0 && req.body.engine && Providers.engines[req.body.engine]) {
        let engine = Providers.engines[req.body.engine];
        let isValid = true;
        let optionList = {};
        Object.keys(engine.fields).map(function (key) {
            let field = req.body[key];
            if (field == null) {
                isValid = false;
            } else {
                optionList[key] = req.body[key];
            }
        });

        if (!isValid) {
            return res.json({
                error: true,
                message: "Incorrect parameters"
            });
        }

        let databaseObj = { name: req.body.name, engine: req.body.engine, options: optionList };

        let newDatabase = new Database(databaseObj);
        newDatabase.save(function (err) {
            if (err) {
                return res.json({
                    error: true,
                    message: "Couldn't add a database"
                });
            } else {
                return res.json({
                    error: false,
                    message: "Database has been added"
                });
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Incorrect parameters"
        });
    }
});

router.post('/database/delete', isAuthenticated, function (req, res, next) {
    if (req.body.databaseId) {
        Database.findOne({ _id: req.body.databaseId }, function (err, database) {
            if (err) {
                res.json({
                    error: true,
                    message: "An internal error occurred"
                });
            } else {
                if (database) {
                    Scheduler.find({ database: database._id }, function (err, schedules) {
                        if (err) {
                            res.json({
                                error: true,
                                message: "An internal error occurred"
                            });
                        } else {
                            schedules.map(function (schedule) {
                                RemoveSchedule(schedule._id);
                            })

                            Scheduler.remove({ database: database._id }, function (err) {
                                if (err) {
                                    res.json({
                                        error: true,
                                        message: "An internal error occurred"
                                    });
                                } else {
                                    database.remove(function (err) {
                                        if (err) {
                                            res.json({
                                                error: true,
                                                message: "An internal error occurred"
                                            });
                                        } else {
                                            res.json({
                                                error: false,
                                                message: "Database was removed"
                                            });
                                        }
                                    });
                                }
                            })
                        }
                    });
                } else {
                    res.json({
                        error: true,
                        message: "Couldn't find a database"
                    });
                }
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Parameters missing"
        });
    }
});

router.post('/database/manualbackup', isAuthenticated, function (req, res, next) {
    if (req.body.databaseId && req.body.destinationId) {
        Database.findOne({ _id: req.body.databaseId }, function (err, database) {
            if (err) {
                res.json({
                    error: true,
                    message: "An internal error occurred"
                });
            } else {
                if (database) {
                    Destination.findOne({ _id: req.body.destinationId }, function(err, destination) {
                        if (destination) {
                            var localBackup = new Backup({
                                database: database._id,
                                destination: destination._id,
                                filename: null,
                                startDate: Date.now(),
                                type: "manual",
                                status: "queued",
                                log: ""
                            });

                            localBackup.save(function (err) {
                                if (err) {
                                    throw err;
                                } else {
                                    var backupObj = { ...localBackup }
                                    backupObj.database = { ...database }
                                    backupObj.destination = { ...destination }
                                    BackupQueue.push(backupObj);
                                    res.json({
                                        error: false,
                                        message: "Backup was added to the queue"
                                    });
                                }
                            })
                        } else {
                            res.json({
                                error: true,
                                message: "Invalid destination or path"
                            });
                        }
                    })
                } else {
                    res.json({
                        error: true,
                        message: "Couldn't find a database"
                    });
                }
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Parameters missing"
        });
    }
});

router.post('/destination/add', isAuthenticated, function (req, res, next) {
    var Form = new Formidable.IncomingForm();
    Form.parse(req, function (err, fields, files) {
        if (err) {
            return res.json({ error: true, message: "An unexpected error occurred" })
        }

        const provider = fields.provider;
        const name = fields.name;
        const storageData = Providers.storages[provider];
        var options = {};

        if (storageData) {
            if (name && name.length > 0) {
                var error = null;
                Object.keys(storageData.fields).map(function (key) {
                    var field = storageData.fields[key];
                    if (field.type == ENUM.TYPE_FILE) {
                        if (files[key]) {
                            var contents = fs.readFileSync(files[key].path, 'utf8')
                            try {
                                var json = JSON.parse(contents);
                                options[key] = json;
                            } catch (err) {
                                error = "File contents is not in JSON"
                            }
                        } else {
                            error = "Invalid parameter"
                        }
                    } else {
                        if (fields[key]) {
                            if (field.type == ENUM.TYPE_STRING) {
                                if (fields[key].length > 0) {
                                    options[key] = fields[key];
                                } else {
                                    error = "Invalid parameter"
                                }
                            } else if (field.type == ENUM.TYPE_NUMBER) {
                                if (Number(field.type)) {
                                    options[key] = fields[key];
                                } else {
                                    error = "Invalid parameter"
                                }
                            }
                        } else {
                            error = "Invalid parameter"
                        }
                    }
                });

                if (error) {
                    return res.json({ error: true, message: error });
                } else {
                    var newDestination = new Destination({ name, provider, options });
                    newDestination.save(function (err) {
                        if (err) {
                            return res.json({ error: true, message: "An unexpected error occurred" })
                        } else {
                            return res.json({ error: false, message: "Destination added" });
                        }
                    })
                }
            } else {
                return res.json({ error: true, message: "Incorrect name" })
            }
        } else {
            return res.json({ error: true, message: "Unknown storage" })
        }
    })
});

router.post('/destination/delete', isAuthenticated, function(req, res, next) {
    if (req.body.destinationId) {
        Destination.findOne({ _id: req.body.destinationId }, function (err, destination) {
            if (err) {
                res.json({
                    error: true,
                    message: "An internal error occurred"
                });
            } else {
                if (destination) {
                    Scheduler.find({ destination: destination._id }, function (err, schedules) {
                        if (err) {
                            res.json({
                                error: true,
                                message: "An internal error occurred"
                            });
                        } else {
                            schedules.map(function (schedule) {
                                RemoveSchedule(schedule._id);
                            })

                            Scheduler.remove({ destination: destination._id }, function (err) {
                                if (err) {
                                    res.json({
                                        error: true,
                                        message: "An internal error occurred"
                                    });
                                } else {
                                    destination.remove(function (err) {
                                        if (err) {
                                            res.json({
                                                error: true,
                                                message: "An internal error occurred"
                                            });
                                        } else {
                                            res.json({
                                                error: false,
                                                message: "Destination was removed"
                                            });
                                        }
                                    });
                                }
                            })
                        }
                    });
                } else {
                    res.json({
                        error: true,
                        message: "Couldn't find a destination"
                    });
                }
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Parameters missing"
        });
    }
});

router.post('/scheduler/add', isAuthenticated, function (req, res, next) {
    if (req.body.databaseId && req.body.destinationId) {
        Database.findOne({ _id: req.body.databaseId }, function (err, database) {
            if (err) {
                res.json({
                    error: true,
                    message: "An internal error occurred"
                });
            } else {
                if (database) {
                    Destination.findOne({ _id: req.body.destinationId }, function(err, destination) {
                        if (destination) {
                            if (req.body.rule && Cron.validate(req.body.rule)) {
                                var newScheduler = new Scheduler({ database: database._id, destination: destination._id, rule: req.body.rule });
                                newScheduler.save(function (err) {
                                    if (err) {
                                        res.json({
                                            error: true,
                                            message: "An internal error occurred"
                                        });
                                    } else {
                                        AddSchedule({
                                            _id: newScheduler._id,
                                            database: database,
                                            destination: destination,
                                            rule: newScheduler.rule
                                        })
                                        res.json({
                                            error: false,
                                            message: "Task was added"
                                        });
                                    }
                                })
                            } else {
                                res.json({
                                    error: true,
                                    message: "Invalid parameters"
                                });
                            }
                        } else {
                            res.json({
                                error: true,
                                message: "Couldn't find a destination"
                            });
                        }
                    });
                } else {
                    res.json({
                        error: true,
                        message: "Couldn't find a database"
                    });
                }
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Parameters missing"
        });
    }
});

router.post('/scheduler/delete', isAuthenticated, function (req, res, next) {
    if (req.body.taskId) {
        Scheduler.findOne({ _id: req.body.taskId }, function (err, schedule) {
            if (err) {
                res.json({
                    error: true,
                    message: "An internal error occurred"
                });
            } else {
                if (schedule) {
                    schedule.remove(function (err) {
                        if (err) {
                            res.json({
                                error: true,
                                message: "An internal error occurred"
                            });
                        } else {
                            RemoveSchedule(schedule._id);
                            res.json({
                                error: false,
                                message: "Task was removed"
                            });
                        }
                    });
                } else {
                    res.json({
                        error: true,
                        message: "Couldn't find a database"
                    });
                }
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Parameters missing"
        });
    }
});

export default router;