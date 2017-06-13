import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { formValidationFail, hideError } from 'actions'

class UserForm extends React.Component {
    constructor(props) {
        super(props);

        this.onSubmit = this
            .onSubmit
            .bind(this);
        this.onClear = this
            .onClear
            .bind(this);
        this.getRole = this
            .getRole
            .bind(this);
        this.fillForm = this.fillForm.bind(this);
    }

    fillForm() {
        if ((this.props.editingUser || {})._id) {
            const { name, preferredWorkLoad, login, role } = this.props.editingUser;
            this.refs.name.value = name || "";
            this.refs.preferredWorkLoad.value = preferredWorkLoad || "";
            this.refs.username.value = login || "";
            (this.refs.role || {}).value = role || "user";
            window.scrollTo(0, 0)
        }
    }

    componentDidMount() {
        this.fillForm()
    }

    componentDidUpdate() {
        this.fillForm()
    }

    onSubmit(e) {
        e.preventDefault()
        const fieldNames = {
            name: 'Name',
            preferredWorkLoad: 'Preferred work load in hours',
            login: 'Username',
            password: 'Password'
        }
        const passwordConfirm = this.refs.passwordConfirm.value;
        const user = {
            name: this.refs.name.value,
            preferredWorkLoad: this.refs.preferredWorkLoad.value,
            login: this.refs.username.value,
            password: this.refs.password.value,
            role: (this.refs.role || {}).value
        }

        var skipFields = []
        if (this.props.editingUser) {
            user._id = this.props.editingUser._id || ""
            skipFields.push('_id')
            skipFields.push('password')
        }

        for (const i in user) {
            if (skipFields.indexOf(i) === -1 && user[i] == "") {
                const msg = fieldNames[i] + ' is required!';
                this
                    .props
                    .dispatch(formValidationFail({ detail: msg }))
                setTimeout(() => {
                    this
                        .props
                        .dispatch(hideError())
                }, 3000)
                return;
            }
        }

        if (passwordConfirm != user.password) {
            this
                .props
                .dispatch(formValidationFail({ detail: 'Passwords do not match!' }))
            setTimeout(() => {
                this
                    .props
                    .dispatch(hideError())
            }, 3000)
            return;
        }

        this
            .props
            .onSave(user)
    }
    onClear(e) {
        e.preventDefault()
        this.refs.name.value = ""
        this.refs.username.value = ""
        this.refs.password.value = ""
        this.refs.passwordConfirm.value = ""
        this.refs.preferredWorkLoad.value = ""
        this
            .props
            .onClear()
    }
    getRole() {
        if (this.props.user.role == 'admin') {
            return <div className="vertical-gutter">
                <label htmlFor="role" className="sr-only">Role</label>
                <select ref="role" className="form-control">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                </select>
            </div>
        }
        return ''
    }
    render() {
        return (
            <form className="form-signin col-lg-12">
                {this.getRole()}
                <div className="vertical-gutter">
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input
                        ref="name"
                        type="text"
                        className="form-control"
                        placeholder="Full name"
                        required
                        autoFocus />
                </div>
                <div className="vertical-gutter">
                    <label htmlFor="preferredWorkLoad" className="sr-only">Preferred Daily Workload</label>
                    <input
                        ref="preferredWorkLoad"
                        type="number"
                        className="form-control"
                        placeholder="Number of hours to work per day?" />
                </div>
                <div className="vertical-gutter">
                    <label htmlFor="username" className="sr-only">Username</label>
                    <input
                        ref="username"
                        type="text"
                        className="form-control"
                        placeholder="Choose a username"
                        required />
                </div>
                <div className="vertical-gutter">
                    <label htmlFor="inputPassword" className="sr-only">Password</label>
                    <input
                        ref="password"
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        required />
                </div>
                <div className="vertical-gutter">
                    <label htmlFor="inputPassword" className="sr-only">Password</label>
                    <input
                        ref="passwordConfirm"
                        type="password"
                        className="form-control"
                        placeholder="Confirm password"
                        required />
                </div>
                <div className="vertical-gutter">
                    <button className="btn btn-primary" onClick={this.onSubmit} type="submit">Save</button>
                    &nbsp;
                    <button className="btn btn-default" onClick={this.onClear}>Clear</button>
                </div>
            </form>
        );
    }
}

UserForm.propTypes = {
    // delegate save to containing element to figure out whether or not to redirect
    // and to where
    onSave: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired
}

module.exports = connect((state) => {
    return { editingUser: state.users.editingUser, user: state.user }
})(UserForm);
