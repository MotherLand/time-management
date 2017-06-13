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
    role: "admin"
}

const authenticatedToken = (() => {
    return jwt.sign(authenticatedUser, AuthModel.secret)
})()

const USER = 'user'
const MANAGER = 'manager'
const ADMIN = 'admin'

const getUser = (n, role) => {
    return {
        name: "marcelo " + n,
        login: "marcelo" + n,
        password: "123456",
        role: role || ADMIN,
        preferredWorkLoad: "8"
    }
}

describe('Users', () => {
    // clean up the database
    beforeEach((done) => {
        UserModel.remove({}, (err) => {
            done()
        })
    })

    describe('User routes tests', () => {

        it('it should create an user with user role', (done) => {
            const user = getUser(1);
            delete(user.role)
            chai.request(app)
                .post('/api/v1/user/signup')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.a.property('data');
                    res.body.data.should.have.a.property('token');
                    jwt.verify(res.body.token, AuthModel.secret, (err, decoded) => {
                        should(decoded).have.a.property('login').eql(user.login)
                        should(decoded).have.a.property('role').eql(USER)
                    })
                    done();
                });
        });

        it('it should GET all the users', (done) => {
            chai.request(app)
                .get('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.a.property('data');
                    res.body.data.should.be.a('array');
                    res.body.data.length.should.be.eql(0);
                    done();
                });
        });

        it('it should return an error for a POSTing an user without a name field', (done) => {
            let user = getUser()
            delete(user.name)

            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('meta');
                    res.body.meta.should.have.property('errors');
                    res.body.meta.errors.should.have.property('name');
                    res.body.meta.errors.name.should.have.property('kind').eql('required');
                    done();
                });
        });

        it('it should return an error for POSTing a user without a login field', (done) => {
            let user = getUser()
            user.login = ''

            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('meta');
                    res.body.meta.should.have.property('errors');
                    res.body.meta.errors.should.have.property('login');
                    res.body.meta.errors.login.should.have.property('kind').eql('required');
                    done();
                });
        });

        it('it should return an error for POSTing a user without a password field', (done) => {
            let user = getUser()
            user.password = ''

            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('meta');
                    res.body.meta.should.have.property('name').eql('ValidationError');
                    done();
                });
        });

        it('it should return an error for POSTing a user without a preferredWorkLoad field', (done) => {
            let user = getUser()
            user.preferredWorkLoad = ''

            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    //res.body.meta.should.have.property('_message').eql();
                    done();
                });
        });

        it('it should POST a user with a default role field', (done) => {
            let user = getUser(1)
            user.role = ''
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.be.a('object');
                    res.body.data.should.have.property('role').eql(USER);
                    done();
                });
        });

        it('it should return an error for POSTing a user with duplicate login field', (done) => {
            let user = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user)
                .end((err, res) => {
                    // create another user with same login
                    chai.request(app)
                        .post('/api/v1/user')
                        .set('x-access-token', authenticatedToken)
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(500);
                            res.body.should.be.a('object');
                            res.body.should.have.property('meta');
                            res.body.meta.should.have.property('errmsg').have.string('duplicate')
                            done();
                        });
                });
        });

        it('it should require authentication', (done) => {

            chai.request(app)
                .get('/api/v1/user')
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                })
        });

        it('it should GET 1 user in an array', (done) => {
            let user1 = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    chai.request(app)
                        .get('/api/v1/user')
                        .set('x-access-token', authenticatedToken)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('data');
                            res.body.data.should.be.a('array');
                            res.body.data.length.should.be.eql(1);
                            done();
                        });
                })
        });

        it('it should GET 1 user object', (done) => {
            let user1 = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    chai.request(app)
                        .get('/api/v1/user/' + res.body.data._id)
                        .set('x-access-token', authenticatedToken)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('data');
                            res.body.data.should.be.a('object');
                            done();
                        });
                })
        });

        it('it should PUT 1 user object', (done) => {
            let user1 = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    user1.name = 'novo nome';
                    chai.request(app)
                        .put('/api/v1/user/' + res.body.data._id)
                        .set('x-access-token', authenticatedToken)
                        .send(user1)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('data');
                            res.body.data.should.be.a('object');
                            res.body.data.should.have.property('name').eql('novo nome');
                            done();
                        });
                })
        });

        it('it should DELETE 1 user object', (done) => {
            let user1 = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    chai.request(app)
                        .delete('/api/v1/user/' + res.body.data._id)
                        .set('x-access-token', authenticatedToken)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('data');
                            res.body.data.should.be.a('object');
                            done();
                        });
                })
        });

        it('it should encrypt user password', (done) => {
            let user1 = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.be.a('object');
                    res.body.data.should.have.property('password').not.eql(user1.password)
                    done();
                })
        });

        it('it should UPDATE user password', (done) => {
            let user1 = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {

                    let obj = res.body.data
                    obj.password = "new.password"

                    chai.request(app)
                        .put('/api/v1/user/' + res.body.data._id)
                        .set('x-access-token', authenticatedToken)
                        .send(obj)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('data');
                            res.body.data.should.be.a('object');
                            res.body.data.should.have.property('password').not.eql(user1.password)
                            done();
                        });
                })
        });

        it('it should return a Form Error for invalid id value', (done) => {
            let user1 = getUser(1)

            // create new user
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {

                    let obj = res.body.data
                    obj.password = "new.password"

                    chai.request(app)
                        .get('/api/v1/user/a1b2c3')
                        .set('x-access-token', authenticatedToken)
                        .send(obj)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.have.a.property('meta')
                            res.body.meta.should.have.a.property('name').eql('FormError')
                            done();
                        });
                })
        });

        it('it should return an error for GETing a different user with a USER role', (done) => {
            const user1 = getUser(5, USER)
            const user2 = getUser(6, USER)
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
                            // try go GET user 2 with user 1 token
                            chai.request(app)
                                .get('/api/v1/user/' + res.body.data._id)
                                .set('x-access-token', user1)
                                .end((err, res) => {
                                    res.should.have.status(403);
                                    res.body.should.have.a.property('meta')
                                    res.body.meta.should.have.a.property('name').eql('AuthenticationError')
                                    done();
                                });
                        })
                })
        });

        it('it should return an error for PUTing another user with user role', (done) => {
            const user1 = getUser(7, USER)
            const user2 = getUser(8, USER)

            // create user 1
            chai.request(app)
                .post('/api/v1/user/signup')
                .send(user1)
                .end((err, res) => {
                    const user1Token = res.body.data.token
                        // create user 2
                    chai.request(app)
                        .post('/api/v1/user/signup')
                        .send(user2)
                        .end((err, res) => {
                            jwt.verify(res.body.data.token, AuthModel.secret, (err, decoded) => {
                                // try go PUT user 2 with user 1 token
                                chai.request(app)
                                    .put('/api/v1/user/' + decoded._id)
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
                })
        });

        it('it should return an error for deleting a different user with a USER role', (done) => {
            const user1 = getUser(5, USER)
            const user2 = getUser(6, USER)
            const user1Token = jwt.sign(user1, AuthModel.secret)

            // create user 1
            chai.request(app)
                .post('/api/v1/user/signup')
                .send(user1)
                .end((err, res) => {
                    const user1Token = res.body.data.token
                        // create user 2
                    chai.request(app)
                        .post('/api/v1/user/signup')
                        .send(user2)
                        .end((err, res) => {
                            // try go GET user 2 with user 1 token
                            jwt.verify(res.body.data.token, AuthModel.secret, (err, decoded) => {
                                chai.request(app)
                                    .delete('/api/v1/user/' + decoded._id)
                                    .set('x-access-token', user1Token)
                                    .end((err, res) => {
                                        res.should.have.status(403);
                                        res.body.should.have.a.property('meta')
                                        res.body.meta.should.have.a.property('name').eql('AuthenticationError')
                                        done();
                                    });
                            })
                        })
                })
        });

        it('it should allow user to delete itself', (done) => {
            const user1 = getUser(5, USER)
                // create user 1
            chai.request(app)
                .post('/api/v1/user/signup')
                .send(user1)
                .end((err, res) => {
                    jwt.verify(res.body.data.token, AuthModel.secret, (err, decoded) => {
                        chai.request(app)
                            .delete('/api/v1/user/' + decoded._id)
                            .set('x-access-token', res.body.data.token)
                            .end((err, res) => {
                                res.should.have.status(200);
                                done();
                            });
                    });
                })
        });

        it('it should allow PUTing another user with manager role', (done) => {
            const user1 = getUser(7, MANAGER)
            const user2 = getUser(8, USER)

            // create user 1
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    // create user 2
                    const user1Token = jwt.sign(res.body.data, AuthModel.secret)
                    chai.request(app)
                        .post('/api/v1/user/signup')
                        .send(user2)
                        .end((err, res) => {
                            // try go PUT user 2 with user 1 token
                            jwt.verify(res.body.data.token, AuthModel.secret, (err, decoded) => {
                                chai.request(app)
                                    .put('/api/v1/user/' + decoded._id)
                                    .set('x-access-token', user1Token)
                                    .send(user2)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        done();
                                    });
                            })
                        })
                })
        });

        it('it should allow deleting another user with manager role', (done) => {
            const user1 = getUser(7, MANAGER)
            const user2 = getUser(8, USER)

            // create user 1
            chai.request(app)
                .post('/api/v1/user')
                .set('x-access-token', authenticatedToken)
                .send(user1)
                .end((err, res) => {
                    // create user 2
                    const user1Token = jwt.sign(res.body.data, AuthModel.secret)
                    chai.request(app)
                        .post('/api/v1/user/signup')
                        .send(user2)
                        .end((err, res) => {
                            // try go PUT user 2 with user 1 token
                            jwt.verify(res.body.data.token, AuthModel.secret, (err, decoded) => {
                                chai.request(app)
                                    .delete('/api/v1/user/' + decoded._id)
                                    .set('x-access-token', user1Token)
                                    .send(user2)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        done();
                                    });
                            })
                        })
                })
        });

        it('it should allow putting another user with admin role', (done) => {
            const user1 = getUser(7, ADMIN)
            const user2 = getUser(8, USER)

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
                            jwt.verify(res.body.data.token, AuthModel.secret, (err, decoded) => {
                                chai.request(app)
                                    .put('/api/v1/user/' + decoded._id)
                                    .set('x-access-token', user1Token)
                                    .send(user2)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        done();
                                    });
                            })
                        })
                })
        });

        it('it should allow deleting another user with admin role', (done) => {
            const user1 = getUser(7, ADMIN)
            const user2 = getUser(8, USER)

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
                            jwt.verify(res.body.data.token, AuthModel.secret, (err, decoded) => {
                                chai.request(app)
                                    .delete('/api/v1/user/' + decoded._id)
                                    .set('x-access-token', user1Token)
                                    .send(user2)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        done();
                                    });
                            })
                        })
                })
        });

        //todo add user/me route test
    })
});