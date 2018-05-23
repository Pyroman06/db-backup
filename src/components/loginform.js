import React from 'react';
import { connect } from 'react-redux';
import { Button, Switch, Intent, FormGroup, Dialog } from '@blueprintjs/core';
import { UserState } from '../actions/user';
import { AppToaster } from './toaster';

class LoginForm extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            rememberMe: false,
            loginDisabled: false,
            error: null,
            isErrorOpen: false,
            isCreateRootOpen: false,
            rootUsername: "",
            rootPassword: "",
            createRootDisabled: false
        };
    }

    usernameChange(e) {
        this.setState({
            username: e.target.value
        })
    }

    passwordChange(e) {
        this.setState({
            password: e.target.value
        })
    }

    rememberMeChange(e) {
        this.setState({
            rememberMe: e.target.checked
        })
    }

    rootUsernameChange(e) {
        this.setState({
            rootUsername: e.target.value
        })
    }

    rootPasswordChange(e) {
        this.setState({
            rootPassword: e.target.value
        })
    }

    toggleCreateRoot() {
        this.setState({
            isCreateRootOpen: !this.state.isCreateRootOpen
        })
    }

    createRoot() {
        this.setState({
            createRootDisabled: true
        })

        fetch('/api/createroot', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.rootUsername,
                password: this.state.rootPassword
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
                AppToaster.show({ message: "Account was registered, login now.", intent: Intent.SUCCESS });
            } else {
                this.setState({
                    createRootDisabled: false
                });
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            this.setState({
                createRootDisabled: false
            });
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    login() {
        this.setState({
            loginDisabled: true
        });

        fetch('/api/login', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
                remember: this.state.rememberMe
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
                this.props.SetUser(data.user);
                AppToaster.show({ message: "You have logged in as " + data.user.username, intent: Intent.SUCCESS });
            } else {
                this.setState({
                    error: data.message,
                    loginDisabled: false,
                    isErrorOpen: true
                });
                AppToaster.show({ message: data.message, intent: Intent.DANGER });
            }
        })
        .catch((err) => {
            this.setState({
                error: "Something went wrong. Please, try again later.",
                loginDisabled: false,
                isErrorOpen: true
            });
            AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: Intent.DANGER });
        });
    }

    closeError() {
        this.setState({
            isErrorOpen: false
        });
    }

    render() {
        return (
            <div className="db-flex-row">
                <div className="db-flex-row-item">
                    <h2 style={{display: "inline-block", margin: "0 auto"}}>Sign into control panel</h2>
                    <br />
                    You must sign in to be able to manage the backups. Use credentials provided by your administrator to sign in.
                    <br />
                    Forgot your password? Contact your administrator to reset it.
                </div>
                <div className="db-flex-row-item">
                    <form className="db-login-form">
                        <div className="db-login-form-container">
                            <FormGroup className="text-left" labelFor="db-login" label="Username">
                                <input id="db-login" className="pt-input pt-intent-primary pt-large pt-fill" type="text" placeholder="Username" dir="auto" onChange={this.usernameChange.bind(this)} />
                            </FormGroup>
                            <FormGroup className="text-left" labelFor="db-password" label="Password">
                                <input id="db-password" className="pt-input pt-intent-primary pt-large pt-fill" type="password" placeholder="Password" dir="auto" onChange={this.passwordChange.bind(this)} />
                            </FormGroup>
                            <div>
                                <Switch className="pt-large" checked={this.state.rememberMe} label="Remember me" inline onChange={this.rememberMeChange.bind(this)} />
                            </div>
                            <div>
                                <Button text="Login" className="pt-large pt-fill" loading={this.state.loginDisabled} onClick={this.login.bind(this)} />
                            </div>
                                {
                                    !this.props.setupComplete && !this.state.createRootDisabled ?
                                    <div style={{marginTop: "15px"}}>
                                        <Button text="Setup is incomplete. Click here to create a root account." className="pt-large pt-minimal" intent={Intent.WARNING} onClick={this.toggleCreateRoot.bind(this)} />
                                        <Dialog
                                            isOpen={this.state.isCreateRootOpen}
                                            onClose={this.toggleCreateRoot.bind(this)}
                                            title="Create root account"
                                        >
                                            <div style={{margin: "15px 15px 0px 15px"}}>
                                                <FormGroup className="text-left" labelFor="db-create-login" label="Root username">
                                                    <input id="db-create-login" className="pt-input pt-intent-primary pt-large pt-fill" type="text" placeholder="Root username" dir="auto" onChange={this.rootUsernameChange.bind(this)} />
                                                </FormGroup>
                                                <FormGroup className="text-left" labelFor="db-create-password" label="Root password">
                                                    <input id="db-create-password" className="pt-input pt-intent-primary pt-large pt-fill" type="password" placeholder="Root password" dir="auto" onChange={this.rootPasswordChange.bind(this)} />
                                                </FormGroup>
                                                <div>
                                                    <Button text="Create root account" className="pt-large pt-fill" loading={this.state.createRootDisabled} onClick={this.createRoot.bind(this)} />
                                                </div>
                                            </div>
                                        </Dialog>
                                    </div>
                                    : null
                                }
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        User: state.User
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        SetUser: (user) => dispatch(UserState(user))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);