import { Router } from 'express';
import Passport from 'passport';
import Bcrypt from 'bcrypt';
import User from '../models/user';
import Settings from '../models/settings';

const router = new Router();

router.post('/login', function(req, res, next) {
    Passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.json({ error: true, message: "Incorrect username or password" }); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.json({
                error: false,
                message: "Signed in",
                user: { username: user.username, email: user.email, group: user.group, isLoggedIn: true }
            });
        });
    })(req, res, next);
});

router.post('/logout', function(req, res) {
    req.logout();
    res.json({error: false});
});

router.post('/getuser', function(req, res, next) {
    if (req.user) {
        return res.json({
            error: false,
            message: "Session found",
            user: { username: req.user.username, email: req.user.email, group: req.user.group, isLoggedIn: true }
        });
    } else {
        return res.json({
            error: true,
            message: "Session not found"
        });
    }
})

router.post('/settings/get', function(req, res, next) {
    if (req.user) {
        Settings.find({}, function(err, settings) {
            if (settings.length == 0) {
                Settings.insertMany([new Settings({uniqueId: "region", value: ""}), new Settings({uniqueId: "accessKey", value: ""}), new Settings({uniqueId: "secretKey", value: ""})]);
                return res.json({error: false, message: "Settings retrieved", settings: {region: "", accessKey: "", secretKey: ""}});
            } else {
                var settingsJson = {}
                settings.map(function(setting, index) {
                    settingsJson[setting.uniqueId] = setting.value;
                    if (index == (settings.length - 1)) {
                        return res.json({error: false, message: "Settings retrieved", settings: settingsJson});
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

router.post('/settings/save', function(req, res, next) {
    if (req.user) {
        if (req.body.region && req.body.accessKey && req.body.secretKey) {
            Settings.find({}, function(err, settings) {
                settings.map(function(setting, index) {
                    setting.value = req.body[setting.uniqueId];
                    setting.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
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

export default router;