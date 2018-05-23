import Schema from './schema';
import os from 'os';
import fs from 'fs';
import s3 from 'aws-sdk/clients/s3';
import gcs from '@google-cloud/storage';
import { PassThrough } from 'stream';
import { spawn } from 'child_process';


//MySQL
Schema.engines.mysql.methods = {
    generateFilename(input) {
        return `${input.database._id}_${input.database.engine}_${new Date(input.startDate).valueOf()}.gz`
    },
    performBackup(input, hashStreams, storageStream, cb) {
        let stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'))
        const gzip = spawn('gzip', ['-c']);
        hashStreams.map(function(stream) {
            gzip.stdout.pipe(stream);
        })
        gzip.stdout.pipe(storageStream);
        gzip.stderr.on('data', data => {
            stderr.push(data);
        });
        gzip.on('exit', code => {
            stderr.push(Buffer.from(`Compression was completed with code ${code}.\n`))
            if (code == 0) {
                cb(false, Buffer.concat(stderr).toString());
                hashStreams.map(function(stream) {
                    stream.end();
                })
                storageStream.end();
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        })
        const mysqldump = spawn('mysqldump',['--all-databases', `--user=${input.database.options.username}`, `--password=${input.database.options.password}`, `--port=${input.database.options.port}`, `--host=${input.database.options.hostname}`, '--verbose']);
        mysqldump.stdout.pipe(gzip.stdin);
        mysqldump.stderr.on('data', data => {
            stderr.push(data);
        });
        mysqldump.on('exit', code => {
            stderr.push(Buffer.from(`Backup was completed with code ${code}.\n`))
            if (code == 0) {
                gzip.stdin.end();
                stderr.push(Buffer.from(`Starting compression...\n`))
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        })
    }
};

//MongoDB
Schema.engines.mongodb.methods = {
    generateFilename: function (input) {
        return `${input.database._id}_${input.database.engine}_${new Date(input.startDate).valueOf()}.gz`
    },
    performBackup: function (input, hashStreams, storageStream, cb) {
        let stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'))
        const mongodump = spawn('mongodump', ['--uri', input.database.options.uri, '--gzip', '--archive']);
        hashStreams.map(function(stream) {
            mongodump.stdout.pipe(stream);
        })
        mongodump.stdout.pipe(storageStream);
        mongodump.stderr.on('data', data => {
            stderr.push(data);
        });

        mongodump.on('exit', code => {
            stderr.push(Buffer.from(`Backup was completed with code ${code}.\n`))

            if (code == 0) {
                cb(false, Buffer.concat(stderr).toString());
                hashStreams.map(function(stream) {
                    stream.end();
                })
                storageStream.end();
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        })
    }
};


//PostgreSQL
Schema.engines.postgresql.methods = {
    generateFilename: function (input) {
        return `${input.database._id}_${input.database.engine}_${new Date(input.startDate).valueOf()}.gz`
    },
    performBackup(input, hashStreams, storageStream, cb) {
        let stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'))
        const gzip = spawn('gzip', ['-c']);
        hashStreams.map(function(stream) {
            gzip.stdout.pipe(stream);
        })
        gzip.stdout.pipe(storageStream);
        gzip.stderr.on('data', data => {
            stderr.push(data);
        });
        gzip.on('exit', code => {
            stderr.push(Buffer.from(`Compression was completed with code ${code}.\n`))
            if (code == 0) {
                cb(false, Buffer.concat(stderr).toString());
                hashStreams.map(function(stream) {
                    stream.end();
                })
                storageStream.end();
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        })
        let env = Object.create(process.env);
        env.PGPASSWORD = input.database.options.password;
        const pg_dump = spawn('pg_dumpall', [`--username=${input.database.options.username}`, `--port=${input.database.options.port}`, `--host=${input.database.options.hostname}`, '--no-password', '--no-role-password', '--verbose'], { env });
        pg_dump.stdout.pipe(gzip.stdin);
        pg_dump.stderr.on('data', data => {
            stderr.push(data);
        });
        pg_dump.on('exit', code => {
            stderr.push(Buffer.from(`Backup was completed with code ${code}.\n`))
            if (code == 0) {
                gzip.stdin.end();
                stderr.push(Buffer.from(`Starting compression...\n`))
            } else {
                cb(true, Buffer.concat(stderr).toString());
            }
        })
    }
};

//Local
Schema.storages.local.methods = {
    storeBackup(filename, input, cb) {
        let stream = fs.createWriteStream(`${input.destination.options.path}/${filename}`, { flags: 'w' });
        stream.on('error', function(err) {
            cb(true, err);
        });
        stream.on('close', function() {
            cb(false, `File was successfully written to ${input.destination.options.path}/${filename}.\n`);
        })

        return stream;
    }
};

//Amazon S3
Schema.storages.s3.methods = {
    storeBackup(filename, input, cb) {
        let stream = new PassThrough();
        let s3Instance = new s3();
        s3Instance.config.update({ accessKeyId: input.destination.options.accessKey, secretAccessKey: input.destination.options.secretKey, region: input.destination.options.region })
        s3Instance.upload({
            Bucket: input.destination.options.bucket,
            Key: `${input.destination.options.path}/${filename}`,
            Body: stream
        }, (err, data) => {
            if (err) {
                cb(true, err);
            } else {
                cb(false, `Uploaded ${filename} to Amazon S3`);
            }
        });
        return stream;
    }
};

//Google Cloud Storage
Schema.storages.gcs.methods = {
    storeBackup(filename, input, cb) {
        let gcsInstance = new gcs({ projectId: input.destination.options.project, credentials: input.destination.options.serviceAccount })
        let ws = gcsInstance.bucket(input.destination.options.bucket).file(`${input.destination.options.path}/${filename}`).createWriteStream();
        ws.on('error', function (err) {
            cb(true, err);
        });
        ws.on('finish', function () {
            cb(false, `Uploaded ${filename} to Google Cloud Storage`);
        });
        return ws;
    }
};

module.exports = Schema;