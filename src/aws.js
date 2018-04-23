import aws from 'aws-sdk';
import Settings from './models/settings';
import fs from 'fs';
var s3;

export function AWSLoadConfig() {
    Settings.find({}, function(err, settings) {
        var accessKeyId = settings.find(function(el) {
            return (el.uniqueId == "accessKey")
        });

        var secretAccessKey = settings.find(function(el) {
            return (el.uniqueId == "secretKey")
        });

        var region = settings.find(function(el) {
            return (el.uniqueId == "region")
        });

        if (accessKeyId && secretAccessKey && region) {
            aws.config.update({accessKeyId: accessKeyId.value, secretAccessKey: secretAccessKey.value, region: region.value});
            s3 = new aws.S3();
        }
    });
}

export function AWSUpdateConfig(accessKeyId, secretAccessKey, region) {
    aws.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, region: region});
    s3 = new aws.S3();
}

export function AWSUploadToS3(bucket, path, fileName, cb) {
    fs.readFile(path, (error, fileContent) => {
        if (error) {
            cb(error, null)
        } else {
            s3.putObject({
                Bucket: bucket,
                Key: fileName,
                Body: fileContent
            }, (err, data) => {
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, "Uploaded " + fileName + " to Amazon S3");
                }
            });
        }
  });
}