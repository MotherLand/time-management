'use strict'

const { format } = require('./index')

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
const express = require('express')
const app = express()

chai.use(chaiHttp);

app.use(format)
app.get('/test-empty-response', (req, res) => {
    res.json({})
})

app.get('/test-object-response', (req, res) => {
    res.json({ response: '123' })
})

app.get('/test-list-response', (req, res) => {
    res.json([
        { response: '123' },
        { response: '123' },
        { response: '123' },
        { response: '123' }
    ])
})

app.get('/test-error-400', (req, res) => {
    res.status(400).json({ response: '123' })
})

app.get('/test-error-500', (req, res) => {
    res.status(500).json({ response: '123' })
})

app.get('/test-validation-error', (req, res) => {
    res.status(500).json({
        "errors": {
            "name": {
                "message": "Path `name` is required.",
                "name": "ValidatorError",
                "properties": {
                    "type": "required",
                    "message": "Path `{PATH}` is required.",
                    "path": "name"
                },
                "kind": "required",
                "path": "name"
            }
        },
        "_message": "User validation failed",
        "name": "ValidationError"
    })
})

app.get('/test-mongo-error', (req, res) => {
    res.status(500).json({
        "name": 'MongoError',
        "code": 11000,
        "index": 0,
        "errmsg": "E11000 duplicate key error index: time-management.users.$login_1 dup key: { : \"marcelo\" }",
        "op": {
            "name": "marcelo",
            "login": "marcelo",
            "password": "123456",
            "_id": "59305c04842bcebc602b6341",
            "updatedAt": "2017-06-01T18:25:08.494Z",
            "createdAt": "2017-06-01T18:25:08.494Z",
            "role": "Admin",
            "__v": 0
        }
    })
})

// todo add auth errors

describe('json-api tests', () => {

    it('it should have data, error, and meta elements', (done) => {
        chai.request(app)
            .get('/test-empty-response')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.a.property('data');
                res.body.should.have.a.property('errors');
                res.body.should.have.a.property('data');
                done();
            });
    });

    it('it should have an object in the data element', (done) => {
        chai.request(app)
            .get('/test-object-response')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.a.property('data');
                res.body.data.should.be.a('object')
                done();
            });
    });

    it('it should have a list with 4 objects in the data element', (done) => {
        chai.request(app)
            .get('/test-list-response')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.a.property('data');
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(4);
                done();
            });
    });

    it('it should have a 400 error', (done) => {
        chai.request(app)
            .get('/test-error-400')
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.a.property('errors');
                res.body.errors.should.be.a('array');
                res.body.errors.length.should.be.eql(1)
                expect(res.body.errors[0]).to.have.a.property('status');
                expect(res.body.errors[0].status).to.be.eql(400);
                expect(res.body.errors[0]).to.have.a.property('title');
                expect(res.body.errors[0]).to.have.a.property('detail');
                done();
            });
    });

    it('it should have a 500 error', (done) => {
        chai.request(app)
            .get('/test-error-500')
            .end((err, res) => {
                res.should.have.status(500);
                res.body.should.be.a('object');
                res.body.should.have.a.property('errors');
                res.body.errors.should.be.a('array');
                res.body.errors.length.should.be.eql(1)
                expect(res.body.errors[0]).to.have.a.property('status');
                expect(res.body.errors[0].status).to.be.eql(500);
                expect(res.body.errors[0]).to.have.a.property('title');
                expect(res.body.errors[0]).to.have.a.property('detail');
                done();
            });
    });

    it('it should have a ValidationError', (done) => {
        chai.request(app)
            .get('/test-validation-error')
            .end((err, res) => {
                res.should.have.status(500);
                res.body.should.be.a('object');
                res.body.should.have.a.property('errors');
                res.body.errors.should.be.a('array');
                res.body.errors.length.should.be.eql(1)
                expect(res.body.errors[0]).to.have.a.property('status');
                expect(res.body.errors[0].status).to.be.eql(500);
                expect(res.body.errors[0]).to.have.a.property('title');
                expect(res.body.errors[0]).to.have.a.property('detail');

                res.body.should.have.a.property('meta');
                res.body.meta.should.be.a('object')
                res.body.meta.should.have.a.property('name').eql('ValidationError')

                done();
            });
    });

    it('it should have a MongoError', (done) => {
        chai.request(app)
            .get('/test-mongo-error')
            .end((err, res) => {
                res.should.have.status(500);
                res.body.should.be.a('object');
                res.body.should.have.a.property('errors');
                res.body.errors.should.be.a('array');
                res.body.errors.length.should.be.eql(1)
                expect(res.body.errors[0]).to.have.a.property('status');
                expect(res.body.errors[0].status).to.be.eql(500);
                expect(res.body.errors[0]).to.have.a.property('title');
                expect(res.body.errors[0]).to.have.a.property('detail');

                res.body.should.have.a.property('meta');
                res.body.meta.should.be.a('object')
                res.body.meta.should.have.a.property('code')

                done();
            });
    });

})