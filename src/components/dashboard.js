import React from 'react';
import { Card, Button, Elevation, Tag, Intent, ProgressBar, Collapse, FormGroup, Radio, RadioGroup } from '@blueprintjs/core';

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
            databaseUri: ""
        };
    }

    addTask() {

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
        
    }

    render() {
        return (
            <div className="db-dashboard">
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
                        <Button text="Add" intent={ Intent.PRIMARY } className="pt-large" onClick={this.addDatabase.bind(this)} />
                    </div>
                </Collapse>
                <table className="pt-html-table pt-interactive">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Engine</th>
                            <th>IP Address</th>
                            <th>Port</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th>Other</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Project 1</td>
                            <td>MySQL</td>
                            <td>123.123.123.123</td>
                            <td>3306</td>
                            <td>root</td>
                            <td>•••••••</td>
                            <td>None</td>
                        </tr>
                        <tr>
                            <td>Project 2</td>
                            <td>MongoDB</td>
                            <td>123.123.123.123</td>
                            <td>27017</td>
                            <td>admin</td>
                            <td>•••••••</td>
                            <td>Authentication DB: admin<br />Test</td>
                        </tr>
                    </tbody>
                </table>
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
                    <tbody>
                        <tr>
                            <td>Project 1</td>
                            <td>Local - Default</td>
                            <td>09.03.2018 05:00</td>
                            <td>Scheduled</td>
                            <td><Tag className="pt-minimal" intent={Intent.WARNING}>In progress</Tag><br /><br /><ProgressBar className="db-backup-progress" intent={Intent.WARNING} value={0.3} /></td>
                        </tr>
                        <tr>
                            <td>Project 2</td>
                            <td>Amazon S3 - Default</td>
                            <td>09.03.2018 04:00</td>
                            <td>Manual</td>
                            <td><Tag className="pt-minimal" intent={Intent.SUCCESS}>Completed</Tag></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Dashboard;