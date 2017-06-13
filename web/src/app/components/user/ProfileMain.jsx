import React from 'react';
import UserForm from 'UserForm'
import { connect } from 'react-redux'
import { editUser, updateProfile, finishedEditingUser } from 'userActions'

class ProfileMain extends React.Component {
    constructor(props) {
        super(props)

        this.handleSave = this
            .handleSave
            .bind(this)

        this.handleClear = this
            .handleClear
            .bind(this)
    }

    componentDidMount() {
        this
            .props
            .dispatch(editUser(this.props.user))
    }

    handleSave(user) {
        this
            .props
            .dispatch(updateProfile(user))
    }
    handleClear() {
        //do nothing
    }
    render() {
        return (
            <div>
                <div className="col-lg-3"></div>
                <div className="col-lg-6">
                    <div className="panel panel-default">
                        <div className="panel panel-heading">
                            <h2 className="form-signin-heading text-center">Update your information</h2>
                        </div>
                        <div className="panel panel-body">
                            <UserForm onSave={this.handleSave} onClear={this.handleClear} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-3"></div>
            </div>
        );
    }
}

module.exports = connect((state) => {
    return { user: state.user }
})(ProfileMain);