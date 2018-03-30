# db-backup
Web-based MySQL/MongoDB database backup tool created with Node.js and React
## Requirements
The following requirements must be met in order to run this application:
- forever
Forever is being used to run a production server
``` bash
npm install -g forever
```
- nodemon (only for development server)
Nodemon is being used to run development server
``` bash
npm install -g nodemon
```
- mysql-client package
``` bash
apt-get install mysql-client
```
- mongodb-org-tools
``` bash
apt-get install mongodb-org-tools
```
## Installation
Use the following commands for installation:
``` bash
# install modules
npm install
# build backend
npm run build
# build frontend
npm run build-client
```
## Configuration
The following JSON configuration file is being used for initial configuration (config.json):
``` json
{
    "mongoDBUri": "",
    "secret": ""
}
```
Parameters:
- mongoDBUri: Connection string for MongoDB
- secret: Any string for express-session
## Start
Use the following command to run production server with forever:
``` bash
npm start
```
If you want to run a development server instead, then use the following command:
``` bash
npm run dev
```
