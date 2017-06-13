import React from 'react';
import TaskForm from 'TaskForm';
import TaskList from 'TaskList';
import {connect} from 'react-redux';
import {fetchTasks} from 'taskActions';

class TasksMain extends React.Component {

    constructor(props) {
        super(props)
        this.getTasksOwner = this
            .getTasksOwner
            .bind(this);
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
                        <TaskForm/>
                    </div>
                </div>
                <hr/>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3>{this.getTasksOwner()}</h3>
                    </div>
                    <div className="panel-body">
                        <TaskList/>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = connect((state) => {
    return {loggedUser: state.user, viewingTasksForUser: state.tasks.viewingTasksForUser}

})(TasksMain)