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
        mongodb: {
            name: "MongoDB",
            fields: {
                uri: { type: String, required: true, name: "Connection string", description: "Connection string for your MongoDB database" }
            }
        }
    },
    storages: {}
};