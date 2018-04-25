import React from 'react';
import { Card, Button, Elevation, Tag, Intent, ProgressBar, Collapse, FormGroup, Radio, RadioGroup, Spinner, Menu, MenuItem, Popover, Dialog, TextArea } from '@blueprintjs/core';
import { AppToaster } from './toaster';
import Providers from '../providers/client';

class Dashboard extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isAddDatabaseOpen: false,
            name: "",
            engine: "mysql",
            hostname: "",
            port: "",
            username: "",
            password: "",
            uri: "",
            addDatabaseDisabled: false,
            error: false,
            loading: true,
            initialLoaded: false,
            databases: {},
            schedules: {},
            backups: {},
            isManualBackupOpen: false,
            manualBackupDatabaseId: "",
            manualBackupDestination: "local",
            manualBackupPath: "",
            isAddTaskOpen: false,
            addTaskDatabase: "",
            addTaskDestination: "local",
            addTaskPath: "",
            addTaskRule: "",
            addTaskDisabled: false,
            isLogOpen: false,
            logIndex: null
        };
    }

    addTask() {
        this.setState({
            addTaskDisabled: true
        });
        fetch('/api/scheduler/add', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                databaseId: this.state.addTaskDatabase,
                destination: this.state.addTaskDestination,
                path: this.state.addTaskPath,
                rule: this.state.addTaskRule
            })
        })
        .then((response) => {
            if (!response.ok) {
                this.setState({
                    addTaskDisabled: false
                });
                AppToaster.show({ message: response.statusText, intent: Intent.DANGER });
            }

            return response;
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                AppToaster.show({ message: "Task was added", intent: Intent.SUCCESS });
                this.setState({
                    isAddTaskOpen: false,
                    addTaskDisabled: false,
                    addTaskDatabase: "",
                    addTaskDestination: "local",
                    addTaskPath: "",
                    addTaskRule: ""
                });
                this.getDashboard();
            } else {
                this.setState({
                    addTaskDisabled: false
                });
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            this.setState({
                addTaskDisabled: false
            });
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    removeTask(taskId) {
        fetch('/api/scheduler/delete', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                taskId: taskId
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
                AppToaster.show({ message: "Task was deleted", intent: Intent.SUCCESS });
                this.getDashboard();
            } else {
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    getDashboard() {
        if (!this.state.initialLoaded) {
            this.setState({
                loading: true
            });
        }
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
                    loading: false,
                    initialLoaded: true
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

    databaseOptionChange(option, e) {
        this.setState({
            [option]: e.target.value
        });
    }

    addDatabase() {
        this.setState({
            addDatabaseDisabled: true
        });

        var data = { engine: this.state.engine, name: this.state.name };
        var that = this;
        Object.keys(Providers.engines[this.state.engine].fields).map(function(key) {
            data = {...data, [key]: that.state[key]}
        });

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
                    name: "",
                    engine: "mysql",
                    hostname: "",
                    port: "",
                    username: "",
                    password: "",
                    uri: ""
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

    handleAddTaskOpen() {
        this.setState({
            isAddTaskOpen: !this.state.isAddTaskOpen
        });
    }

    addTaskDestinationChange(e) {
        this.setState({
            addTaskDestination: e.target.value
        });
    }

    addTaskPathChange(e) {
        this.setState({
            addTaskPath: e.target.value
        });
    }

    addTaskDatabaseChange(e) {
        this.setState({
            addTaskDatabase: e.target.value
        });
    }

    addTaskRuleChange(e) {
        this.setState({
            addTaskRule: e.target.value
        });
    }

    toggleLogOpen() {
        this.setState({
            isLogOpen: !this.state.isLogOpen
        })
    }

    openLog(index) {
        this.setState({
            isLogOpen: true,
            logIndex: index
        })
    }

    componentWillMount() {
        var that = this;
        this.getDashboard();
        setInterval(function() {
            that.getDashboard.bind(that)();
        }, 10000)
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
                                    <input id="database-name" className="pt-input pt-intent-primary" type="text" placeholder="Name" dir="auto" value={this.state.name} onChange={this.databaseOptionChange.bind(this, 'name')} />
                                </FormGroup>
                                <RadioGroup
                                    label="Database engine"
                                    onChange={this.databaseOptionChange.bind(this, 'engine')}
                                    selectedValue={this.state.engine}
                                >
                                    {
                                        Object.keys(Providers.engines).map(function(key) {
                                            return <Radio label={ Providers.engines[key].name } value={ key } />
                                        })
                                    }
                                </RadioGroup>
                                {
                                    Object.keys(Providers.engines[this.state.engine].fields).map(function(key) {
                                        let field = Providers.engines[that.state.engine].fields[key];
                                        return  <FormGroup helperText={ field.description } label={ field.name } labelFor={`database-${key}`} requiredLabel={ true }>
                                                    <input id={`database-${key}`} className="pt-input pt-intent-primary" type="text" placeholder={ field.name } dir="auto" value={that.state[key]} onChange={that.databaseOptionChange.bind(that, key)} />
                                                </FormGroup>
                                    })
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
                                                        <td>{Providers.engines[database.engine].name}</td>
                                                        <td>
                                                            {
                                                                Object.keys(Providers.engines[database.engine].fields).map(function(key) {
                                                                    var field = Providers.engines[database.engine].fields[key];
                                                                    return <div>{ field.name }: {database.options[key]}</div>
                                                                })
                                                            }
                                                        </td>
                                                        <td>
                                                            <Popover content={<Menu><MenuItem icon="floppy-disk" onClick={that.manualBackup.bind(that, database._id)} text="Manual backup" /><MenuItem icon="delete" onClick={that.deleteDatabase.bind(that, database._id)} text="Delete" intent={Intent.DANGER} /></Menu>}>
                                                                <Button text="Menu" />
                                                            </Popover>
                                                        </td>
                                                    </tr>
                                        })
                                    }
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
                                </tbody>   
                                : null
                            }
                        </table>
                    </div>
                    <div className="db-dashboard-item">
                        <h2>Scheduler</h2>
                        <Button text="Add new task" intent={ Intent.PRIMARY } onClick={this.handleAddTaskOpen.bind(this)} />
                        <Collapse isOpen={this.state.isAddTaskOpen}>
                            <div className="db-form-default" style={{marginTop: "15px"}}>
                                <div class="pt-select">
                                    <select onChange={this.addTaskDatabaseChange.bind(this)}>
                                        <option selected>Choose a database...</option>
                                        {
                                            this.state.databases.map(function(database) {
                                                return <option value={database._id}>{database.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <RadioGroup
                                    label="Backup destination"
                                    onChange={this.addTaskDestinationChange.bind(this)}
                                    selectedValue={this.state.addTaskDestination}
                                >
                                    <Radio label="Local" value="local" />
                                    <Radio label="Amazon S3" value="s3" />
                                </RadioGroup>
                                {
                                    this.state.addTaskDestination == "local" &&
                                    <FormGroup helperText="Path where to store backup" label="Path" labelFor="scheduler-local-path" requiredLabel={true}>
                                        <input id="scheduler-local-path" className="pt-input pt-intent-primary" type="text" placeholder="Path" dir="auto" value={this.state.addTaskPath} onChange={this.addTaskPathChange.bind(this)} />
                                    </FormGroup>
                                    || this.state.addTaskDestination == "s3" &&
                                    <FormGroup helperText="S3 bucket to store backup in" label="Amazon S3 Bucket" labelFor="scheduler-s3-bucket" requiredLabel={true}>
                                        <input id="scheduler-s3-bucket" className="pt-input pt-intent-primary" type="text" placeholder="Amazon S3 Bucket" dir="auto" value={this.state.addTaskPath} onChange={this.addTaskPathChange.bind(this)} />
                                    </FormGroup>
                                    || null
                                }
                                <FormGroup helperText="Enter rule in Cron format" label="Rule" labelFor="scheduler-rule" requiredLabel={true}>
                                    <input id="scheduler-rule" className="pt-input pt-intent-primary" type="text" placeholder="Rule" dir="auto" value={this.state.addTaskRule} onChange={this.addTaskRuleChange.bind(this)} />
                                </FormGroup>
                                <Button text="Add task" intent={ Intent.PRIMARY } onClick={this.addTask.bind(this)} />                                
                            </div>
                        </Collapse>
                        <table className="pt-html-table pt-interactive">
                            <thead>
                                <tr>
                                    <th>Database</th>
                                    <th>Destination</th>
                                    <th>Rule</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {
                                this.state.schedules ?
                                    <tbody>
                                        {
                                            this.state.schedules.map(function(schedule) {
                                                return  <tr>
                                                            <td>{schedule.database.name}</td>
                                                            <td>{(schedule.destination.type == "local" && "Local: " || schedule.destination.type == "s3" && "Amazon S3: ") + (schedule.destination.path)}</td>
                                                            <td>{schedule.rule}</td>
                                                            <td>
                                                                <Button text="Delete" intent={ Intent.DANGER } onClick={that.removeTask.bind(that, schedule._id)} />
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
                    <h2>Latest backups</h2>
                        <table className="pt-html-table pt-interactive">
                            <thead>
                                <tr>
                                    <th>Database</th>
                                    <th>Destination</th>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Log</th>
                                </tr>
                            </thead>
                            {
                                this.state.backups ?        
                                <tbody>
                                    {
                                        this.state.backups.map(function(backup, index) {
                                            return  <tr>
                                                        <td>{backup.database && backup.database.name || "Removed"}</td>
                                                        <td>{(backup.destination.type == "local" && "Local: " || backup.destination.type == "s3" && "Amazon S3: ") + (backup.destination.path)}</td>
                                                        <td>{new Date(backup.startDate).toLocaleString()}</td>
                                                        <td>{backup.type == "manual" && "Manual" || backup.type == "scheduled" && "Scheduled"}</td>
                                                        <td><Tag className="pt-minimal" intent={(backup.status == "queued" || backup.status == "progress") && Intent.WARNING || backup.status == "finished" && Intent.SUCCESS || backup.status == "failed" && Intent.DANGER}>{backup.status == "queued" && "In queue" || backup.status == "progress" && "In progress" || backup.status == "finished" && "Finished" || backup.status == "failed" && "Failed"}</Tag></td>
                                                        <td>
                                                            <Button text="Log" intent={ Intent.PRIMARY } onClick={that.openLog.bind(that, index)} />
                                                        </td>
                                                    </tr>
                                        })
                                    }
                                    {
                                        (that.state.logIndex != null) ?
                                        <Dialog
                                            isOpen={that.state.isLogOpen}
                                            onClose={that.toggleLogOpen.bind(that)}
                                            title="Backup log"
                                        >
                                            <TextArea readOnly style={{height: "400px", margin: "15px 15px 0px 15px", resize: "none"}}>
                                                {that.state.backups[that.state.logIndex].log}
                                            </TextArea>
                                        </Dialog>
                                        : null
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