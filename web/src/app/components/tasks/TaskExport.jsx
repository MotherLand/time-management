import React from 'react';
import {connect} from 'react-redux';
import {fetchTasksForExport} from 'taskActions';
import {TaskExportItem} from 'TaskExportItem'

class TaskExport extends React.Component {

    constructor(props) {
        super(props)
        this.getExportItems = this
            .getExportItems
            .bind(this)
        this.getUserName = this
            .getUserName
            .bind(this)
    }

    componentWillMount() {
        this
            .props
            .dispatch(fetchTasksForExport(this.props.filter))
    }

    getExportItems() {

        if (this.props.exportTasksList) {
            return this
                .props
                .exportTasksList
                .map((item) => {
                    return <TaskExportItem key={item._id} item={item}/>;
                })
        }
        return ''
    }

    getUserName() {
        return (this.props.viewingTasksForUser || this.props.loggedUser).name
    }

    render() {
        return (
            <div>
                <a className="btn btn-default" href="#/tasks">Go Back</a>
                <hr/>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3>Task Report for {this.getUserName()}</h3>
                    </div>
                    <div className="panel-body">
                        {this.getExportItems()}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = connect((state) => {
    return {filter: state.tasks.filter, exportTasksList: state.tasks.exportTasksList, loggedUser: state.user, viewingTasksForUser: state.tasks.viewingTasksForUser}
})(TaskExport);