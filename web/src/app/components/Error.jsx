import React from 'react'
import PropTypes from 'prop-types';

class Error extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="alert alert-danger" role="alert">
                <strong>Oops!</strong>&nbsp;
                {this.props.message}
            </div>
        )
    }
}

Error.propTypes = {
    message: PropTypes.string.isRequired
}

module.exports = Error;