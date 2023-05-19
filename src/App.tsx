import { useState, useEffect } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import { makeStyles, createStyles, useTheme, Theme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Helmet } from 'react-helmet';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from './store';
import { pushDialog, pushMessage } from './features/messenger/slice';
import { push as pushUser } from './features/users/slice';

import socket from './services/socket';

import { Dialog } from './models/dialog';
import { Message } from './models/message';

import Header from './features/body/Header';
import Dialogs from './features/messenger/components/Dialogs';
import Main from './features/body/Main';

import './App.css';


const TITLE = process.env.TITLE;

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
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

  let [ isDialogsOpen, setIsDialogsOpen ] = useState(!matches);

  useEffect(() => {
    setIsDialogsOpen(!matches);
  }, [matches]);

  useEffect(() => {
    if (!!user) {
      dispatch(pushUser(user));
    }
  }, [!!user]);

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

  function handleDialogsOpen() {
    setIsDialogsOpen(true);
  }

  function handleDialogsClose() {
    setIsDialogsOpen(false);
  }

  return (
    <div className={ classes.root }>
      <Helmet>
        <title>{ TITLE }</title>
      </Helmet>

      <CssBaseline />

      <Header isDialogsOpen={ isDialogsOpen } handleDialogsOpen={ handleDialogsOpen } />

      { isAuthenticated
        ? <Dialogs isOpen={ isDialogsOpen } handleDialogsClose={ handleDialogsClose } />
        : null
      }

      <Main />
    </div>
  );
}
