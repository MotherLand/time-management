import React from 'react';
import UserForm from 'UserForm';
import UserList from 'UserList';
import {saveUser, finishedEditingUser} from 'userActions'
import {connect} from 'react-redux'

class UsersMain extends React.Component {

    constructor(props) {
        super(props)
        this.handleSave = this
            .handleSave
            .bind(this)
        this.handleClear = this
            .handleClear
            .bind(this)
    }

    handleSave(user) {
        this
            .props
            .dispatch(saveUser(user))
    }

    handleClear() {
        this
            .props
            .dispatch(finishedEditingUser())
    }

    render() {
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">Add/Edit Users</div>
                    <div className="panel-body">
                        <UserForm onSave={this.handleSave} onClear={this.handleClear}/>
                    </div>
                </div>
                <hr/>
                <div className="panel panel-default">
                    <div className="panel-heading">Registered Users</div>
                    <div className="panel-body">
                        <UserList/>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = connect((state) => {
    return {}
})(UsersMain);