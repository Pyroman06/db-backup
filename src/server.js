import Path from 'path';
import Express from 'express';
import ExpressSession from 'express-session';
import Mongoose from 'mongoose';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import Passport from 'passport';
import PassportLocal from 'passport-local';
import Bcrypt from 'bcrypt';
import Config from './config.json';
import Routes from './routes/index';
import User from './models/user';

const LocalStrategy = PassportLocal.Strategy;
const port = process.argv[2] || 4000;

//Connect to the database
Mongoose.connect(Config.mongoDBUri);

//Initializing Express and creating a server
const app = new Express();
var server = require('http').createServer(app); 

//Trust proxy, so we can get the real IP behind CloudFlare
app.enable('trust proxy');

//Handling requests with body-parser and cookie-parser
app.use(CookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

//Handling sessions for authentication
app.use(ExpressSession({
    secret: Config.secret,
    resave: false,
    saveUninitialized: false
}))
app.use(Passport.initialize());
app.use(Passport.session());

//Authentication
Passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username : username }, function(err, user){
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Invalid username' });
        }

        if (Bcrypt.compareSync(password, user.password)) {
            done(null, user)
        } else {
            done(null, false, { message: 'Invalid password' });
        }
    });
}));

Passport.serializeUser(function(user, done) {
    done(null, user.id);
});

Passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        if (err) {
            done(err)
        };
        done(null, user);
    });
});




//Hosting static assets
app.use(Express.static(Path.join(__dirname, '..', 'public')));

//Routes
app.use('/api', Routes);

//Displaying static HTML page otherwise
app.get('*', (req, res) => {
    res.sendFile(Path.join(__dirname, '..', 'public', 'index.html'));
});

server.listen(port);