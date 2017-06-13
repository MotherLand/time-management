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
const UserModel = require('../user').model;
const AuthModel = require('./model')

const authenticatedUser = {
    name: "marcelo",
    login: "marcelo",
    password: "123456",
    preferredWorkLoad: "8"
}

const authenticatedToken = (() => {
    return jwt.sign(authenticatedUser, AuthModel.secret)
})()

describe('Auth tests', () => {
    // clean up the database
    beforeEach((done) => {
        UserModel.remove({}, (err) => {
            done();
        })
    })

    it('it should authenticate the user', (done) => {
        const user = authenticatedUser
        chai.request(app)
            .post('/api/v1/user')
            .set('x-access-token', authenticatedToken)
            .send(user)
            .end((err, res) => {
                chai.request(app)
                    .post('/api/v1/auth/authenticate')
                    .send({ login: user.login, password: user.password })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.a.property('data');
                        res.body.data.should.be.a('object');
                        res.body.data.should.have.a.property('token');
                        done();
                    });
            });
    });

    it('it should not authenticate the user', (done) => {
        const user = authenticatedUser
        chai.request(app)
            .post('/api/v1/user')
            .set('x-access-token', authenticatedToken)
            .send(user)
            .end((err, res) => {
                chai.request(app)
                    .post('/api/v1/auth/authenticate')
                    .send({ login: user.login, password: "abcde" })
                    .end((err, res) => {
                        res.should.have.status(401);
                        res.body.should.have.a.property('meta');
                        res.body.meta.should.have.a.property('name').eql('AuthenticationError');
                        res.body.meta.should.have.a.property('detail').eql('Could not authenticate user');
                        done();
                    });
            });
    });

    it('it should return an Error', (done) => {
        AuthModel.encryptPassword(null, (err, hash) => {
            expect(hash).to.be.eq(null)
            done();
        })
    });

})