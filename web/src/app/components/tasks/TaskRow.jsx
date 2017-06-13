import React from 'react';
import PropTypes from 'prop-types';
import {editTask, deleteTask} from 'taskActions'
import {connect} from 'react-redux'
import moment from 'moment'

class TaskRow extends React.Component {

    constructor(props) {
        super(props);
        this.onEdit = this
            .onEdit
            .bind(this);
        this.onDelete = this
            .onDelete
            .bind(this);
        this.getRowClassName = this
            .getRowClassName
            .bind(this);
    }

    onEdit() {
        this
            .props
            .dispatch(editTask(this.props.task))
    }

    onDelete() {
        if (window.confirm('Delete task?')) {
            this
                .props
                .dispatch(deleteTask(this.props.task))
        }
    }

    getRowClassName() {
        if (this.props.task.metPreferredWorkload == false) {
            return 'alert alert-danger'
        }
        return ''
    }

    render() {
        const {date, notes, workedHours} = this.props.task
        return (
            <tr className={this.getRowClassName()}>
                <td>{moment
                        .utc(date)
                        .format('MM/DD/YYYY')}</td>
                <td>{workedHours}</td>
                <td style={{
                    whiteSpace: 'pre-wrap'
                }}>{notes}</td>
                <td className="text-center">
                    <a className="btn btn-default horizontal-gutter" onClick={this.onEdit}>Edit</a>
                    <a className="btn btn-danger horizontal-gutter" onClick={this.onDelete}>Delete</a>
                </td>
            </tr>
        );
    }
}

TaskRow.propTypes = {
    task: PropTypes.object.isRequired
}

module.exports = connect((state) => {
    return {}
})(TaskRow);