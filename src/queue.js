import Queue from 'better-queue';

var backup = new Queue(function (input, cb) {
    const { spawnSync } = require( 'child_process' )
    if (input.engine == "mongodb") {
        var destination = '/tmp/db_backups';
        if (input.destination.provider == "local") {
            destination = input.destination.path;
        }
        const mongodump = spawnSync( 'mongodump', [ '--out', destination, '--uri', input.uri ] );
        if (mongodump.status == 0) {
            
        } else {
            input.backup.status = "failed";
            input.backup.log = mongodump.stderr;
            input.backup.save(function(err) {
                if (err) {
                    throw err;
                }
            })
        }
    } else if (input.engine == "mysql") {
        const mysqldump = spawnSync( 'mysqldump', [ '--all-databases', '--user=' + input.username, '--password=' + input.password, '--port=' + input.port, '--host=' + input.hostname, '--verbose' ] );

        if (mysqldump.status == 0) {

        } else {
            input.backup.status = "failed";
            input.backup.log = mysqldump.stderr;
            input.backup.save(function(err) {
                if (err) {
                    throw err;
                }
            })
        }
    }

    cb(null, result);
})

export default backup;