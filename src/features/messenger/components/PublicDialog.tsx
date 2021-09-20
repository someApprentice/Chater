import { forwardRef, useEffect, PropsWithChildren } from 'react';

import { makeStyles, createStyles, useTheme, Theme } from '@material-ui/core/styles';

import clsx from 'clsx';

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';

import { Link as RouterLink } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getUsers } from '../../users/slice';

import { Message } from '../../../models/message';

import withDialogData, { DialogProps } from './DialogHOC';

import MessageComponent from './Message';
import DialogForm from './DialogForm';

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    // paddingTop: theme.spacing(4),
    // paddingBottom: theme.spacing(4),
    [theme.breakpoints.down('lg')]: {
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    }
  },
  header: {
    padding: theme.spacing(2),
  },
  messagesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: `calc(var(--vh, 1vh) * 100 - 64px - 52px - 80px)`, // screen size - header size - dialog header size - form size
    [theme.breakpoints.up('lg')]: {
      height: `calc(var(--vh, 1vh) * 100 - 64px - 52px - 112px)`, // screen size - header size - dialog header size - form size
    }
  },
  isMessagesPending: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
  },
  messageList: {
    minHeight: 0,
    margin: 0,
    padding: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    overflow: 'auto',
  },
  messageForm: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(2),
    }
  },
  sendButtonWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sendButton: {
    margin: '6px 0',
  },
  sendButtonText: {
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  },
  authenticationNote: {
    textAlign: 'center',
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(2),
    }
  }
}));

const PublicDialog = forwardRef<HTMLUListElement, PropsWithChildren<DialogProps>>(function ({ dialog, messages, isMessagesPending, onScroll }: DialogProps, ref) {
  const classes = useStyles();

  let dispatch = useDispatch();

  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  let user = useSelector((state: RootState) => state.auth.user);

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
      <Paper elevation={ 3 } square className={ classes.header }>Public</Paper>

      <div className={ clsx(classes.messagesWrapper, isMessagesPending && classes.isMessagesPending) }>
        { isMessagesPending && !messages.length
          ? <div className={ classes.spinner }><CircularProgress /></div>
          : <>
              <List ref={ ref } onScroll={ onScroll } className={ classes.messageList }>
                { isMessagesPending && !!messages.length ? <div className={ classes.spinner }><CircularProgress /></div> : null }

                { messages.map((message: Message) => (
                  <MessageComponent key={ message.id } message={ message } />
                )) }
              </List>
            </>
        }
      </div>

      { isAuthenticated
        ? <DialogForm user={ user! } url={ '/api/messenger/message/public' } />
        : <div className={ clsx(classes.authenticationNote) }>
            Please <Link component={ RouterLink } to="/login">Log In</Link> or <Link component={ RouterLink } to="/registration">Registrate</Link> to send a message.
          </div>
      }
    </Container>
  );
});

export default withDialogData(
  PublicDialog,
);
