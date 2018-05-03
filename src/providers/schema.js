import { ENUM } from './types';

module.exports = {
    engines: {
        mysql: {
            name: "MySQL",
            fields: {
                hostname: { type: ENUM.TYPE_STRING, default: "", name: "Hostname", description: "Hostname of your database" },
                port: { type: ENUM.TYPE_NUMBER, default: 3306, name: "Port", description: "Port of your database", mix: 0, max: 65535 },
                username: { type: ENUM.TYPE_STRING, default: "", name: "Username", description: "Username for your database" },
                password: { type: ENUM.TYPE_STRING, default: "", name: "Password", description: "Password for your database", masked: true }
            }
        },
        postgresql: {
            name: "PostgreSQL",
            fields: {
                hostname: { type: ENUM.TYPE_STRING, default: "", name: "Hostname", description: "Hostname of your database" },
                port: { type: ENUM.TYPE_NUMBER, default: 5432, name: "Port", description: "Port of your database", mix: 0, max: 65535 },
                username: { type: ENUM.TYPE_STRING, default: "", name: "Username", description: "Username for your database" },
                password: { type: ENUM.TYPE_STRING, default: "", name: "Password", description: "Password for your database", masked: true }
            }
        },
        mongodb: {
            name: "MongoDB",
            fields: {
                uri: { type: ENUM.TYPE_STRING, default: "", name: "Connection string", description: "Connection string for your MongoDB database", masked: true }
            }
        }
    },
    storages: {
        local: {
            name: "Local",
            fields: {
                path: { type: ENUM.TYPE_STRING, default: "/tmp", name: "Path", description: "Backup path" }
            }
        },
        s3: {
            name: "Amazon S3",
            fields: {
                region: { type: ENUM.TYPE_STRING, default: "", name: "Region", description: "Region of your Amazon S3 bucket" },
                accessKey: { type: ENUM.TYPE_STRING, default: "", name: "Access Key ID", description: "Access Key ID of your Amazon IAM user" },
                secretKey: { type: ENUM.TYPE_STRING, default: "", name: "Secret Key ID", description: "Secret Key ID of your Amazon IAM user", masked: true },
                bucket: { type: ENUM.TYPE_STRING, default: "", name: "Bucket", description: "Name of your Amazon S3 bucket" },
                path: { type: ENUM.TYPE_STRING, default: "backups", name: "Path", description: "Path within the bucket" }
            }
        },
        gcs: {
            name: "Google Cloud Storage",
            fields: {
                project: { type: ENUM.TYPE_STRING, default: "", name: "Project ID", description: "ID of the project where your bucket is located" },
                serviceAccount: { type: ENUM.TYPE_FILE, default: "", name: "Service account", description: "JSON file with your GCS service account credentials" },
                bucket: { type: ENUM.TYPE_STRING, default: "", name: "Bucket", description: "Name of your GCS bucket" },
                path: { type: ENUM.TYPE_STRING, default: "backups", name: "Path", description: "Path within the bucket" }
            }
        }
    }
}