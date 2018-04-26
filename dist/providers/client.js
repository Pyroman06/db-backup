"use strict";

module.exports = {
    engines: {
        mysql: {
            name: "MySQL",
            fields: {
                hostname: { type: String, required: true, name: "Hostname", description: "Hostname of your database" },
                port: { type: Number, required: true, name: "Port", description: "Port of your database" },
                username: { type: String, required: true, name: "Username", description: "Username for your database" },
                password: { type: String, required: true, name: "Password", description: "Password for your database" }
            }
        },
        postgresql: {
            name: "PostgreSQL",
            fields: {
                hostname: { type: String, required: true, name: "Hostname", description: "Hostname of your database" },
                port: { type: Number, required: true, name: "Port", description: "Port of your database" },
                username: { type: String, required: true, name: "Username", description: "Username for your database" },
                password: { type: String, required: true, name: "Password", description: "Password for your database" }
            }
        },
        mongodb: {
            name: "MongoDB",
            fields: {
                uri: { type: String, required: true, name: "Connection string", description: "Connection string for your MongoDB database" }
            }
        }
    },
    storages: {
        s3: {
            name: "Amazon S3",
            fields: {
                authentication: {
                    region: { type: String, required: true, name: "Region", description: "Region of your Amazon S3 bucket" },
                    accessKey: { type: String, required: true, name: "Access Key ID", description: "Access Key ID of your Amazon IAM user" },
                    secretKey: { type: String, required: true, name: "Secret Key ID", description: "Secret Key ID of your Amazon IAM user" }
                },
                parameters: {
                    bucket: { type: String, required: true, name: "Bucket", description: "Name of your Amazon S3 bucket" }
                }
            }
        },
        gcs: {
            name: "Google Cloud Storage",
            fields: {
                authentication: {
                    serviceAccount: { type: File, required: true, name: "Service account file", description: "A file containing your service account credentials" }
                },
                parameters: {
                    bucket: { type: String, required: true, name: "Bucket", description: "Name of your Amazon S3 bucket" }
                }
            }
        }
    }
};