import React from 'react';
import UserForm from 'UserForm'
import {connect} from 'react-redux'
import {signUp} from 'actions'

class Signup extends React.Component {
    constructor(props) {
        super(props)

        this.handleSave = this
            .handleSave
            .bind(this)
        this.handleClear = this
            .handleClear
            .bind(this)
    }

    componentDidUpdate() {
        if (this.props.user.token) {
            this
                .props
                .history
                .push('/tasks')
        }
    }

    handleSave(newUser) {
        this
            .props
            .dispatch(signUp(newUser))
    }

    handleClear() {
        //do nothing
    }

    render() {
        return (
            <div>
                <div className="col-lg-3"></div>
                <div className="col-lg-6">
                    <h2 className="form-signin-heading text-center">Sign up form</h2>
                    <UserForm onSave={this.handleSave} onClear={this.handleClear}/>
                </div>
                <div className="col-lg-3"></div>
            </div>
        );
    }
}

module.exports = connect((state) => {
    return {user: state.user}
})(Signup);