'use strict';

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _s = require('aws-sdk/clients/s3');

var _s2 = _interopRequireDefault(_s);

var _storage = require('@google-cloud/storage');

var _storage2 = _interopRequireDefault(_storage);

var _stream = require('stream');

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//MySQL
_schema2.default.engines.mysql.methods = {
    generateFilename: function generateFilename(input) {
        return input.database._id + '_' + input.database.engine + '_' + new Date(input.startDate).valueOf() + '.gz';
    },
    performBackup: function performBackup(input, hashStreams, storageStream, cb) {
        var stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'));
        var gzip = (0, _child_process.spawn)('gzip', ['-c']);
        hashStreams.map(function (stream) {
            gzip.stdout.pipe(stream);
        });
        gzip.stdout.pipe(storageStream);
        gzip.stderr.on('data', function (data) {
            stderr.push(data);
        });
        gzip.on('exit', function (code) {
            stderr.push(Buffer.from('Compression was completed with code ' + code + '.\n'));
            if (code == 0) {
                cb(false, Buffer.concat(stderr).toString());
                hashStreams.map(function (stream) {
                    stream.end();
                });
                storageStream.end();
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        });
        var mysqldump = (0, _child_process.spawn)('mysqldump', ['--all-databases', '--user=' + input.database.options.username, '--password=' + input.database.options.password, '--port=' + input.database.options.port, '--host=' + input.database.options.hostname, '--verbose']);
        mysqldump.stdout.pipe(gzip.stdin);
        mysqldump.stderr.on('data', function (data) {
            stderr.push(data);
        });
        mysqldump.on('exit', function (code) {
            stderr.push(Buffer.from('Backup was completed with code ' + code + '.\n'));
            if (code == 0) {
                gzip.stdin.end();
                stderr.push(Buffer.from('Starting compression...\n'));
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        });
    }
};

//MongoDB
_schema2.default.engines.mongodb.methods = {
    generateFilename: function generateFilename(input) {
        return input.database._id + '_' + input.database.engine + '_' + new Date(input.startDate).valueOf() + '.gz';
    },
    performBackup: function performBackup(input, hashStreams, storageStream, cb) {
        var stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'));
        var mongodump = (0, _child_process.spawn)('mongodump', ['--uri', input.database.options.uri, '--gzip', '--archive']);
        hashStreams.map(function (stream) {
            mongodump.stdout.pipe(stream);
        });
        mongodump.stdout.pipe(storageStream);
        mongodump.stderr.on('data', function (data) {
            stderr.push(data);
        });

        mongodump.on('exit', function (code) {
            stderr.push(Buffer.from('Backup was completed with code ' + code + '.\n'));

            if (code == 0) {
                cb(false, Buffer.concat(stderr).toString());
                hashStreams.map(function (stream) {
                    stream.end();
                });
                storageStream.end();
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        });
    }
};

//PostgreSQL
_schema2.default.engines.postgresql.methods = {
    generateFilename: function generateFilename(input) {
        return input.database._id + '_' + input.database.engine + '_' + new Date(input.startDate).valueOf() + '.gz';
    },
    performBackup: function performBackup(input, hashStreams, storageStream, cb) {
        var stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'));
        var gzip = (0, _child_process.spawn)('gzip', ['-c']);
        hashStreams.map(function (stream) {
            gzip.stdout.pipe(stream);
        });
        gzip.stdout.pipe(storageStream);
        gzip.stderr.on('data', function (data) {
            stderr.push(data);
        });
        gzip.on('exit', function (code) {
            stderr.push(Buffer.from('Compression was completed with code ' + code + '.\n'));
            if (code == 0) {
                cb(false, Buffer.concat(stderr).toString());
                hashStreams.map(function (stream) {
                    stream.end();
                });
                storageStream.end();
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        });
        var env = Object.create(process.env);
        env.PGPASSWORD = input.database.options.password;
        var pg_dump = (0, _child_process.spawn)('pg_dumpall', ['--username=' + input.database.options.username, '--port=' + input.database.options.port, '--host=' + input.database.options.hostname, '--no-password', '--no-role-password', '--verbose'], { env: env });
        pg_dump.stdout.pipe(gzip.stdin);
        pg_dump.stderr.on('data', function (data) {
            stderr.push(data);
        });
        pg_dump.on('exit', function (code) {
            stderr.push(Buffer.from('Backup was completed with code ' + code + '.\n'));
            if (code == 0) {
                gzip.stdin.end();
                stderr.push(Buffer.from('Starting compression...\n'));
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        });
    }
};

//Local
_schema2.default.storages.local.methods = {
    storeBackup: function storeBackup(filename, input, cb) {
        var stream = _fs2.default.createWriteStream(input.destination.options.path + '/' + filename, { flags: 'w' });
        stream.on('error', function (err) {
            cb(true, err);
        });
        stream.on('close', function () {
            cb(false, 'File was successfully written to ' + input.destination.options.path + '/' + filename + '.\n');
        });

        return stream;
    }
};

//Amazon S3
_schema2.default.storages.s3.methods = {
    storeBackup: function storeBackup(filename, input, cb) {
        var stream = new _stream.PassThrough();
        var s3Instance = new _s2.default();
        s3Instance.config.update({ accessKeyId: input.destination.options.accessKey, secretAccessKey: input.destination.options.secretKey, region: input.destination.options.region });
        s3Instance.upload({
            Bucket: input.destination.options.bucket,
            Key: input.destination.options.path + '/' + filename,
            Body: stream
        }, function (err, data) {
            if (err) {
                cb(true, err);
            } else {
                cb(false, 'Uploaded ' + filename + ' to Amazon S3');
            }
        });
        return stream;
    }
};

//Google Cloud Storage
_schema2.default.storages.gcs.methods = {
    storeBackup: function storeBackup(filename, input, cb) {
        var gcsInstance = new _storage2.default({ projectId: input.destination.options.project, credentials: input.destination.options.serviceAccount });
        var ws = gcsInstance.bucket(input.destination.options.bucket).file(input.destination.options.path + '/' + filename).createWriteStream();
        ws.on('error', function (err) {
            cb(true, err);
        });
        ws.on('finish', function () {
            cb(false, 'Uploaded ' + filename + ' to Google Cloud Storage');
        });
        return ws;
    }
};

module.exports = _schema2.default;