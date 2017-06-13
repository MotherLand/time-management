import React from 'react';
import UserRow from 'UserRow';
import UsersFilter from 'UsersFilter'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {fetchUsers} from 'userActions'

class UserList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};

        this.getUsers = this
            .getUsers
            .bind(this)
    }

    getUsers() {
        return this
            .props
            .usersList
            .map((user) => {
                return <UserRow key={user._id} user={user}/>
            })
    }

    componentWillMount() {
        this
            .props
            .dispatch(fetchUsers(this.props.filter));
    }

    render() {
        return (
            <div>
                <UsersFilter/>
                <hr/>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th className="col-sm-5">Name</th>
                            <th className="col-sm-2">Role</th>
                            <th className="col-sm-2">Registration Date</th>
                            <th className="text-center col-sm-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.getUsers()}
                    </tbody>
                </table>
            </div>
        );
    }
}

UserList.propTypes = {}

module.exports = connect((state) => {
    return {usersList: state.users.usersList, filter: state.users.filter}
})(UserList);