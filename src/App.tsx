import React, { useState, useEffect } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List'
import ListItemText from '@material-ui/core/ListItemText';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';

import clsx from 'clsx';

import { makeStyles, createStyles, useTheme, Theme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Helmet } from 'react-helmet';

import { Switch, Route, Link as RouterLink, RouteComponentProps } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from './store';
import { pushDialog, pushMessage, getPublicDialog, getPrivateDialogs } from './features/messenger/slice';
import { getUsers } from './features/users/slice';

import { UnauthenticatedRoute, AuthenticatedRoute, RouteWithStatus } from './utils/router';

import socket from './services/socket';

import { Dialog } from './models/dialog';
import { Message } from './models/message';

import SignIn from './features/auth/compenents/SignIn';
import SignUp from './features/auth/compenents/SignUp';
import LogOut from './features/auth/compenents/LogOut';

import DialogComponent from './features/messenger/components/Dialog';
import PublicDialog from './features/messenger/components/PublicDialog';
import PrivateDialog from './features/messenger/components/PrivateDialog';

import './App.css';


const TITLE = process.env.TITLE;

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  title: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 12,
  },
  menuButtonHidden: {
    display: 'none',
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down('lg')]: {
      position: 'absolute',
    },
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(9),
    [theme.breakpoints.down('lg')]: {
      width: 0,
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
  },
}));

export default function App() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('lg'));
  const classes = useStyles();

  let dispatch = useDispatch();

  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  let user = useSelector((state: RootState) => state.auth.user);

  let publicDialog = useSelector((state: RootState) => {
    return state
      .messenger
      .dialogs
      .find((dialog: Dialog) => dialog.type === 'public');
  });

  let privateDialogs = useSelector((state: RootState) => {
    return state
      .messenger
      .dialogs
      .filter((dialog: Dialog) => dialog.type === 'private')
      .slice()
      .sort((a: Dialog, b: Dialog) => b.updated_at - a.updated_at);
  });

  let privateDialogsPartyIds = privateDialogs.reduce((acc, cur: Dialog) => {
    let id = cur.party!.find((id: string) => id !== user?.id)!;

    acc.push(id);

    return acc;
  }, [] as string[]);

  let [ isOpen, setIsOpen ] = useState(!matches);

  useEffect(() => {
    setIsOpen(!matches);
  }, [matches]);

  useEffect(() => {
    if (!publicDialog) {
      dispatch(getPublicDialog());
    }
  }, [!!publicDialog]);

  useEffect(() => {
    if (isAuthenticated && !privateDialogs.length) {
      dispatch(getPrivateDialogs());
    }
  }, [isAuthenticated && !privateDialogs.length]);

  useEffect(() => {
    dispatch(getUsers({ ids: privateDialogsPartyIds }));
  }, [JSON.stringify(privateDialogsPartyIds)]);

  useEffect(() => {
    socket.connect();

    socket.on('public dialog update', onPublicDialog);
    socket.on('public message', onPublicMessage);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      socket.emit('join', { hash: user!.hash! });

      socket.on('private dialog update', onPrivateDialog);
      socket.on('private message', onPrivateMessage);
    }

    if (!isAuthenticated) {
      socket.off('private dialog update', onPrivateDialog);
      socket.off('private message', onPrivateMessage);
    }
  }, [isAuthenticated]);

  function onPublicDialog(dialog: Dialog) {
    dispatch(pushDialog(dialog));
  }

  function onPrivateDialog(dialog: Dialog) {
    dispatch(pushDialog(dialog));
  }

  function onPublicMessage(message: Message) {
    dispatch(pushMessage(message));
  }

  function onPrivateMessage(message: Message) {
    dispatch(pushMessage(message));
  }

  function handleDrawerOpen() {
    setIsOpen(true);
  }

  function handleDrawerClose() {
    setIsOpen(false);
  }

  return (
    <div className={ classes.root }>
      <Helmet>
        <title>{ TITLE }</title>
      </Helmet>

      <CssBaseline />

      <AppBar
        position="absolute"
        className={ clsx(classes.appBar, (isAuthenticated && isOpen) && classes.appBarShift) }
      >
        <Toolbar>
          { isAuthenticated
            ? <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={ handleDrawerOpen }
                className={ clsx(classes.menuButton, isOpen && classes.menuButtonHidden) }
              >
                <MenuIcon />
              </IconButton>
            : null
          }

          <Link
            component={ RouterLink }
            to="/" color="inherit"
            className={ classes.title }
          >
            <Typography variant="h6" className={ classes.title }>Chater</Typography>
          </Link>

          { !isAuthenticated
            ? <Link
                component={ RouterLink }
                to="/login"
                color="inherit"
              >
                <Button color="inherit">Login</Button>
              </Link>
            : null 
          }
          
          { !isAuthenticated
            ? <Link
                component={ RouterLink }
                to="/registration"
                color="inherit"
              >
                <Button color="inherit">Registration</Button>
              </Link>
            : null
          }

          { isAuthenticated
            ? <LogOut />
            :null
          }
        </Toolbar>
      </AppBar>

      { isAuthenticated
        ? <Drawer
            variant="permanent"
            classes={{
              paper: clsx(classes.drawerPaper, !isOpen && classes.drawerPaperClose),
            }}
            open={ isOpen }
          >
            <div className={ classes.toolbarIcon }>
              <IconButton onClick={ handleDrawerClose }>
                <ChevronLeftIcon />
              </IconButton>
            </div>

            <Divider />

            <List>
              <Link
                component={ RouterLink }
                to="/"
                color="inherit"
              >
                <ListItemText primary="Public Dialog" />
              </Link>
            </List>

            <Divider />

            <List>
              {
                privateDialogs.map((dialog: Dialog) => (
                  <Link
                    key={ dialog.id }
                    component={ RouterLink }
                    to={ `/dialog/${ dialog.id }` }
                    color="inherit"
                  >
                    <DialogComponent dialog={ dialog } />
                  </Link>
                ))
              }
            </List>
          </Drawer>
        : null
      }

      <main className={ classes.content  }>
        <div className={ classes.appBarSpacer } /> 

        <Switch>
          <Route exact path="/">
            <PublicDialog id={ publicDialog!.id } />
          </Route>

          <AuthenticatedRoute exact path="/dialog/:id" render={ (props: RouteComponentProps) => {
            let { id } = props.match.params as { id: string };

            return <PrivateDialog id={ id } />
          } }/>

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
      </main>
    </div>
  );
}
