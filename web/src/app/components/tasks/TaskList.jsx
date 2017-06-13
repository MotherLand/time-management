import React from 'react';
import TaskRow from 'TaskRow';
import TasksFilter from 'TasksFilter'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {fetchTasks} from 'taskActions'

class TaskList extends React.Component {

    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this
            .props
            .dispatch(fetchTasks(this.props.filter));
    }
    getTasks() {
        return this
            .props
            .tasksList
            .map((task) => {
                return <TaskRow key={task._id} task={task}/>
            })
    }

    render() {
        return (
            <div>
                <TasksFilter/>
                <hr/>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th className="col-sm-2">Date</th>
                            <th className="col-sm-2">Time Spent</th>
                            <th className="col-sm-5">Notes</th>
                            <th className="text-center col-sm-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.getTasks()}
                    </tbody>
                </table>
            </div>
        );
    }
}

TaskList.propTypes = {}

module.exports = connect((state) => {
    return {tasksList: state.tasks.tasksList, filter: state.tasks.filter, viewingTasksForUser: state.tasks.viewingTasksForUser}
})(TaskList);