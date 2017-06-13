'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')
const ObjectId = require('mongoose').Types.ObjectId
const moment = require('moment')

// Task schema definition
let TaskSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        required: false,
    },
    workedHours: {
        type: Number,
        set: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    metPreferredWorkload: {
        type: Boolean
    }
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

// sets creation and last updated times
TaskSchema.pre('save', function(next) {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    if (this.workedHours < 0) {
        this.workedHours = 0;
    }
    next();
});

const TaskModel = mongoose.model('Task', TaskSchema)

const _getMatches = (filter) => {
    const user = filter.user || ''
    const from = filter.from || ''
    var to = filter.to || ''

    if (to) {
        to = moment.utc(to).add(1, 'days').toDate()
    }

    return {
        "$and": [
            { "user": ObjectId(filter.user) },
            (() => { return from ? { "date": { "$gte": from } } : {} })(),
            (() => { return to ? { "date": { "$lt": to } } : {} })(),
        ]
    }
}

TaskModel.getDailySums = function(filter, callback) {
    TaskModel.aggregate([{
            $match: _getMatches(filter)
        },
        {
            $group: {
                "_id": "$date",
                "hours": { $sum: "$workedHours" }
            }
        }

    ], (err, dailySums) => {
        callback(err, dailySums)
    })
}

TaskModel.getTasks = function(filter, callback) {
    TaskModel.find(_getMatches(filter), function(err, result) {
        callback(err, result)
    }).sort('-date')
}

TaskModel.getTasksForExport = function(filter, callback) {
    TaskModel.aggregate([{
            $match: _getMatches(filter)
        },
        {
            $group: {
                "_id": "$date",
                "hours": { $sum: "$workedHours" },
                "notes": { $push: "$notes" }
            }
        }

    ], (err, dailySums) => {
        callback(err, dailySums)
    })
}

module.exports = TaskModel