import React from 'react';
import { Card, Button, Elevation, Tag, Intent, ProgressBar, Collapse, FormGroup, Radio, RadioGroup, Spinner, Menu, MenuItem, Popover, Dialog } from '@blueprintjs/core';
import { AppToaster } from './toaster';

class Dashboard extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isAddDatabaseOpen: false,
            databaseName: "",
            databaseEngine: "mysql",
            databaseHostname: "",
            databasePort: "",
            databaseUsername: "",
            databasePassword: "",
            databaseUri: "",
            addDatabaseDisabled: false,
            error: false,
            loading: true,
            databases: {},
            schedules: {},
            backups: {},
            isManualBackupOpen: false,
            manualBackupDatabaseId: "",
            manualBackupDestination: "local",
            manualBackupPath: ""
        };
    }

    addTask() {

    }

    getDashboard() {
        this.setState({
            loading: true
        });
        fetch('/api/dashboard/get', {
            credentials: 'same-origin',
            method: 'POST',
        })
        .then((response) => {
            if (!response.ok) {
                this.setState({
                    error: true,
                    loading: false
                })
                AppToaster.show({ message: response.statusText, intent: Intent.DANGER });
            }

            return response;
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                this.setState({
                    databases: data.databases,
                    schedules: data.schedules,
                    backups: data.backups,
                    error: false,
                    loading: false
                })
            } else {
                this.setState({
                    error: true,
                    loading: false
                });
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            this.setState({
                error: true,
                loading: false
            });
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    handleAddDatabaseOpen() {
        this.setState({
            isAddDatabaseOpen: !this.state.isAddDatabaseOpen
        });
    }

    databaseNameChange(e) {
        this.setState({
            databaseName: e.target.value
        });
    }

    databaseEngineChange(e) {
        this.setState({
            databaseEngine: e.target.value
        });
    }

    databaseHostnameChange(e) {
        this.setState({
            databaseHostname: e.target.value
        });
    }

    databasePortChange(e) {
        this.setState({
            databasePort: e.target.value
        });
    }

    databaseUsernameChange(e) {
        this.setState({
            databaseUsername: e.target.value
        });
    }

    databasePasswordChange(e) {
        this.setState({
            databasePassword: e.target.value
        });
    }

    databaseUriChange(e) {
        this.setState({
            databaseUri: e.target.value
        });
    }

    addDatabase() {
        this.setState({
            addDatabaseDisabled: true
        });

        var data = {};
        if (this.state.databaseEngine == "mysql") {
            data = {name: this.state.databaseName, engine: this.state.databaseEngine, hostname: this.state.databaseHostname, port: this.state.databasePort, username: this.state.databaseUsername, password: this.state.databasePassword}
        } else if (this.state.databaseEngine == "mongodb") {
            data = {name: this.state.databaseName, engine: this.state.databaseEngine, uri: this.state.databaseUri}
        }

        fetch('/api/database/add', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then((response) => {
            if (!response.ok) {
                this.setState({
                    addDatabaseDisabled: false
                });
                AppToaster.show({ message: response.statusText, intent: Intent.DANGER });
            }

            return response;
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                AppToaster.show({ message: "Database was added", intent: Intent.SUCCESS });
                this.setState({
                    isAddDatabaseOpen: false,
                    addDatabaseDisabled: false,
                    databaseName: "",
                    databaseEngine: "mysql",
                    databaseHostname: "",
                    databasePort: "",
                    databaseUsername: "",
                    databasePassword: "",
                    databaseUri: ""
                });
                this.getDashboard();
            } else {
                this.setState({
                    addDatabaseDisabled: false
                });
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            this.setState({
                addDatabaseDisabled: false
            });
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    deleteDatabase(databaseId) {
        fetch('/api/database/delete', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                databaseId: databaseId
            })
        })
        .then((response) => {
            if (!response.ok) {
                AppToaster.show({ message: response.statusText, intent: Intent.DANGER });
            }

            return response;
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                AppToaster.show({ message: "Database was deleted", intent: Intent.SUCCESS });
                this.getDashboard();
            } else {
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    manualBackup(databaseId) {
        this.setState({
            manualBackupDatabaseId: databaseId,
            manualBackupDestination: "local",
            manualBackupPath: "",
            isManualBackupOpen: true
        });
    }

    manualBackupDestinationChange(e) {
        this.setState({
            manualBackupDestination: e.target.value
        });
    }

    manualBackupPathChange(e) {
        this.setState({
            manualBackupPath: e.target.value
        });
    }

    performManualBackup() {
        this.toggleManualBackup();
        fetch('/api/database/manualbackup', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                databaseId: this.state.manualBackupDatabaseId,
                destination: this.state.manualBackupDestination,
                path: this.state.manualBackupPath
            })
        })
        .then((response) => {
            if (!response.ok) {
                AppToaster.show({ message: response.statusText, intent: Intent.DANGER });
            }

            return response;
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                AppToaster.show({ message: "Backup was added to the queue", intent: Intent.SUCCESS });
                this.getDashboard();
            } else {
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    toggleManualBackup() {
        this.setState({
            isManualBackupOpen: !this.state.isManualBackupOpen
        });
    }

    componentWillMount() {
        this.getDashboard();
    }

    render() {
        if (this.state.loading || this.state.error) {
            return (
                <div className="db-loading-fill">
                    <Spinner />
                </div>
            );
        } else {
            var that = this;
            return (
                <div className="db-dashboard">
                    <div className="db-dashboard-item">
                        <h2>Databases</h2>
                        <Button text="Add new database" intent={ Intent.PRIMARY } onClick={this.handleAddDatabaseOpen.bind(this)} />
                        <Collapse isOpen={this.state.isAddDatabaseOpen}>
                            <div className="db-form-default" style={{marginTop: "15px"}}>
                                <FormGroup helperText="Choose a name for new database to be able to distinguish it from others" label="Name" labelFor="database-name" requiredLabel={true}>
                                    <input id="database-name" className="pt-input pt-intent-primary" type="text" placeholder="Name" dir="auto" value={this.state.databaseName} onChange={this.databaseNameChange.bind(this)} />
                                </FormGroup>
                                <RadioGroup
                                    label="Database engine"
                                    onChange={this.databaseEngineChange.bind(this)}
                                    selectedValue={this.state.databaseEngine}
                                >
                                    <Radio label="MySQL" value="mysql" />
                                    <Radio label="MongoDB" value="mongodb" />
                                </RadioGroup>
                                {
                                    this.state.databaseEngine == "mysql" &&
                                    <div>
                                        <FormGroup helperText="Hostname of your database" label="Hostname" labelFor="database-hostname" requiredLabel={true}>
                                            <input id="database-hostname" className="pt-input pt-intent-primary" type="text" placeholder="Hostname" dir="auto" value={this.state.databaseHostname} onChange={this.databaseHostnameChange.bind(this)} />
                                        </FormGroup>
                                        <FormGroup helperText="Port of your database" label="Port" labelFor="database-port" requiredLabel={true}>
                                            <input id="database-port" className="pt-input pt-intent-primary" type="text" placeholder="Port" dir="auto" value={this.state.databasePort} onChange={this.databasePortChange.bind(this)} />
                                        </FormGroup>
                                        <FormGroup helperText="Username for your database" label="Username" labelFor="database-username" requiredLabel={true}>
                                            <input id="database-username" className="pt-input pt-intent-primary" type="text" placeholder="Username" dir="auto" value={this.state.databaseUsername} onChange={this.databaseUsernameChange.bind(this)} />
                                        </FormGroup>
                                        <FormGroup helperText="Password for your database" label="Password" labelFor="database-password" requiredLabel={true}>
                                            <input id="database-password" className="pt-input pt-intent-primary" type="text" placeholder="Password" dir="auto" value={this.state.databasePassword} onChange={this.databasePasswordChange.bind(this)} />
                                        </FormGroup>
                                    </div>
                                    || this.state.databaseEngine == "mongodb" &&
                                    <div>
                                        <FormGroup helperText="Connection string for your MongoDB database" label="Connection string" labelFor="database-uri" requiredLabel={true}>
                                            <input id="database-uri" className="pt-input pt-intent-primary" type="text" placeholder="Connection string" dir="auto" value={this.state.databaseUri} onChange={this.databaseUriChange.bind(this)} />
                                        </FormGroup>
                                    </div>
                                }
                                <Button text="Add" intent={ Intent.PRIMARY } className="pt-large" loading={this.state.addDatabaseDisabled} onClick={this.addDatabase.bind(this)} />
                            </div>
                        </Collapse>
                        <table className="pt-html-table pt-interactive">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Engine</th>
                                    <th>Options</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {
                                this.state.databases ?
                                <tbody>
                                    {
                                        this.state.databases.map(function(database) {
                                            return  <tr>
                                                        <td>{database.name}</td>
                                                        <td>{database.engine == "mysql" && "MySQL" || database.engine == "mongodb" && "MongoDB"}</td>
                                                        <td>
                                                            {database.options.uri ? (<div>Connection string: {database.options.uri}</div>) : null}
                                                            {database.options.hostname ? (<div>Hostname: {database.options.hostname}</div>) : null}
                                                            {database.options.port ? (<div>Port: {database.options.port}</div>) : null}
                                                            {database.options.username ? (<div>Username: {database.options.username}</div>) : null}
                                                            {database.options.password ? (<div>Password: {database.options.password}</div>) : null}
                                                        </td>
                                                        <td>
                                                            <Popover content={<Menu><MenuItem icon="floppy-disk" onClick={that.manualBackup.bind(that, database._id)} text="Manual backup" /><MenuItem icon="delete" onClick={that.deleteDatabase.bind(that, database._id)} text="Delete" intent={Intent.DANGER} /></Menu>}>
                                                                <Button text="Menu" />
                                                            </Popover>
                                                            <Dialog
                                                                isOpen={that.state.isManualBackupOpen}
                                                                onClose={that.toggleManualBackup.bind(that)}
                                                                title="Manual backup"
                                                            >
                                                                <div style={{padding: "15px 15px 15px 15px"}}>
                                                                    <RadioGroup
                                                                        label="Backup destination"
                                                                        onChange={that.manualBackupDestinationChange.bind(that)}
                                                                        selectedValue={that.state.manualBackupDestination}
                                                                    >
                                                                        <Radio label="Local" value="local" />
                                                                        <Radio label="Amazon S3" value="s3" />
                                                                    </RadioGroup>
                                                                    {
                                                                        that.state.manualBackupDestination == "local" &&
                                                                            <FormGroup helperText="Path where to store backup" label="Path" labelFor="manual-local-path" requiredLabel={true}>
                                                                                <input id="manual-local-path" className="pt-input pt-intent-primary" type="text" placeholder="Path" dir="auto" value={that.state.manualBackupPath} onChange={that.manualBackupPathChange.bind(that)} />
                                                                            </FormGroup>
                                                                        || that.state.manualBackupDestination == "s3" &&
                                                                            <FormGroup helperText="S3 bucket to store backup in" label="Amazon S3 Bucket" labelFor="manual-s3-bucket" requiredLabel={true}>
                                                                                <input id="manual-s3-bucket" className="pt-input pt-intent-primary" type="text" placeholder="Amazon S3 Bucket" dir="auto" value={that.state.manualBackupPath} onChange={that.manualBackupPathChange.bind(that)} />
                                                                            </FormGroup>
                                                                        || null
                                                                    }
                                                                    <Button text="Start backup" intent={ Intent.PRIMARY } onClick={that.performManualBackup.bind(that)} />
                                                                </div>
                                                            </Dialog>
                                                        </td>
                                                    </tr>
                                        })
                                    }
                                </tbody>   
                                : null
                            }
                        </table>
                    </div>
                    <div className="db-dashboard-item">
                        <h2>Scheduler</h2>
                        <Button text="Add new task" intent={ Intent.PRIMARY } onClick={this.addTask.bind(this)} />
                        <table className="pt-html-table pt-interactive">
                            <thead>
                                <tr>
                                    <th>Database</th>
                                    <th>Destination</th>
                                    <th>Rule</th>
                                    <th>Parameters</th>
                                    <th>Next run</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Project 1</td>
                                    <td>Local: /home/ubuntu/backups</td>
                                    <td>Every day at 05:00</td>
                                    <td>None</td>
                                    <td>10.03.2018 05:00</td>
                                </tr>
                                <tr>
                                    <td>Project 2</td>
                                    <td>Amazon S3: Project2Backups</td>
                                    <td>Every day at 05:00</td>
                                    <td>None</td>
                                    <td>10.03.2018 05:00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="db-dashboard-item">
                    <h2>Latest backups</h2>
                        <table className="pt-html-table pt-interactive">
                            <thead>
                                <tr>
                                    <th>Database</th>
                                    <th>Destination</th>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            {
                                this.state.backups ?        
                                <tbody>
                                    {
                                        this.state.backups.map(function(backup) {
                                            return  <tr>
                                                        <td>{backup.database}</td>
                                                        <td>{backup.destination.type}</td>
                                                        <td>{new Date(backup.startDate).toISOString()}</td>
                                                        <td>{backup.type}</td>
                                                        <td><Tag className="pt-minimal" intent={(backup.status == "queued" || backup.status == "progress" || backup.status == "saving") && Intent.WARNING || backup.status == "finished" && Intent.SUCCESS || backup.status == "failed" && Intent.DANGER}>{backup.status == "queued" && "In queue" || backup.status == "progress" && "In progress" || backup.status == "saving" && "Saving data" || backup.status == "finished" && "Finished" || backup.status == "failed" && "Failed"}</Tag>{(backup.status == "queued" || backup.status == "progress" || backup.status == "saving") ? <div><br /><br /><ProgressBar className="db-backup-progress" intent={Intent.WARNING} value={backup.status == "queued" && 0 || backup.status == "progress" && 0.33 || backup.status == "saving" && 0.66 || backup.status == "finished" && 1} /></div> : null}</td>
                                                    </tr>
                                        })
                                    }
                                </tbody>
                                : null
                            }
                        </table>
                    </div>
                </div>
            );
        }
    }
}

export default Dashboard;