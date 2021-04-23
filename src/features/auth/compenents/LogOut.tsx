import React, { useEffect, FormEvent } from 'react';

import Button from '@material-ui/core/Button';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useHistory } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { logout } from '../slice';

import socket from '../../../services/socket';

export default function LogOut() {
  let history = useHistory();

  let dispatch = useDispatch();

  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  let user = useSelector((state: RootState) => state.auth.user);
  let isPending = useSelector((state: RootState) => state.auth.isPending);
  let error = useSelector((state: RootState) => state.auth.error);

  useEffect(() => {
    if (!isPending && !error && isAuthenticated) {
      history.replace('/');
    }

    if (!isPending && !!error) {
      // error
    }
  }, [isAuthenticated, isPending, error]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    let hash = user!.hash!

    await dispatch(logout());

    socket.emit('leave', { hash }, (ack: any) => {
      // ack
    })
  };

  return (
    <form onSubmit={ onSubmit }>
      <Button type="submit" color='inherit'>
        { isPending ? <CircularProgress color="inherit"/> : <PowerSettingsNewIcon /> }
      </Button>
    </form>
  );
}
