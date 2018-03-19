import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { SetUser } from '../actions/user';
import { AppToaster } from './toaster';
import { Intent, Toast } from '@blueprintjs/core';

class Header extends React.Component {
    logout() {
        fetch('/api/logout', {
            credentials: 'same-origin',
            method: 'POST'
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
                this.props.SetUser({isLoggedIn: false});
                AppToaster.show({ message: "You have logged out", intent: Intent.SUCCESS });
            }
        });
    }
    render() {
        return (
            <header>
                <Navbar inverse collapseOnSelect>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <Link to="/">Database Backup</Link>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    {
                        this.props.User.isLoggedIn ?
                        <Navbar.Collapse>
                            <Nav>
                                <LinkContainer exact to="/">
                                    <NavItem eventKey={1}>
                                        Dashboard
                                    </NavItem>
                                </LinkContainer>
                                <LinkContainer to="/settings">
                                    <NavItem eventKey={2}>
                                        Settings
                                    </NavItem>
                                </LinkContainer>
                            </Nav>
                            <Nav pullRight>
                                <NavItem eventKey={1} onClick={this.logout.bind(this)}>
                                    Logout
                                </NavItem>
                            </Nav>
                            <Navbar.Text pullRight>
                                Logged in as {this.props.User.username}
                            </Navbar.Text>
                        </Navbar.Collapse>
                        : 
                        <Navbar.Collapse>
                            <Nav>
                                <LinkContainer to="/">
                                    <NavItem eventKey={1}>
                                        Home
                                    </NavItem>
                                </LinkContainer>
                            </Nav>
                        </Navbar.Collapse>
                    }
                </Navbar>
            </header>
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

export default connect(mapStateToProps, mapDispatchToProps)(Header);