import React from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Intent, Spinner, FormGroup } from '@blueprintjs/core';
import { AppToaster } from './toaster';
import { connect } from 'react-redux';

class Settings extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            threads: 1,
            error: false,
            loading: true
        };
    }

    threadsChange(e) {
        this.setState({
            threads: e.target.value
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
                threads: this.state.threads
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
                    threads: data.settings.threads,
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
                        <FormGroup helperText="Amount of backups that can run simultaneously" label="Threads" labelFor="region-input">
                            <input id="region-input" className="pt-input pt-intent-primary pt-large pt-fill" type="text" placeholder="Threads" dir="auto" value={this.state.threads} onChange={this.threadsChange.bind(this)} />
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