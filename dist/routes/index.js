'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _settings = require('../models/settings');

var _settings2 = _interopRequireDefault(_settings);

var _database = require('../models/database');

var _database2 = _interopRequireDefault(_database);

var _backup = require('../models/backup');

var _backup2 = _interopRequireDefault(_backup);

var _scheduler = require('../models/scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _nodeCron = require('node-cron');

var _nodeCron2 = _interopRequireDefault(_nodeCron);

var _queue = require('../queue');

var _aws = require('../aws');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _queue.InitData)();
(0, _aws.AWSLoadConfig)();

var router = new _express.Router();

router.post('/login', function (req, res, next) {
    _passport2.default.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({ error: true, message: "Incorrect username or password" });
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.json({
                error: false,
                message: "Signed in",
                user: { username: user.username, email: user.email, group: user.group, isLoggedIn: true }
            });
        });
    })(req, res, next);
});

router.post('/logout', function (req, res) {
    req.logout();
    res.json({ error: false });
});

router.post('/getuser', function (req, res, next) {
    if (req.user) {
        return res.json({
            error: false,
            message: "Session found",
            user: { username: req.user.username, email: req.user.email, group: req.user.group, isLoggedIn: true }
        });
    } else {
        _user2.default.count({}, function (err, count) {
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
        });
    }
});

router.post('/createroot', function (req, res, next) {
    _user2.default.count({}, function (err, count) {
        if (err) {
            res.json({
                error: true,
                message: "An internal error occurred"
            });
        } else {
            if (req.body.username && req.body.password && typeof req.body.username == "string" && typeof req.body.password == "string" && req.body.username.length > 0 && req.body.password.length > 0) {
                var root = new _user2.default({
                    username: req.body.username,
                    password: _bcrypt2.default.hashSync(req.body.password, 10),
                    group: "admin"
                });

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
                });
            }
        }
    });
});

