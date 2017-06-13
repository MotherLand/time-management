import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValidationFail, hideError } from 'actions';
import { saveTask, loadUserOptions, fetchTasks } from 'taskActions'
import { viewTasks } from 'userActions'
import moment from 'moment'

class TaskForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onSubmit = this
            .onSubmit
            .bind(this);
        this.getUserSelect = this
            .getUserSelect
            .bind(this);
        this.setViewingTasksForUser = this
            .setViewingTasksForUser
            .bind(this);
        this.getUserOptions = this
            .getUserOptions
            .bind(this);
        this.emptyForm = this.emptyForm.bind(this)
    }

    onSubmit(e) {
        e.preventDefault();

        const fieldNames = {
            date: "Date",
            workedHours: "Worked hours"
        }

        const task = {
            date: this.refs.date.value,
            workedHours: this.refs.workedHours.value,
            notes: this.refs.notes.value,
            user: this.refs.user.value
        };

        if (this.props.editingTask) {
            task._id = this.props.editingTask._id || ""
        }

        for (const i in task) {
            if (["_id", "notes"].indexOf(i) === -1 && task[i] == "") {
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

        this
            .props
            .dispatch(saveTask(task))

        this.emptyForm()
    }

    emptyForm() {
        this.refs.notes.value = ""
        this.refs.date.value = ""
        this.refs.workedHours.value = ""
    }

    componentWillMount() {
        this
            .props
            .dispatch(loadUserOptions())
    }

    componentDidUpdate() {
        this.refs.user.value = (this.props.viewingTasksForUser || this.props.loggedUser)._id
        if (this.props.editingTask && this.refs) {
            const { notes, date, workedHours } = this.props.editingTask
            this.refs.notes.value = notes || ""
            this.refs.date.value = moment
                .utc(date)
                .format('YYYY-MM-DD') || ""
            this.refs.workedHours.value = workedHours || ""
            window.scrollTo(0, 0)
        } else {
            this.emptyForm()
        }
    }

    getUserSelect() {
        if (this.props.loggedUser.role == 'admin') {
            return (
                <div className="col-lg-3">
                    <div className="form-group">
                        <label htmlFor="">User</label>
                        <select
                            className="form-control"
                            onChange={this.setViewingTasksForUser}
                            ref="user">
                            <option value={this.props.loggedUser._id}>Me</option>
                            {this.getUserOptions()}
                        </select>
                    </div>
                </div>
            )
        } else {
            return <input type="hidden" ref="user" />
        }
    }

    getUserOptions() {

        return this
            .props
            .userOptions
            .map(user => {
                if (user._id != this.props.loggedUser._id) {
                    return <option key={user._id} value={user._id}>{user.name}</option>
                }
            })
    }

    setViewingTasksForUser() {
        const selectedUser = Array
            .prototype
            .filter
            .call(this.props.userOptions, ((user) => user._id == this.refs.user.value))
            .pop()
        this
            .props
            .dispatch(viewTasks(selectedUser))
        this
            .props
            .dispatch(fetchTasks({ user: selectedUser._id }))
    }

    render() {
        return (
            <form>
                <div className="row">
                    {this.getUserSelect()}
                    <div className="col-lg-3">
                        <div className="form-group">
                            <label htmlFor="">When</label>
                            <input type="date" className="form-control" ref="date" />
                        </div>
                    </div>
                    <div className="col-lg-3">
                        <div className="form-group">
                            <label htmlFor="">Time spent</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="For how long?"
                                ref="workedHours" />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="form-group">
                            <label htmlFor="">Notes</label>
                            <textarea className="form-control" placeholder="Notes" rows="5" ref="notes" />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <button type="submit" className="btn btn-primary" onClick={this.onSubmit}>Save</button>
                    </div>
                </div>
            </form>
        );
    }
}

TaskForm.propTypes = {}

module.exports = connect((state) => {
    return { editingTask: state.tasks.editingTask, viewingTasksForUser: state.tasks.viewingTasksForUser, userOptions: state.tasks.userOptions, loggedUser: state.user }
})(TaskForm);