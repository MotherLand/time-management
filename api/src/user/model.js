'use strict'

const mongoose = require('mongoose');
const validator = require('validator')
const Schema = mongoose.Schema;
const roles = ['user', 'manager', 'admin'];
const auth = require('../auth').model;
const TaskModel = require('../task/model').model

// User schema definition
let UserSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: true,
        trim: true,
        validate: {
            validator: validator.isAscii,
            message: 'Please enter your name'
        }
    },
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        default: '',
        lowercase: true,
        validate: {
            validator: validator.isAscii,
            message: 'Please enter your username'
        }
    },
    password: {
        type: String,
        default: '',
        required: function () { return (this._id || '1') == '1'; },
        trim: true,
    },
    role: {
        type: String,
        enum: roles,
        required: true,
        default: 'user',
        validate: {
            validator: (value) => { validator.isIn(value, roles) },
            message: 'Please choose a valid role'
        }
    },
    preferredWorkLoad: {
        type: String,
        required: true,
        default: '',
        validate: {
            validator: validator.isNumeric,
            message: 'Please provide a number of hours you wish to work per day'
        },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// sets creation and last updated times
UserSchema.pre('save', next => {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

UserSchema.pre('delete', next => {
    TaskModel.remove({ user: this._id }, (err, data) => {
        if (err) {
            throw Error()
        }
        next()
    })
})

// User model
const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;