router.post('/settings/get', function (req, res, next) {
    if (req.user) {
        _settings2.default.find({}, function (err, settings) {
            if (settings.length == 0) {
                _settings2.default.insertMany([new _settings2.default({ uniqueId: "region", value: "" }), new _settings2.default({ uniqueId: "accessKey", value: "" }), new _settings2.default({ uniqueId: "secretKey", value: "" })]);
                return res.json({ error: false, message: "Settings retrieved", settings: { region: "", accessKey: "", secretKey: "" } });
            } else {
                var settingsJson = {};
                settings.map(function (setting, index) {
                    settingsJson[setting.uniqueId] = setting.value;
                    if (index == settings.length - 1) {
                        return res.json({ error: false, message: "Settings retrieved", settings: settingsJson });
                    }
                });
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

router.post('/settings/save', function (req, res, next) {
    if (req.user) {
        if (req.body.region && req.body.accessKey && req.body.secretKey) {
            _settings2.default.find({}, function (err, settings) {
                settings.map(function (setting, index) {
                    setting.value = req.body[setting.uniqueId];
                    setting.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
                (0, _aws.AWSUpdateConfig)(req.body.accessKey, req.body.secretKey, req.body.region);
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
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

router.post('/dashboard/get', function (req, res, next) {
    if (req.user) {
        _database2.default.find({}, function (err, databases) {
            if (err) {
                res.json({
                    error: true,
                    message: "An internal error occurred"
                });
            } else {
                _scheduler2.default.find({}).populate('database').exec(function (err, schedules) {
                    if (err) {
                        res.json({
                            error: true,
                            message: "An internal error occurred"
                        });
                    } else {
                        _backup2.default.find({}).populate('database').sort({ 'startDate': -1, '_id': -1 }).limit(20).exec(function (err, backups) {
                            if (err) {
                                res.json({
                                    error: true,
                                    message: "An internal error occurred"
                                });
                            } else {
                                res.json({
                                    error: false,
                                    message: "Dashboard was loaded",
                                    backups: backups,
                                    schedules: schedules,
                                    databases: databases
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

router.post('/database/add', function (req, res, next) {
    if (req.user) {
        if (req.body.name && req.body.name.length > 0 && req.body.engine && (req.body.engine == "mysql" || req.body.engine == "mongodb") && (req.body.engine == "mysql" && req.body.hostname && req.body.port && req.body.username && req.body.password || req.body.engine == "mongodb" && req.body.uri)) {
            var databaseObj;
            if (req.body.engine == "mysql") {
                databaseObj = { name: req.body.name, engine: req.body.engine, options: { hostname: req.body.hostname, port: req.body.port, username: req.body.username, password: req.body.password } };
            } else if (req.body.engine == "mongodb") {
                databaseObj = { name: req.body.name, engine: req.body.engine, options: { uri: req.body.uri } };
            }

            var newDatabase = new _database2.default(databaseObj);
            newDatabase.save(function (err) {
                if (err) {
                    return res.json({
                        error: true,
                        message: "Couldn't add database"
                    });
                } else {
                    return res.json({
                        error: false,
                        message: "Database added"
                    });
                }
            });
        } else {
            return res.json({
                error: true,
                message: "Incorrect parameters"
            });
        }
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

router.post('/database/delete', function (req, res, next) {
    if (req.user) {
        if (req.body.databaseId) {
            _database2.default.findOne({ _id: req.body.databaseId }, function (err, database) {
                if (err) {
                    res.json({
                        error: true,
                        message: "An internal error occurred"
                    });
                } else {
                    if (database) {
                        _scheduler2.default.find({ database: database._id }, function (err, schedules) {
                            if (err) {
                                res.json({
                                    error: true,
                                    message: "An internal error occurred"
                                });
                            } else {
                                schedules.map(function (schedule) {
                                    (0, _queue.RemoveSchedule)(schedule._id);
                                });

                                _scheduler2.default.remove({ database: database._id }, function (err) {
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
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

router.post('/database/manualbackup', function (req, res, next) {
    if (req.user) {
        if (req.body.databaseId) {
            _database2.default.findOne({ _id: req.body.databaseId }, function (err, database) {
                if (err) {
                    res.json({
                        error: true,
                        message: "An internal error occurred"
                    });
                } else {
                    if (database) {
                        if ((req.body.destination == "s3" || req.body.destination == "local") && req.body.path) {
                            var localBackup = new _backup2.default({
                                database: database._id,
                                destination: { type: req.body.destination, path: req.body.path },
                                startDate: Date.now(),
                                type: "manual",
                                status: "queued",
                                log: ""
                            });

                            localBackup.save(function (err) {
                                if (err) {
                                    throw err;
                                } else {
                                    _backup2.default.findOne({ _id: localBackup._id }).populate('database').exec(function (err, backup) {
                                        if (err) {
                                            res.json({
                                                error: true,
                                                message: "Invalid destination or path"
                                            });
                                        } else {
                                            _queue.BackupQueue.push(backup);
                                            res.json({
                                                error: false,
                                                message: "Backup was added to the queue"
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            res.json({
                                error: true,
                                message: "Invalid destination or path"
                            });
                        }
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
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

router.post('/scheduler/add', function (req, res, next) {
    if (req.user) {
        if (req.body.databaseId) {
            _database2.default.findOne({ _id: req.body.databaseId }, function (err, database) {
                if (err) {
                    res.json({
                        error: true,
                        message: "An internal error occurred"
                    });
                } else {
                    if (database) {
                        if ((req.body.destination == "s3" || req.body.destination == "local") && req.body.path && req.body.rule && _nodeCron2.default.validate(req.body.rule)) {
                            var newScheduler = new _scheduler2.default({ database: database._id, destination: { type: req.body.destination, path: req.body.path }, rule: req.body.rule });
                            newScheduler.save(function (err) {
                                if (err) {
                                    res.json({
                                        error: true,
                                        message: "An internal error occurred"
                                    });
                                } else {
                                    (0, _queue.AddSchedule)({
                                        _id: newScheduler._id,
                                        database: database,
                                        destination: newScheduler.destination,
                                        rule: newScheduler.rule
                                    });
                                    res.json({
                                        error: false,
                                        message: "Task was added"
                                    });
                                }
                            });
                        } else {
                            res.json({
                                error: true,
                                message: "Invalid parameters"
                            });
                        }
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
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

router.post('/scheduler/delete', function (req, res, next) {
    if (req.user) {
        if (req.body.taskId) {
            _scheduler2.default.findOne({ _id: req.body.taskId }, function (err, schedule) {
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
                                (0, _queue.RemoveSchedule)(schedule._id);
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
    } else {
        return res.json({
            error: true,
            message: "Not logged in"
        });
    }
});

exports.default = router;