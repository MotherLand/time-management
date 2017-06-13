import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {logOut} from 'actions'

class Nav extends React.Component {
    constructor(props) {
        super(props)
        this.getLinks = this
            .getLinks
            .bind(this)
        this.getSignOutLink = this
            .getSignOutLink
            .bind(this)
        this.logOut = this
            .logOut
            .bind(this)
    }
    getLinks() {
        var links = [(
                <li key="profile">
                    <Link to="/profile">Profile</Link>
                </li>
            )]
        if (['manager', 'admin'].indexOf(this.props.user.role) !== -1) {
            links.push(
                <li key="users">
                    <Link to="/users">Users</Link>
                </li>
            );
        }
        if (this.props.user.role) {
            links.push(
                <li key="tasks">
                    <Link to="/tasks">Tasks</Link>
                </li>
            );
        }
        return links
    }
    getSignOutLink() {
        if (this.props.user.role) {
            return <a href="javascript:void(0);" onClick={this.logOut} className="pull-right">Sign Out</a>
        }
        return ''
    }
    logOut() {
        this
            .props
            .dispatch(logOut())
    }
    render() {
        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="javascript:void(0);">
                            Time Management System
                        </a >
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            {this.getLinks()}
                        </ul>
                        <ul className="nav navbar-nav pull-right">
                            <li>
                                {this.getSignOutLink()}
                            </li>
                        </ul>
                    </div>
                </div >
            </nav>
        )
    }
}

module.exports = connect((state) => {
    return {user: state.user}
})(Nav);