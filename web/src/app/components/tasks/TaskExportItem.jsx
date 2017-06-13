import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment'

class TaskExportItem extends React.Component {

    constructor(props) {
        super(props)
        this.getNotesLi = this
            .getNotesLi
            .bind(this)
    }
    getNotesLi(notes) {
        const filteredNotes = notes.filter(r => r)
        if (filteredNotes.length > 0) {
            return filteredNotes.map(note => {
                return <li key={note}>{note}</li>;
            })
        }
        return ''
    }

    render() {
        const {_id, hours, notes} = this.props.item
        const date = moment
            .utc(_id)
            .format('MM/DD/YYYY')
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        Date: {date}
                    </div>
                    <div className="panel-body">
                        Worked Hours: {hours}<br/>
                        Notes:
                        <ul>
                            {this.getNotesLi(notes)}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports.TaskExportItem = TaskExportItem