"use strict";

var _stream = require("stream");

module.exports = {
    engines: {
        mysql: {
            name: "MySQL",
            fields: {
                hostname: { type: String, default: "", name: "Hostname", description: "Hostname of your database" },
                port: { type: Number, default: 3306, name: "Port", description: "Port of your database" },
                username: { type: String, default: "", name: "Username", description: "Username for your database" },
                password: { type: String, default: "", name: "Password", description: "Password for your database", masked: true }
            }
        },
        postgresql: {
            name: "PostgreSQL",
            fields: {
                hostname: { type: String, default: "", name: "Hostname", description: "Hostname of your database" },
                port: { type: Number, default: 5432, name: "Port", description: "Port of your database" },
                username: { type: String, default: "", name: "Username", description: "Username for your database" },
                password: { type: String, default: "", name: "Password", description: "Password for your database", masked: true }
            }
        },
        mongodb: {
            name: "MongoDB",
            fields: {
                uri: { type: String, default: "", name: "Connection string", description: "Connection string for your MongoDB database", masked: true }
            }
        }
    },
    storages: {
        local: {
            name: "Local",
            fields: {
                path: { type: String, default: "/tmp", name: "Path", description: "Backup path" }
            }
        },
        s3: {
            name: "Amazon S3",
            fields: {
                region: { type: String, required: true, default: "", name: "Region", description: "Region of your Amazon S3 bucket" },
                accessKey: { type: String, required: true, default: "", name: "Access Key ID", description: "Access Key ID of your Amazon IAM user" },
                secretKey: { type: String, required: true, default: "", name: "Secret Key ID", description: "Secret Key ID of your Amazon IAM user", masked: true },
                bucket: { type: String, required: true, default: "", name: "Bucket", description: "Name of your Amazon S3 bucket" }
            }
        },
        gcs: {
            name: "Google Cloud Storage",
            fields: {
                serviceAccount: { type: Object, name: "Service account", description: "Service account credentials" },
                bucket: { type: String, default: "", name: "Bucket", description: "Name of your Amazon S3 bucket" }
            }
        }
    }
};