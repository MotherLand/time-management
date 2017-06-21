import React from 'react';
import TaskForm from 'TaskForm';
import TaskList from 'TaskList';
import { connect } from 'react-redux';
import { fetchTasks } from 'taskActions';

import io from 'socket.io-client'
let socket = io(`ws://127.0.0.1:3000`)

class TasksMain extends React.Component {

    constructor(props) {
        super(props)
        this.getTasksOwner = this
            .getTasksOwner
            .bind(this);
    }

    componentDidUpdate() {
        const userChannel = 'USER_CHANNEL_' + this.props.loggedUser._id;
        var _dispatch = this.props.dispatch
        if (!(socket._callbacks['$' + userChannel])) {
            socket.on(userChannel, function (data) {
                _dispatch(fetchTasks({ user: data.user }))
            });
        }
        if (!(socket._callbacks['$ADMIN_CHANNEL']) && this.props.loggedUser.role == 'admin') {
            socket.on('ADMIN_CHANNEL', function (data) {
                _dispatch(fetchTasks({ user: data.user }))
            });
        }
    }

    getTasksOwner() {
        if (this.props.viewingTasksForUser && this.props.viewingTasksForUser._id != this.props.loggedUser._id) {
            return 'Tasks for ' + this.props.viewingTasksForUser.name
        }
        return 'My Tasks'
    }

    render() {
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">Add/Edit Tasks</div>
                    <div className="panel-body">
                        <TaskForm />
                    </div>
                </div>
                <hr />
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3>{this.getTasksOwner()}</h3>
                    </div>
                    <div className="panel-body">
                        <TaskList />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = connect((state) => {
    return { loggedUser: state.user, viewingTasksForUser: state.tasks.viewingTasksForUser }

})(TasksMain)