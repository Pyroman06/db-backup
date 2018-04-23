'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AWSLoadConfig = AWSLoadConfig;
exports.AWSUpdateConfig = AWSUpdateConfig;
exports.AWSUploadToS3 = AWSUploadToS3;

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _settings = require('./models/settings');

var _settings2 = _interopRequireDefault(_settings);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s3;

function AWSLoadConfig() {
    _settings2.default.find({}, function (err, settings) {
        var accessKeyId = settings.find(function (el) {
            return el.uniqueId == "accessKey";
        });

        var secretAccessKey = settings.find(function (el) {
            return el.uniqueId == "secretKey";
        });

        var region = settings.find(function (el) {
            return el.uniqueId == "region";
        });

        if (accessKeyId && secretAccessKey && region) {
            _awsSdk2.default.config.update({ accessKeyId: accessKeyId.value, secretAccessKey: secretAccessKey.value, region: region.value });
            s3 = new _awsSdk2.default.S3();
        }
    });
}

function AWSUpdateConfig(accessKeyId, secretAccessKey, region) {
    _awsSdk2.default.config.update({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, region: region });
    s3 = new _awsSdk2.default.S3();
}

function AWSUploadToS3(bucket, path, fileName, cb) {
    _fs2.default.readFile(path, function (error, fileContent) {
        if (error) {
            cb(error, null);
        } else {
            s3.putObject({
                Bucket: bucket,
                Key: fileName,
                Body: fileContent
            }, function (err, data) {
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, "Uploaded " + fileName + " to Amazon S3");
                }
            });
        }
    });
}