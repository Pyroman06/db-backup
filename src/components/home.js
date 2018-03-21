import React from 'react';
import LoginForm from './loginform';
import Dashboard from './dashboard';
import { connect } from 'react-redux';

class Home extends React.Component {
    render() {
        return (
            <div>
                {
                    this.props.User.isLoggedIn ? <Dashboard /> : <LoginForm setupComplete={this.props.setupComplete} />
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        User: state.User
    };
};

export default connect(mapStateToProps)(Home);