'use strict'

const TaskRouter = require('express').Router()
const TaskModel = require('./model')
const ObjectId = require('mongoose').Types.ObjectId
const jwt = require('jsonwebtoken')
const moment = require('moment')

const _emit_task_updates = (request, task) => {
    request.app.io.emit('ADMIN_CHANNEL', { action: 'TASK_UPDATES', user: task.user });
    request.app.io.emit('USER_CHANNEL_' + task.user, { action: 'TASK_UPDATES', user: task.user });
}

const _getFilter = (request) => {
    var filter = {}

    if (request.query.from) {
        filter.from = moment.utc(request.query.from, 'YYYY-MM-DD').toDate()
    }
    if (request.query.to) {
        filter.to = moment.utc(request.query.to, 'YYYY-MM-DD').toDate()
    }

    // user permissions - request userId or session userId
    if (request.authenticatedUser.role == 'admin' && request.query.user != '') {
        filter.user = request.query.user
    } else {
        filter.user = request.authenticatedUser._id
    }

    return filter
}

/**
 * GET retrieve all tasks
 */
TaskRouter.get('/', (request, response) => {
    var filter = _getFilter(request)

    TaskModel.getDailySums(filter, (err, dailySums) => {

        var datesAndHours = {}
        Array.prototype.forEach.call(dailySums, function (day) {
            datesAndHours[day._id.valueOf()] = day.hours
        })

        TaskModel.getTasks(filter, (err, tasks) => {
            if (err) {
                return response.end(err)
            }
            const result = tasks.map((task) => {
                const totalWorkedHours = datesAndHours[task.date.valueOf()]
                task.metPreferredWorkload = (totalWorkedHours >= Number(request.authenticatedUser.preferredWorkLoad))
                return task
            })

            response.json(result)
        })

    })
})


TaskRouter.get('/export', (request, response) => {
    var filter = _getFilter(request)

    TaskModel.getTasksForExport(filter, (err, exportValues) => {
        if (err) {
            response.status(500).json(err)
        }
        response.json(exportValues)
    })
})

/**
 * GET task if the user is allowed
 */
TaskRouter.get('/:id', (request, response) => {
    const _user = request.authenticatedUser;
    const { id } = request.params;

    if (ObjectId.isValid(id) == false) {
        return response.status(404).json({
            name: "FormError",
            detail: 'Invalid id'
        })
    } else {
        TaskModel.findById(id, (err, task) => {
            if (err) {
                return response.status(500).json(err)
            }
            if (_user.role != 'admin' && _user._id != task.user) {
                return response.status(403).json({
                    name: "AuthenticationError",
                    detail: "You are not allowed to perform this action"
                })
            }
            response.json(task)
        })
    }
})

/**
 * POST creates a task for the authenticated user
 */
TaskRouter.post('/', (request, response) => {
    const task = new TaskModel(request.body)

    //admin can create tasks for users
    if (request.authenticatedUser.role != 'admin') {
        task.user = ObjectId(request.authenticatedUser._id)
    }

    task.save((err, task) => {
        if (err) {
            return response.status(500).json(err)
        }
        _emit_task_updates(request, task);
        response.json(task)
    })
})

/**
 * PUT updates a task for the authenticated user
 */
TaskRouter.put('/:id', (request, response) => {
    const _user = request.authenticatedUser;
    const { id } = request.params;
    const data = request.body;

    //admin can create tasks for users
    if (request.authenticatedUser.role != 'admin') {
        data.user = ObjectId(request.authenticatedUser._id)
    }

    if (ObjectId.isValid(id) == false) {
        return response.status(404).json({
            name: "FormError",
            detail: 'Invalid id'
        })
    } else {
        TaskModel.findById(id, (err, task) => {
            if (err) {
                return response.status(500).json(err)
            }
            if (_user.role != 'admin' && _user._id != task.user) {
                return response.status(403).json({
                    name: "AuthenticationError",
                    detail: "You are not allowed to perform this action"
                })
            }
            Object.assign(task, data).save((err, res) => {
                if (err) {
                    return response.status(500).json(err)
                }
                _emit_task_updates(request, task)
                response.json(task)
            })
        })
    }
})

/**
 * DELETE removes task for the authenticated user
 */
TaskRouter.delete('/:id', (request, response) => {
    const _user = request.authenticatedUser;
    const {
        id
    } = request.params;
    const data = request.body;

    if (ObjectId.isValid(id) == false) {
        return response.status(404).json({
            name: "FormError",
            detail: 'Invalid id'
        })
    } else {
        TaskModel.findById(id, (err, task) => {
            if (err) {
                return response.status(500).json(err)
            }
            if (_user.role != 'admin' && _user._id != task.user) {
                return response.status(403).json({
                    name: "AuthenticationError",
                    detail: "You are not allowed to perform this action"
                })
            }
            TaskModel.findByIdAndRemove(id, (err, result) => {
                if (err) {
                    return response.status(500).json(err)
                }
                _emit_task_updates(request, task)
                response.json({})
            })
        })
    }
})

module.exports = TaskRouter