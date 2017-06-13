import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {fetchTasks, exportTasks} from 'taskActions';

class TasksFilter extends React.Component {

    constructor(props) {
        super(props);
        this.onSearch = this
            .onSearch
            .bind(this);
        this.onExport = this
            .onExport
            .bind(this);
        this.getFilter = this
            .getFilter
            .bind(this)
        this.updateFilter = this
            .updateFilter
            .bind(this)
    }

    onSearch() {
        this
            .props
            .dispatch(fetchTasks(this.getFilter()))
    }

    onExport() {
        this
            .props
            .dispatch(exportTasks(this.getFilter()))
    }

    getFilter() {
        const filter = {
            from: this.refs.from.value,
            to: this.refs.to.value,
            user: (this.props.viewingTasksForUser || {})._id
        }
        return filter
    }

    updateFilter() {
        if (typeof this.refs.from !== 'undefined' && typeof this.refs.to !== 'undefined') {
            this.refs.from.value = this.props.filter.from
            this.refs.to.value = this.props.filter.to
        }
    }

    render() {
        this.updateFilter()
        return (
            <form className="form-inline" onSubmit={this.onSearch}>
                <div className="form-group">
                    <label className="horizontal-gutter">Filter From</label>
                    <input type="date" className="form-control horizontal-gutter" ref="from"/>
                </div>
                <div className="form-group">
                    <label className="horizontal-gutter">To</label>
                    <input type="date" className="form-control horizontal-gutter" ref="to"/>
                </div>
                <button className="btn btn-primary horizontal-gutter" type="submit">Filter</button>
                <button
                    className="btn btn-default horizontal-gutter pull-right"
                    onClick={this.onExport}>Export</button>
            </form>
        );
    }
}

TasksFilter.propTypes = {}

module.exports = connect((state) => {
    return {filter: state.tasks.filter, viewingTasksForUser: state.tasks.viewingTasksForUser}
})(TasksFilter);