import React from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Intent, Spinner, FormGroup } from '@blueprintjs/core';
import { AppToaster } from './toaster';
import { connect } from 'react-redux';

class Settings extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            region: "",
            accessKey: "",
            secretKey: "",
            error: false,
            loading: true
        };
    }

    regionChange(e) {
        this.setState({
            region: e.target.value
        })
    }

    accessKeyChange(e) {
        this.setState({
            accessKey: e.target.value
        })
    }

    secretKeyChange(e) {
        this.setState({
            secretKey: e.target.value
        })
    }

    saveSettings() {
        fetch('/api/settings/save', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                region: this.state.region,
                accessKey: this.state.accessKey,
                secretKey: this.state.secretKey
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
                AppToaster.show({ message: "Changes were saved", intent: Intent.SUCCESS });
            } else {
                this.setState({
                    error: true
                });
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            this.setState({
                error: true
            });
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    getSettings() {
        fetch('/api/settings/get', {
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
                    region: data.settings.region,
                    accessKey: data.settings.accessKey,
                    secretKey: data.settings.secretKey,
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

    componentWillMount() {
        if (this.props.User.isLoggedIn) {
            this.getSettings.bind(this)();
        }
    }

    render() {
        if (this.props.User.isLoggedIn) {
            if (this.state.loading || this.state.error) {
                return (
                    <div className="db-loading-fill">
                        <Spinner />
                    </div>
                );
            } else {
                return (
                <div className="db-settings">
                    <form>
                        <FormGroup helperText="Region of your Amazon S3 bucket" label="Amazon S3 Region" labelFor="region-input">
                            <input id="region-input" className="pt-input pt-intent-primary pt-large pt-fill" type="text" placeholder="Amazon S3 Region" dir="auto" value={this.state.region} onChange={this.regionChange.bind(this)} />
                        </FormGroup>
                        <FormGroup helperText="Access Key ID of your Amazon IAM user" label="Amazon IAM Access Key ID" labelFor="access-key-input">
                            <input id="access-key-input" className="pt-input pt-intent-primary pt-large pt-fill" type="text" placeholder="Amazon IAM Access Key ID" dir="auto" value={this.state.accessKey} onChange={this.accessKeyChange.bind(this)} />
                        </FormGroup >
                        <FormGroup helperText="Secret Key of your Amazon IAM user" label="Amazon IAM Secret Key" labelFor="secret-key-input">
                            <input id="secret-key-input" className="pt-input pt-intent-primary pt-large pt-fill" type="password" placeholder="Amazon IAM Secret Key" dir="auto" value={this.state.secretKey} onChange={this.secretKeyChange.bind(this)} />
                        </FormGroup>
                        <Button text="Save" intent={ Intent.PRIMARY } className="pt-large" onClick={this.saveSettings.bind(this)} />
                    </form>
                </div>
                );
            }
        } else {
            return (
            <Redirect to="/" push />
            );
        }
    }
}


const mapStateToProps = (state) => {
    return {
        User: state.User
    };
};

export default connect(mapStateToProps)(Settings);