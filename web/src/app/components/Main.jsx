var React = require('react')
import {connect} from 'react-redux';
import Nav from 'Nav';
import Error from 'Error';
import Login from 'Login';
import Signup from 'Signup';
import TasksMain from 'TasksMain';
import TaskExport from 'TaskExport';
import ProfileMain from 'ProfileMain';
import UsersMain from 'UsersMain';
import {hideError, userAuthenticated, verifyUserAuthentication, resetRedirect} from 'actions';
import {HashRouter, Route, Redirect} from 'react-router-dom'
class Main extends React.Component {
    constructor(props) {
        super(props)
        this.toggleError = this
            .toggleError
            .bind(this);
        this.verifyUserAuthentication = this
            .verifyUserAuthentication
            .bind(this);
        this.redirect = this
            .redirect
            .bind(this);
    }
    verifyUserAuthentication() {
        this
            .props
            .dispatch(verifyUserAuthentication(this.props.user.token))
    }
    redirect() {
        const redirect = this.props.redirect;
        if ((redirect || '') != '') {
            return <Redirect to={redirect}/>
        }
    }
    componentDidUpdate() {
        const redirect = this.props.redirect;
        if ((redirect || '') != '') {
            this
                .props
                .dispatch(resetRedirect())
        }
    }
    componentWillMount() {
        this.verifyUserAuthentication();
    }
    toggleError() {
        const error = this.props.error
        if (error) {
            if (error.name == 'ValidationError') {
                var errorsArray = [];
                var errors = error.errors;
                for (const i in errors) {
                    if (typeof errors == 'object') {
                        errorsArray.push(<Error key={i} message={errors[i].message}/>)
                    }
                }
                return errorsArray;
            } else if (typeof error.detail == 'string') {
                return <Error message={error.detail}/>;
            }
        }
        return ''
    }
    render() {
        return (
            <HashRouter>
                <div>
                    <Nav/> {this.redirect()}
                    {this.toggleError()}
                    <Route exact path="/" component={Login}/>
                    <Route path="/signup" component={Signup}/>
                    <Route path="/profile" component={ProfileMain}/>
                    <Route path="/tasks" component={TasksMain}/> {/*<Route exact path="/tasks/all" component={TasksMain}/>*/}
                    <Route path="/users" component={UsersMain}/>
                    <Route path="/export" component={TaskExport}/>
                </div>
            </HashRouter>
        )
    }
}
module.exports = connect((state) => {
    return {error: state.app.error, redirect: state.app.redirect, user: state.user}
})(Main);