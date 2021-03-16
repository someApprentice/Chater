import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { Helmet } from 'react-helmet';

import { Switch, Route, Link as RouterLink } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { RootState } from './store';

import { UnauthenticatedRoute, RouteWithStatus } from './utils/router';

import SignIn from './features/auth/compenents/SignIn';
import SignUp from './features/auth/compenents/SignUp';
import LogOut from './features/auth/compenents/LogOut';

import './App.css';


const TITLE = process.env.TITLE;

const useStyles = makeStyles((theme: Theme) => createStyles({
  title: {
    flexGrow: 1
  }
}));

export default function App() {
  const classes = useStyles();

  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  let user = useSelector((state: RootState) => state.auth.user);

  return (
    <>
      <Helmet>
        <title>{ TITLE }</title>
      </Helmet>

      <CssBaseline />

      <AppBar position="static">
        <Toolbar>
          <Link component={ RouterLink } to="/" color="inherit" className={ classes.title }><Typography variant="h6" className={ classes.title }>Chater</Typography></Link> 

          { !isAuthenticated
            ? <Link component={ RouterLink } to="/login" color="inherit"><Button color="inherit">Login</Button></Link>
            : null 
          }
          
          { !isAuthenticated
            ? <Link component={ RouterLink } to="/registration" color="inherit"><Button color="inherit">Registration</Button></Link>
            : null
          }

          { isAuthenticated
            ? <LogOut />
            :null
          }
        </Toolbar>
      </AppBar>

      { isAuthenticated ? `Welcome, ${ user!.name }` : "You're not logged in" }

      <Switch>
        <Route exact path="/">
        </Route>

        <UnauthenticatedRoute path='/login'>
          <SignIn />
        </UnauthenticatedRoute>

        <UnauthenticatedRoute path='/registration'>
          <SignUp />
        </UnauthenticatedRoute>

        <RouteWithStatus status={ 404 }>
          <h2>404 Not Found</h2>
        </RouteWithStatus>
      </Switch>
    </>
  );
}
