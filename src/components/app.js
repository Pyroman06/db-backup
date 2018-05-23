import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { Spinner } from '@blueprintjs/core'
import Home from '../components/home';
import Header from '../components/header';
import Footer from '../components/footer';
import Settings from '../components/settings';
import { UserState } from '../actions/user';

class App extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
            setupComplete: true
        };
    }

    componentWillMount() {
        fetch('/api/getuser', {
            credentials: 'same-origin',
            method: 'POST'
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
                this.setState({
                    loading: false
                });
            } else {
                this.setState({
                    loading: false,
                    setupComplete: data.setupComplete
                });
            }
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="db-loading">
                    <Spinner />
                </div>
            );
        } else {
            return (
                <div className="main-container">
                    <Header location={this.props.location} />
                    <Switch location={this.props.location}>
                        <Route exact path='/' render={(props) => (
                            <Home setupComplete={this.state.setupComplete} />
                        )} />
                        <Route exact path='/settings' component={Settings} />
                        <Route path='*' render={(props) => (
                            <Redirect to='/' push />
                        )} />
                    </Switch>
                    <Footer />
                </div>
            );
        }
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));