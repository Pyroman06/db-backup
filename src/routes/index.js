import { Router } from 'express';
import Passport from 'passport';
import Bcrypt from 'bcrypt';
import User from '../models/user';

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
        })
    }
})

export default router;