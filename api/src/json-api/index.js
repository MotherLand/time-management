'use strict'

const format = (req, res, next) => {
    res.setHeader('Content-Type', 'application/vnd.api+json');
    const json = res.json;

    res.json = function () {
        if (typeof arguments[0] === 'object') {
            arguments[0] = setBody(req, res, arguments);
        }
        json.apply(this, arguments);
    };

    next();
}

const setBody = (req, res, args) => {
    var data
    // handle mongodb errors
    if (errorKeys.indexOf(args[0]['name']) !== -1) {
        data = {}
    } else {
        data = args[0]
    }

    return {
        data: data,
        errors: setErrors(res),
        meta: setMeta(args[0])
    }
}

const setErrors = (res) => {
    var error = []

    if (res.statusCode >= 400) {
        error.push({
            status: res.statusCode,
            title: 'Something went wrong',
            detail: getErrorDescription(String(res.statusCode))
        })
    }

    return error
}

const setMeta = (res) => {
    var meta = {}

    if (errorKeys.indexOf(res['name']) !== -1) {
        meta = res
    }

    return meta
}

const getErrorDescription = (statusCode) => {
    var description = '';
    description = errorMessages[statusCode] || errorMessages[statusCode[0]] || 'We cannot provide you with further information at this time';
    return description
}

//todo grab list from another mechanism that allows routes to export the errors they use
const errorKeys = ['ValidationError', 'MongoError', 'AuthenticationError', 'EmptyTokenError',
    'NoTokenError', 'EmptyPasswordError', 'FormError', 'AuthenticationError', 'ApplicationError'
];

const errorMessages = {
    '400': 'We could not understand that request',
    '401': 'You are not logged in',
    '403': 'You can not access this resource',
    '404': 'We could not find what you requested',
    '500': 'Something went wrong with our servers',
    '503': 'Our servers are temporarily down',
}

module.exports.format = format;