import React from 'react';
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { login } from 'actions'

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.handleLogin = this.handleLogin.bind(this)
    }
    componentDidUpdate() {
        if (this.props.user.token) {
            this.props.history.push('/tasks')
        }
    }
    handleLogin(e) {
        e.preventDefault();
        const { username, password } = this.refs
        this.props.dispatch(login(username.value, password.value))
    }
    render() {
        var { user } = this.props
        return (
            <div>
                <div className="col-lg-3"></div>
                <div className="panel panel-default col-lg-6">
                    <div className="panel-header"><h2 className="form-signin-heading">Please sign in</h2></div>
                    <div className="panel-body">
                        <form className="form-signin">

                            <div className="vertical-gutter">
                                <label htmlFor="username" className="sr-only">Username</label>
                                <input
                                    ref="username"
                                    type="text"
                                    className="form-control"
                                    placeholder="Username"
                                    required
                                    autoFocus />
                            </div>
                            <div className="vertical-gutter">
                                <label htmlFor="inputPassword" className="sr-only">Password</label>
                                <input
                                    ref="password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    required />
                            </div>
                            <div className="vertical-gutter">
                                <button
                                    className="btn btn-lg btn-primary btn-block"
                                    type="submit"
                                    onClick={this.handleLogin}>Sign in</button>
                            </div>
                            <hr />
                            <div className="vertical-gutter text-center">
                                <h3>Not a user yet?</h3>
                            </div>
                            <div className="vertical-gutter">
                                <Link to="/signup" className="btn btn-lg btn-default btn-block">Sign up, it's free!</Link>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-lg-3"></div>
            </div>
        );
    }
}

module.exports = connect((state) => {
    return {
        user: state.user,
    }
})(Login);