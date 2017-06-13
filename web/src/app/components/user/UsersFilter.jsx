import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {fetchUsers} from 'userActions';

class UsersFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};

        this.onSearch = this
            .onSearch
            .bind(this);
        this.getFilter = this
            .getFilter
            .bind(this)
        this.updateFilter = this
            .updateFilter
            .bind(this)
    }

    getFilter() {
        const filter = {
            name: this.refs.name.value
        }
        return filter
    }

    updateFilter() {
        if (typeof this.refs.name !== 'undefined') {
            this.refs.name.value = this.props.filter.name
        }
    }

    componentDidMount() {
        this.updateFilter()
    }

    onSearch(e) {
        e.preventDefault()
        this
            .props
            .dispatch(fetchUsers(this.getFilter()))
    }

    render() {
        this.updateFilter()
        return (
            <form className="form-inline">
                <div className="form-group">
                    <label className="horizontal-gutter">Name</label>
                    <input type="text" className="form-control horizontal-gutter" ref="name"/>
                </div>
                <button className="btn btn-primary horizontal-gutter" onClick={this.onSearch}>Filter</button>
            </form>
        );
    }
}

UsersFilter.propTypes = {}

module.exports = connect((state) => {
    return {filter: state.users.filter}
})(UsersFilter);