import React from 'react';
import { connect } from 'react-redux';
import { Button, Switch, Alert, Intent } from '@blueprintjs/core';
import { FormGroup, Form } from 'react-bootstrap';
import { SetUser } from '../actions/user';

class LoginForm extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            rememberMe: false,
            loginDisabled: false,
            error: null,
            isErrorOpen: false
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
                throw Error(response.statusText);
            }

            return response;
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                this.props.SetUser(data.user);
            } else {
                this.setState({
                    error: data.message,
                    loginDisabled: false,
                    isErrorOpen: true
                });
            }
        })
        .catch((err) => {
            this.setState({
                error: "Something went wrong. Please, try again later.",
                loginDisabled: false,
                isErrorOpen: true
            });
            console.log(err);
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
                    <Form className="db-login-form">
                        <FormGroup className="db-login-formgroup">
                            <input className="pt-input pt-intent-primary pt-large pt-fill" type="text" placeholder="Username" dir="auto" onChange={this.usernameChange.bind(this)} />
                            <br />
                            <input className="pt-input pt-intent-primary pt-large pt-fill" type="password" placeholder="Password" dir="auto" onChange={this.passwordChange.bind(this)} />
                            <br />
                            <Switch className="pt-large" checked={this.state.rememberMe} label="Remember me" inline onChange={this.rememberMeChange.bind(this)} />
                            <br />
                            <Button text="Login" className="pt-large pt-fill" loading={this.state.loginDisabled} onClick={this.login.bind(this)} />
                            <Alert confirmButtonText="Close" intent={Intent.DANGER} isOpen={this.state.isErrorOpen} onClose={this.closeError.bind(this)}>
                                <p>
                                    {this.state.error}
                                </p>
                            </Alert>
                        </FormGroup>
                    </Form>
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
        SetUser: (user) => dispatch(SetUser(user))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);