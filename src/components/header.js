import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { SetUser } from '../actions/user';
import { AppToaster } from './toaster';
import { Intent, Toast, Navbar, NavbarHeading, NavbarGroup, Alignment, Tag, Button } from '@blueprintjs/core';
let loggedInCategories = [{ name: "Dashboard", path: "/" }, { name: "Settings", path: "/settings" }];
let notLoggedInCategories = [{ name: "Home", path: "/" }];

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
                this.props.SetUser({ isLoggedIn: false });
                AppToaster.show({ message: "You have logged out", intent: Intent.SUCCESS });
            }
        });
    }
    render() {
        return (
            <header>
                <Navbar className="pt-dark">
                    <NavbarGroup align={ Alignment.LEFT }>
                        <NavbarHeading>
                            <Link className="db-link-white" to="/">Database Backup</Link>
                        </NavbarHeading>
                        {
                            (this.props.User.isLoggedIn ? loggedInCategories : notLoggedInCategories).map(function(category) {
                                return <Link className="db-link-white" to={ category.path }><Button className="pt-minimal" text={ category.name } /></Link>
                            })
                        }
                    </NavbarGroup>
                    {
                        this.props.User.isLoggedIn ?
                        <NavbarGroup align={ Alignment.RIGHT }>
                            <Tag className="db-margin-right" minimal>Logged in as { this.props.User.username }</Tag>
                            <Button className="pt-minimal" text="Logout" intent={ Intent.DANGER } icon="log-out" onClick={this.logout.bind(this)} />
                        </NavbarGroup>
                        : null
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