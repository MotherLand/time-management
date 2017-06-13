import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment'
import {editUser, deleteUser, viewTasks} from 'userActions'
import {connect} from 'react-redux'

class UserRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.onEdit = this
            .onEdit
            .bind(this);
        this.onDelete = this
            .onDelete
            .bind(this);
        this.viewTasks = this
            .viewTasks
            .bind(this)
        this.getViewTasksButton = this
            .getViewTasksButton
            .bind(this)
    }
    onEdit() {
        this
            .props
            .dispatch(editUser(this.props.user))
    }
    onDelete() {
        if (window.confirm('Delete task?')) {
            this
                .props
                .dispatch(deleteUser(this.props.user))
        }
    }
    viewTasks() {
        this
            .props
            .dispatch(viewTasks(this.props.user))
    }
    getViewTasksButton() {
        if (this.props.loggedUser.role == 'admin') {
            return <a
                className="btn btn-small btn-info horizontal-gutter"
                onClick={this.viewTasks}>Tasks</a>
        }
        return ''
    }
    render() {
        const {name, role, createdAt} = this.props.user
        return (
            <tr>
                <td>{name}</td>
                <td>{role}</td>
                <td>{moment
                        .utc(createdAt)
                        .format('MM/DD/YYYY')}</td>
                <td className="text-center">
                    <a
                        className="btn btn-small btn-default horizontal-gutter"
                        onClick={this.onEdit}>Edit</a>
                    {this.getViewTasksButton()}
                    <a
                        className="btn btn-small btn-danger horizontal-gutter"
                        onClick={this.onDelete}>Delete</a>
                </td>
            </tr>
        );
    }
}

UserRow.propTypes = {
    user: PropTypes.object.isRequired
}

module.exports = connect((state) => {
    return {editingUser: state.users.editingUser, loggedUser: state.user}
})(UserRow);