import Schema from './schema';
import os from 'os';
import fs from 'fs';
const { spawn } = require('child_process');


//MySQL
Schema.engines.mysql.methods = {
    generateFilename(input) {
        return `${input.database._id}_${input.database.engine}_${new Date(input.startDate).valueOf()}.gz`
    },
    performBackup(filename, input, cb) {
        const tmpDir = os.tmpdir();
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
                        fs.writeFile(tmpDir + "/" + filename, gzip_stdout, function(err) {
                            if (err) {
                                cb(true, Buffer.concat([mysqldump_stderr, gzip_stderr]).toString() + err, null);
                            } else {
                                cb(false, Buffer.concat([mysqldump_stderr, gzip_stderr]).toString(), `${tmpDir}/${filename}`);
                            }
                        });
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
    performBackup: function(filename, input, cb) {
        const tmpDir = os.tmpdir();
        let stdout = [];
        let stderr = [];
        stderr.push(Buffer.from('Starting backup...\n'))
        const mongodump = spawn('mongodump', ['--uri', input.database.options.uri, '--gzip', `--archive=${tmpDir}/${filename}`]);
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
                cb(false, mongodump_stderr.toString(), `${tmpDir}/${filename}`);
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

Schema.storages.local.methods = {
    storeBackup(filename, path, input, cb) {
        fs.rename(path, `${input.destination.options.path}/${filename}`, function (err) {
            if (err) {
                cb(true, err);
            } else {
                cb(false, `File was successfully moved to ${input.destination.options.path}/${filename}.\n`);
            }
        });
    }
};

Schema.storages.s3.methods = {

};

Schema.storages.gcs.methods = {

};

module.exports = Schema;