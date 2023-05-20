import { useEffect } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import clsx from 'clsx';

import Container from '@material-ui/core/Container';
import PublicIcon from '@material-ui/icons/Public';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';

import { Link as RouterLink } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getPublicDialog, getMessages } from '../slice';
import { getUsers } from '../../users/slice';

import { Dialog } from '../../../models/dialog';
import { Message } from '../../../models/message';
import { User } from '../../../models/user';

import MessagesList from './MessagesList';
import DialogForm from './DialogForm';

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 64px)', // 100% - body header size
    [theme.breakpoints.down('lg')]: {
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    }
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 1 auto',
    padding: theme.spacing(2),
    fontSize: '1rem'
  },
  avatar: {
    minWidth: '56px'
  },
  name: {
  },
  authenticationNote: {
    textAlign: 'center',
    padding: theme.spacing(2),
  }
}));

export default function PublicDialog() {
  const classes = useStyles();

  let dispatch = useDispatch();

  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  let user = useSelector((state: RootState) => state.auth.user);

  let dialog = useSelector((state: RootState) => {
    return state
      .messenger
      .dialogs
      .find((dialog: Dialog) => dialog.type == 'public');
  });

  let messages = useSelector((state: RootState) => {
    return state
      .messenger
      .messages
      .filter((message: Message) => {
        return message.dialog === dialog?.id
      })
      .slice()
      .sort((a: Message, b: Message) => a.date - b.date);
  });

  useEffect(() => {
    if (!dialog) {
      dispatch(getPublicDialog());
    }
  }, [!!dialog]);

  useEffect(() => {
    if (dialog?.id && !messages.length) {
      let id = dialog.id;

      dispatch(getMessages({ id }));
    }
  }, [dialog?.id]);

  let party = useSelector((state: RootState) => {
    return state
      .users
      .users
      .find((u: User) => u.id !== user?.id && dialog?.party?.includes(u.id));
  });

  useEffect(() => {
    if (!!dialog && !party) {
      dispatch(getUsers({ ids: dialog!.party! }));
    }
  }, [!!dialog && JSON.stringify(dialog!.party!)]);

  async function onScrollUp() {
    let id = dialog!.id;

    let date = messages[0].date;

    await dispatch(getMessages({ id, date }));
  }

  let authorIds = messages.reduce((acc, cur: Message) => {
    if (acc.includes(cur.author)) {
      return acc;
    }

    acc.push(cur.author);

    return acc;
  }, [] as string[]);

  useEffect(() => {
    if (!!authorIds.length) {
      dispatch(getUsers({ ids: authorIds }));
    }
  }, [JSON.stringify(authorIds)]);

  return (
    <Container maxWidth="lg" className={ classes.container }>
      <Paper variant='outlined' square aria-label="dialog-header" className={ classes.header }>
        <div className={ classes.avatar }><PublicIcon color='action' /></div>
        <div className={ classes.name }>Public</div>
      </Paper>

      <MessagesList
        messages={ messages }
        total={ dialog?.messages_count! }
        onScrollUp={ onScrollUp }
      /> 

      {
        isAuthenticated
          ? <DialogForm dialog={ dialog! } />
          : <div className={ clsx(classes.authenticationNote) }>
            Please <Link component={ RouterLink } to="/login">Log In</Link> or <Link component={ RouterLink } to="/registration">Registrate</Link> to send a message.
          </div>
      }
    </Container>
  );
}
