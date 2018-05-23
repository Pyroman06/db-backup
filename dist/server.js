'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

var _index = require('./routes/index');

var _index2 = _interopRequireDefault(_index);

var _user = require('./models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocalStrategy = _passportLocal2.default.Strategy;
var port = process.argv[2] || 4000;

//Connecting to the database
_mongoose2.default.connect(_config2.default.mongoDBUri);

//Initializing Express and creating a server
var app = new _express2.default();
var server = require('http').createServer(app);

//Trust proxy, so we can get the real IP behind CloudFlare
app.enable('trust proxy');

//Handling requests with body-parser
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

//Handling sessions for authentication
var MongoStore = require('connect-mongo')(_expressSession2.default);
app.use((0, _expressSession2.default)({
    secret: _config2.default.secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: _mongoose2.default.connection }),
    cookie: { maxAge: 86400000 }
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

//Authentication
_passport2.default.use(new LocalStrategy(function (username, password, done) {
    _user2.default.findOne({ username: username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Invalid username' });
        }

        if (_bcrypt2.default.compareSync(password, user.password)) {
            done(null, user);
        } else {
            done(null, false, { message: 'Invalid password' });
        }
    });
}));

_passport2.default.serializeUser(function (user, done) {
    done(null, user.id);
});

_passport2.default.deserializeUser(function (id, done) {
    _user2.default.findById(id, function (err, user) {
        if (err) {
            done(err);
        };
        done(null, user);
    });
});

//Hosting static assets
app.use(_express2.default.static(_path2.default.join(__dirname, '..', 'public')));

//Routes
app.use('/api', _index2.default);

//Displaying static HTML page otherwise
app.get('*', function (req, res) {
    res.sendFile(_path2.default.join(__dirname, '..', 'public', 'index.html'));
});

server.listen(port);