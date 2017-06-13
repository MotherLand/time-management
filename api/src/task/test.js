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
const TaskModel = require('./model');
const AuthModel = require('../auth').model

const ADMIN = 'admin'
const USER = 'user'
const MANAGER = 'manager'

const authenticatedUser = {
    name: "marcelo",
    login: "marcelo",
    password: "123456",
    role: ADMIN
}

const authenticatedToken = (() => {
    return jwt.sign(authenticatedUser, AuthModel.secret)
})()

const getUser = (n, role) => {
    return {
        name: "marcelo " + n,
        login: "marcelo" + n,
        password: "123456",
        role: role || ADMIN,
        preferredWorkLoad: "8"
    }
}

const getTask = () => {
    return {
        notes: 'My Task',
        workedHours: '8'
    }
}

describe('Task routes tests', () => {
    // clean up the database
    beforeEach((done) => {
        TaskModel.remove({}, (err) => {
            UserModel.remove({}, (err) => {
                done()
            })
        })
    })

    // testing under admin role
    it('it should GET all tasks', (done) => {
        chai.request(app)
            .get('/api/v1/task')
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

    it('it should create a task for the user', (done) => {
        const user = getUser(1, ADMIN)
        chai.request(app)
            .post('/api/v1/user')
            .set('x-access-token', authenticatedToken)
            .send(user)
            .end((err, res) => {
                const authdUser = res.body.data
                const user1Token = jwt.sign(authdUser, AuthModel.secret)
                const task = getTask()
                task.user = authdUser._id
                chai.request(app)
                    .post('/api/v1/task')
                    .set('x-access-token', user1Token)
                    .send(task)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.a.property('data');
                        res.body.data.should.be.a('object');
                        res.body.data.should.have.a.property('notes').eql('My Task');
                        res.body.data.should.have.a.property('user').eql(authdUser._id);
                        done();
                    });
            });
    });

    it('it should return an error for a task without workedHours', (done) => {
        const user = getUser(1, ADMIN)
        chai.request(app)
            .post('/api/v1/user')
            .set('x-access-token', authenticatedToken)
            .send(user)
            .end((err, res) => {
                const authdUser = res.body.data
                const user1Token = jwt.sign(authdUser, AuthModel.secret)
                const task = getTask()
                task.workedHours = ''
                chai.request(app)
                    .post('/api/v1/task')
                    .set('x-access-token', user1Token)
                    .send(task)
                    .end((err, res) => {
                        res.should.have.status(500);
                        done();
                    });
            });
    });

    it('it should zero out the a task with negative workedHours', (done) => {
        const user = getUser(1, ADMIN)
        chai.request(app)
            .post('/api/v1/user')
            .set('x-access-token', authenticatedToken)
            .send(user)
            .end((err, res) => {
                const authdUser = res.body.data
                const user1Token = jwt.sign(authdUser, AuthModel.secret)
                const task = getTask()
                task.user = authdUser._id
                task.workedHours = '-10'
                chai.request(app)
                    .post('/api/v1/task')
                    .set('x-access-token', user1Token)
                    .send(task)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.should.have.property('workedHours').eq(0)
                        done();
                    });
            });
    });

    it('it should return error for POSTing a task without an authenticated user', (done) => {
        const user = getUser(1, 'Admin')
        chai.request(app)
            .post('/api/v1/user')
            .set('x-access-token', authenticatedToken)
            .send(user)
            .end((err, res) => {
                const authdUser = res.body.data
                const user1Token = jwt.sign(authdUser, AuthModel.secret)
                const task = getTask()
                chai.request(app)
                    .post('/api/v1/task')
                    .send(task)
                    .end((err, res) => {
                        res.should.have.status(403);
                        done();
                    });
            });
    });

    it('it should GET task for user who created it', (done) => {
        const user = getUser(1, USER)
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                const task = getTask()
                chai.request(app)
                    .post('/api/v1/task')
                    .set('x-access-token', user1Token)
                    .send(task)
                    .end((err, res) => {
                        chai.request(app)
                            .get('/api/v1/task/' + res.body.data._id)
                            .set('x-access-token', user1Token)
                            .end((err, res) => {
                                jwt.verify(user1Token, AuthModel.secret, (err, decoded) => {
                                    res.should.have.status(200);
                                    res.body.should.have.property('data')
                                    res.body.data.should.be.a('object')
                                    res.body.data.should.have.a.property('user').eql(decoded._id)
                                    done();
                                })
                            })
                    });
            });
    });

    it('it should return an error if an USER tries to GET a task from another', (done) => {
        const user = getUser(1, USER)
        const user2 = getUser(2, USER)
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                chai.request(app)
                    .post('/api/v1/user/signup')
                    .send(user2)
                    .end((err, res) => {
                        const user2Token = res.body.data.token
                        const task = getTask()
                        chai.request(app)
                            .post('/api/v1/task')
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                chai.request(app)
                                    .get('/api/v1/task/' + res.body.data._id)
                                    .set('x-access-token', user2Token)
                                    .end((err, res) => {
                                        jwt.verify(user1Token, AuthModel.secret, (err, decoded) => {
                                            res.should.have.status(403);
                                            done();
                                        })
                                    })
                            });
                    })
            });
    });

    it('it should return an error if a MANAGER tries to GET a task from another', (done) => {
        const user = getUser(1, USER)
        const manager = getUser(2, MANAGER)
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                chai.request(app)
                    .post('/api/v1/user/signup')
                    .send(manager)
                    .end((err, res) => {
                        const managerToken = res.body.data.token
                        const task = getTask()
                        chai.request(app)
                            .post('/api/v1/task')
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                chai.request(app)
                                    .get('/api/v1/task/' + res.body.data._id)
                                    .set('x-access-token', managerToken)
                                    .end((err, res) => {
                                        jwt.verify(user1Token, AuthModel.secret, (err, decoded) => {
                                            res.should.have.status(403);
                                            done();
                                        })
                                    })
                            });
                    })
            });
    });

    it('it should return a task form another user to an ADMIN', (done) => {
        const user = getUser(1, USER)
        const admin = getUser(2, ADMIN)
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                chai.request(app)
                    .post('/api/v1/user')
                    .set('x-access-token', authenticatedToken)
                    .send(admin)
                    .end((err, res) => {
                        const adminToken = jwt.sign(res.body.data, AuthModel.secret)
                        const task = getTask()
                        chai.request(app)
                            .post('/api/v1/task')
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                chai.request(app)
                                    .get('/api/v1/task/' + res.body.data._id)
                                    .set('x-access-token', adminToken)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.have.a.property('data')
                                        res.body.data.should.be.a('object')
                                        res.body.data.should.have.a.property('notes').eql(task.notes)
                                        done();
                                    })
                            });
                    })
            });
    });

    it('it should allow USER to edit own task', (done) => {
        const user = getUser(1, USER)
        const admin = getUser(2, ADMIN)
            //create user
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                const task = getTask()
                    //create task
                chai.request(app)
                    .post('/api/v1/task')
                    .set('x-access-token', user1Token)
                    .send(task)
                    .end((err, res) => {
                        task.notes = "Edited notes"
                            //edit task
                        chai.request(app)
                            .put('/api/v1/task/' + res.body.data._id)
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.have.a.property('data')
                                res.body.data.should.be.a('object')
                                res.body.data.should.have.a.property('notes').eql("Edited notes")
                                done();
                            })
                    });
            });
    });

    it('it should return error if MANAGER edits USER task', (done) => {
        const user = getUser(1, USER)
        const manager = getUser(2, MANAGER)
            //create user
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                    //create manager
                chai.request(app)
                    .post('/api/v1/user')
                    .set('x-access-token', authenticatedToken)
                    .send(manager)
                    .end((err, res) => {
                        const managerToken = jwt.sign(res.body.data, AuthModel.secret)
                        const task = getTask()
                            // create user task
                        chai.request(app)
                            .post('/api/v1/task')
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                // edit task with manager's token
                                task.notes = "Edited notes"
                                chai.request(app)
                                    .put('/api/v1/task/' + res.body.data._id)
                                    .set('x-access-token', managerToken)
                                    .end((err, res) => {
                                        res.should.have.status(403);
                                        done();
                                    })
                            });
                    })
            });
    });

    it('it allow ADMIN to edit an USER task', (done) => {
        const user = getUser(1, USER)
        const admin = getUser(2, ADMIN)
            //create user
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                    //create admin
                chai.request(app)
                    .post('/api/v1/user')
                    .set('x-access-token', authenticatedToken)
                    .send(admin)
                    .end((err, res) => {
                        const adminToken = jwt.sign(res.body.data, AuthModel.secret)
                        const task = getTask()
                            //create task
                        chai.request(app)
                            .post('/api/v1/task')
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                task.notes = "Edited notes"
                                    //edit task
                                chai.request(app)
                                    .put('/api/v1/task/' + res.body.data._id)
                                    .set('x-access-token', adminToken)
                                    .send(task)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.have.a.property('data')
                                        res.body.data.should.be.a('object')
                                        res.body.data.should.have.a.property('notes').eql("Edited notes")
                                        done();
                                    })
                            });
                    })
            });
    });

    it('it should allow USER to delete own task', (done) => {
        const user = getUser(1, USER)
        const admin = getUser(2, ADMIN)
            //create user
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                const task = getTask()
                    //create task
                chai.request(app)
                    .post('/api/v1/task')
                    .set('x-access-token', user1Token)
                    .send(task)
                    .end((err, res) => {
                        //delete task
                        chai.request(app)
                            .delete('/api/v1/task/' + res.body.data._id)
                            .set('x-access-token', user1Token)
                            .end((err, res) => {
                                res.should.have.status(200);
                                done();
                            })
                    });
            });
    });

    it('it should return error if MANAGER deletes USER task', (done) => {
        const user = getUser(1, USER)
        const manager = getUser(2, MANAGER)
            //create user
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                    //create manager
                chai.request(app)
                    .post('/api/v1/user')
                    .set('x-access-token', authenticatedToken)
                    .send(manager)
                    .end((err, res) => {
                        const managerToken = jwt.sign(res.body.data, AuthModel.secret)
                        const task = getTask()
                            // create user task
                        chai.request(app)
                            .post('/api/v1/task')
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                // delete task with manager's token
                                task.notes = "Edited notes"
                                chai.request(app)
                                    .delete('/api/v1/task/' + res.body.data._id)
                                    .set('x-access-token', managerToken)
                                    .end((err, res) => {
                                        res.should.have.status(403);
                                        done();
                                    })
                            });
                    })
            });
    });

    it('it allow ADMIN to delete an USER task', (done) => {
        const user = getUser(1, USER)
        const admin = getUser(2, ADMIN)
            //create user
        chai.request(app)
            .post('/api/v1/user/signup')
            .send(user)
            .end((err, res) => {
                const user1Token = res.body.data.token
                    //create admin
                chai.request(app)
                    .post('/api/v1/user')
                    .set('x-access-token', authenticatedToken)
                    .send(admin)
                    .end((err, res) => {
                        const adminToken = jwt.sign(res.body.data, AuthModel.secret)
                        const task = getTask()
                            //create task
                        chai.request(app)
                            .post('/api/v1/task')
                            .set('x-access-token', user1Token)
                            .send(task)
                            .end((err, res) => {
                                //delete task with admin token
                                chai.request(app)
                                    .delete('/api/v1/task/' + res.body.data._id)
                                    .set('x-access-token', adminToken)
                                    .send(task)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        done();
                                    })
                            });
                    })
            });
    });

    //todo add tests to filter
    //add tests to export
});