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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('child_process'),
    spawn = _require.spawn;

//MySQL


_schema2.default.engines.mysql.methods = {
    generateFilename: function generateFilename(input) {
        return input.database._id + '_' + input.database.engine + '_' + new Date(input.startDate).valueOf() + '.gz';
    },
    performBackup: function performBackup(input, cb) {
        var stdout = [];
        var stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'));
        var mysqldump = spawn('mysqldump', ['--all-databases', '--user=' + input.database.options.username, '--password=' + input.database.options.password, '--port=' + input.database.options.port, '--host=' + input.database.options.hostname, '--verbose']);
        mysqldump.stdout.on('data', function (data) {
            stdout.push(data);
        });
        mysqldump.stderr.on('data', function (data) {
            stderr.push(data);
        });
        mysqldump.on('exit', function (code) {
            stderr.push(Buffer.from('Backup was completed with code ' + code + '.\n'));
            var mysqldump_stdout = Buffer.concat(stdout);
            var mysqldump_stderr = Buffer.concat(stderr);
            stdout = [];
            stderr = [];
            stderr.push(Buffer.from('Starting compression...\n'));
            if (code == 0) {
                var gzip = spawn('gzip', ['-c']);
                gzip.stdout.on('data', function (data) {
                    stdout.push(data);
                });
                gzip.stderr.on('data', function (data) {
                    stderr.push(data);
                });
                gzip.on('exit', function (code) {
                    stderr.push(Buffer.from('Compression was completed with code ' + code + '.\n'));
                    var gzip_stdout = Buffer.concat(stdout);
                    var gzip_stderr = Buffer.concat(stderr);
                    if (code == 0) {
                        cb(false, Buffer.concat([mysqldump_stderr, gzip_stderr]).toString(), gzip_stdout);
                    } else {
                        cb(true, Buffer.concat([mysqldump_stderr, gzip_stderr]).toString(), null);
                    }
                });

                gzip.stdin.write(mysqldump_stdout);
                gzip.stdin.end();
            } else {
                cb(true, mysqldump_stderr.toString(), null);
            }
        });
    }
};

//MongoDB
_schema2.default.engines.mongodb.methods = {
    generateFilename: function generateFilename(input) {
        return input.database._id + '_' + input.database.engine + '_' + new Date(input.startDate).valueOf() + '.gz';
    },
    performBackup: function performBackup(input, cb) {
        var tmpDir = _os2.default.tmpdir();
        var stdout = [];
        var stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'));
        var mongodump = spawn('mongodump', ['--uri', input.database.options.uri, '--gzip', '--archive']);
        mongodump.stdout.on('data', function (data) {
            stdout.push(data);
        });
        mongodump.stderr.on('data', function (data) {
            stderr.push(data);
        });
        mongodump.on('exit', function (code) {
            stderr.push(Buffer.from('Backup was completed with code ' + code + '.\n'));
            var mongodump_stdout = Buffer.concat(stdout);
            var mongodump_stderr = Buffer.concat(stderr);

            if (code == 0) {
                cb(false, mongodump_stderr.toString(), mongodump_stdout);
            } else {
                cb(true, mongodump_stderr.toString(), null);
            }
        });
    }
};

//PostgreSQL
_schema2.default.engines.postgresql.methods = {
    generateFilename: function generateFilename(input) {
        return input.database._id + '_' + input.database.engine + '_' + new Date(input.startDate).valueOf() + '.gz';
    },
    performBackup: function performBackup(filename, input, cb) {}
};

//Local
_schema2.default.storages.local.methods = {
    storeBackup: function storeBackup(filename, buf, input, cb) {
        _fs2.default.writeFile(input.destination.options.path + '/' + filename, buf, function (err) {
            if (err) {
                cb(true, err);
            } else {
                cb(false, 'File was successfully written to ' + input.destination.options.path + '/' + filename + '.\n');
            }
        });
    }
};

//Amazon S3
_schema2.default.storages.s3.methods = {
    storeBackup: function storeBackup(filename, buf, input, cb) {
        var s3Instance = new _s2.default();
        s3Instance.config.update({ accessKeyId: input.destination.options.accessKey, secretAccessKey: input.destination.options.secretKey, region: input.destination.options.region });
        s3Instance.putObject({
            Bucket: input.destination.options.bucket,
            Key: input.destination.options.path + '/' + filename,
            Body: buf
        }, function (err, data) {
            if (err) {
                cb(true, err);
            } else {
                cb(false, 'Uploaded ' + filename + ' to Amazon S3');
            }
        });
    }
};

//Google Cloud Storage
_schema2.default.storages.gcs.methods = {
    storeBackup: function storeBackup(filename, buf, input, cb) {
        var gcsInstance = new _storage2.default({ projectId: input.destination.options.project, credentials: input.destination.options.serviceAccount });
        var ws = gcsInstance.bucket(input.destination.options.bucket).file(input.destination.options.path + '/' + filename).createWriteStream();
        ws.on('error', function (err) {
            cb(true, err);
        });
        ws.on('finish', function () {
            cb(false, 'Uploaded ' + filename + ' to Google Cloud Storage');
        });
        ws.end(buf);
    }
};

module.exports = _schema2.default;