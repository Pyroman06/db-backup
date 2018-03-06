import Path from 'path';
import Express from 'express';
import Mongoose from 'mongoose';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import Config from './config.json';
import Routes from './routes/index';

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

//Hosting static assets
app.use(Express.static(Path.join(__dirname, '..', 'public')));

//Routes
app.use('/', Routes);

//Displaying static HTML page otherwise
app.get('*', (req, res) => {
    res.sendFile(Path.join(__dirname, '..', 'public', 'index.html'));
});

server.listen(port);