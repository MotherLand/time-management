'use strict'

process.env['MONGO_HOST'] = 'ds155651.mlab.com'
process.env['MONGO_USER'] = 'test'
process.env['MONGO_PASSWORD'] = 'test'
process.env['MONGO_PORT'] = '55651'
process.env['MONGO_DATABASE'] = 'time-management'
process.env['ENVIRONMENT'] = 'test'

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const app = require('../app');
const UserModel = require('./model');
const AuthModel = require('../auth').model

const authenticatedUser = {
    name: "marcelo",
    login: "marcelo",
    password: "123456",
    role: "Admin"
}

const authenticatedToken = (() => {
    return jwt.sign(authenticatedUser, AuthModel.secret)
})()

const getUser = (n, role) => {
    return {
        name: "marcelo " + n,
        login: "marcelo" + n,
        password: "123456",
        role: role || 'Admin',
        preferredWorkingHours: [
            { "weekDay": "1", "start": "07:00", "finish": "15:00" },
            { "weekDay": "2", "start": "05:00", "finish": "08:00" },
            { "weekDay": "3", "start": "05:00", "finish": "08:00" },
            { "weekDay": "4", "start": "05:00", "finish": "08:00" },
            { "weekDay": "5", "start": "05:00", "finish": "08:00" },
            { "weekDay": "6", "start": "05:00", "finish": "08:00" },
            { "weekDay": "7", "start": "05:00", "finish": "08:00" }
        ]
    }
}

describe('Users', () => {
    // clean up the database
    beforeEach((done) => {
        UserModel.remove({}, (err) => {
            done()
        })
    })

    describe('/PUT user', () => {
        it('it should return an error for PUTing another user with user role', (done) => {
            const user1 = getUser(7, 'User')
            const user2 = getUser(8, 'User')
            const user1Token = jwt.sign(user1, AuthModel.secret)

            // create user 1
            chai.request(app)
                .post('/api/v1/user/signup')
                .send(user1)
                .end((err, res) => {
                    // create user 2
                    chai.request(app)
                        .post('/api/v1/user/signup')
                        .send(user2)
                        .end((err, res) => {
                            // try go PUT user 2 with user 1 token
                            chai.request(app)
                                .put('/api/v1/user/' + res.body.data._id)
                                .set('x-access-token', user1Token)
                                .send(user2)
                                .end((err, res) => {
                                    res.should.have.status(403);
                                    res.body.should.have.a.property('meta')
                                    res.body.meta.should.have.a.property('name').eql('AuthenticationError')
                                    done();
                                });
                        })
                })
        });
    });

    describe('/PUT user', () => {
        it('it should allow PUTing another user with manager role', (done) => {
            const user1 = getUser(7, 'Manager')
            const user2 = getUser(8, 'User')

            // create user 1
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    // create user 1 token
                    const user1Token = jwt.sign(res.body.data, AuthModel.secret)
                    // create user 2
                    chai.request(app)
                        .post('/api/v1/user/signup')
                        .send(user2)
                        .end((err, res) => {
                            // try go PUT user 2 with user 1 token
                            chai.request(app)
                                .put('/api/v1/user/' + res.body.data._id)
                                .set('x-access-token', user1Token)
                                .send(user2)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    done();
                                });
                        })
                })
        });
    });

    describe('/PUT user', () => {
        it('it should allow PUTing another user with manager role', (done) => {
            const user1 = getUser(7, 'Manager')
            const user2 = getUser(8, 'User')

            // create user 1
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    // create user 1 token
                    const user1Token = jwt.sign(res.body.data, AuthModel.secret)
                    // create user 2
                    chai.request(app)
                        .post('/api/v1/user/signup')
                        .send(user2)
                        .end((err, res) => {
                            // try go PUT user 2 with user 1 token
                            chai.request(app)
                                .put('/api/v1/user/' + res.body.data._id)
                                .set('x-access-token', user1Token)
                                .send(user2)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    done();
                                });
                        })
                })
        });
    });

})