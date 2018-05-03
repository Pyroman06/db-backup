import Schema from './schema';
import os from 'os';
import fs from 'fs';
import s3 from 'aws-sdk/clients/s3';
import gcs from '@google-cloud/storage';
const { spawn } = require('child_process');


//MySQL
Schema.engines.mysql.methods = {
    generateFilename(input) {
        return `${input.database._id}_${input.database.engine}_${new Date(input.startDate).valueOf()}.gz`
    },
    performBackup(input, cb) {
        let stdout = [];
        let stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'))
        const mysqldump = spawn('mysqldump', ['--all-databases', `--user=${input.database.options.username}`, `--password=${input.database.options.password}`, `--port=${input.database.options.port}`, `--host=${input.database.options.hostname}`, '--verbose']);
        mysqldump.stdout.on('data', data => {
            stdout.push(data);
        });
        mysqldump.stderr.on('data', data => {
            stderr.push(data);
        });
        mysqldump.on('exit', code => {
            stderr.push(Buffer.from(`Backup was completed with code ${code}.\n`))
            let mysqldump_stdout = Buffer.concat(stdout);
            let mysqldump_stderr = Buffer.concat(stderr);
            stdout = [];
            stderr = [];
            stderr.push(Buffer.from(`Starting compression...\n`))
            if (code == 0) {
                const gzip = spawn('gzip', ['-c']);
                gzip.stdout.on('data', function(data) {
                    stdout.push(data);
                });
                gzip.stderr.on('data', data => {
                    stderr.push(data);
                });
                gzip.on('exit', code => {
                    stderr.push(Buffer.from(`Compression was completed with code ${code}.\n`))
                    let gzip_stdout = Buffer.concat(stdout);
                    let gzip_stderr = Buffer.concat(stderr);
                    if (code == 0) {
                        cb(false, Buffer.concat([mysqldump_stderr, gzip_stderr]).toString(), gzip_stdout);
                    } else {
                        cb(true, Buffer.concat([mysqldump_stderr, gzip_stderr]).toString(), null);
                    }
                })

                gzip.stdin.write(mysqldump_stdout);
                gzip.stdin.end();
            } else {
                cb(true, mysqldump_stderr.toString(), null);
            }
        })
    }
};

//MongoDB
Schema.engines.mongodb.methods = {
    generateFilename: function(input) {
        return `${input.database._id}_${input.database.engine}_${new Date(input.startDate).valueOf()}.gz`
    },
    performBackup: function(input, cb) {
        const tmpDir = os.tmpdir();
        let stdout = [];
        let stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'))
        const mongodump = spawn('mongodump', ['--uri', input.database.options.uri, '--gzip', '--archive']);
        mongodump.stdout.on('data', data => {
            stdout.push(data);
        });
        mongodump.stderr.on('data', data => {
            stderr.push(data);
        });
        mongodump.on('exit', code => {
            stderr.push(Buffer.from(`Backup was completed with code ${code}.\n`))
            let mongodump_stdout = Buffer.concat(stdout);
            let mongodump_stderr = Buffer.concat(stderr);

            if (code == 0) {
                cb(false, mongodump_stderr.toString(), mongodump_stdout);
            } else {
                cb(true, mongodump_stderr.toString(), null);
            }
        })
    }
};


//PostgreSQL
Schema.engines.postgresql.methods = {
    generateFilename: function(input) {
        return `${input.database._id}_${input.database.engine}_${new Date(input.startDate).valueOf()}.gz`
    },
    performBackup: function(filename, input, cb) {
        
    }
};

//Local
Schema.storages.local.methods = {
    storeBackup(filename, buf, input, cb) {
        fs.writeFile(`${input.destination.options.path}/${filename}`, buf, function(err) {
            if (err) {
                cb(true, err);
            } else {
                cb(false, `File was successfully written to ${input.destination.options.path}/${filename}.\n`);
            }
        });
    }
};

//Amazon S3
Schema.storages.s3.methods = {
    storeBackup(filename, buf, input, cb) {
        let s3Instance = new s3();
        s3Instance.config.update({accessKeyId: input.destination.options.accessKey, secretAccessKey: input.destination.options.secretKey, region: input.destination.options.region})
        s3Instance.putObject({
            Bucket: input.destination.options.bucket,
            Key: `${input.destination.options.path}/${filename}`,
            Body: buf
        }, (err, data) => {
            if (err) {
                cb(true, err);
            } else {
                cb(false, `Uploaded ${filename} to Amazon S3`);
            }
        });
    }
};

//Google Cloud Storage
Schema.storages.gcs.methods = {
    storeBackup(filename, buf, input, cb) {
        let gcsInstance = new gcs({ projectId: input.destination.options.project, credentials: input.destination.options.serviceAccount })
        let ws = gcsInstance.bucket(input.destination.options.bucket).file(`${input.destination.options.path}/${filename}`).createWriteStream();
        ws.on('error', function(err) {
            cb(true, err);
        });
        ws.on('finish', function() {
            cb(false, `Uploaded ${filename} to Google Cloud Storage`);
        });
        ws.end(buf);
    }
};

module.exports = Schema;