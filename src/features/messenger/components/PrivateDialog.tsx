import { forwardRef, useEffect, PropsWithChildren } from 'react';

import { makeStyles, createStyles, useTheme, Theme } from '@material-ui/core/styles';

import clsx from 'clsx';

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getUsers } from '../../users/slice';

import { User } from '../../../models/user';
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
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    fontSize: '1rem'
  },
  avatarWrapper: {
    minWidth: '56px'
  },
  avatar: {
    width: '30px',
    height: '30px'
  },
  name: {
  },
  messagesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: `calc(var(--vh, 1vh) * 100 - 64px - 64.88px - 80px)`, // screen size - header size - dialog header size - form size
    [theme.breakpoints.up('lg')]: {
      height: `calc(var(--vh, 1vh) * 100 - 64px - 64.88px - 112px)`, // screen size - header size - dialog header size - form size
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
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      height: 0,
      opacity: 0,
      width: '0.375rem',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.2)',
      borderRadius: '10px',
      maxHeight: '12.5rem',
      minHeight: '5rem',
      opacity: 1,
    },
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(2),
    }
  }
}));

const PrivateDialog = forwardRef<HTMLUListElement, PropsWithChildren<DialogProps>>(function ({ dialog, messages, isMessagesPending, onScroll }: DialogProps, ref) {
  const classes = useStyles();

  let dispatch = useDispatch();

  let user = useSelector((state: RootState) => state.auth.user);

  let party = useSelector((state: RootState) => {
    return state
      .users
      .users
      .find((u: User) => u.id !== user!.id && dialog?.party?.includes(u.id));
  });

  useEffect(() => {
    if (!!dialog && !party) {
      dispatch(getUsers({ ids: dialog!.party! }));
    }
  }, [!!dialog && JSON.stringify(dialog!.party!)]);

  return (
    <Container maxWidth="lg" className={ classes.container }>
      <Paper variant='outlined' square className={ classes.header }>
        <div className={ classes.avatarWrapper }><Avatar src={ party?.avatar } className={ classes.avatar } /></div>
        <div className={ classes.name }>{ party?.name }</div>
      </Paper>

      <div className={ clsx(classes.messagesWrapper, isMessagesPending && classes.isMessagesPending) }>
        {
          isMessagesPending && !messages.length
            ? <div className={ classes.spinner }><CircularProgress /></div>
            : <>
                <List ref={ ref } onScroll={ onScroll } className={ classes.messageList }>
                  {
                    isMessagesPending && !!messages.length
                      ? <div className={ classes.spinner }><CircularProgress /></div>
                      : null
                  }

                  {
                    messages.map((message: Message, i: number, arr: Message[]) => (
                      <MessageComponent
                        key={ message.id }
                        message={ message }
                        isFirst={ i == 0 || message.author != arr[i - 1].author }
                        isLast={ i == arr.length - 1 || message.author != arr[i + 1].author }
                        isSent={ message.author == user!.id  }
                      />
                    ))
                  }
                </List>
              </>
        }
      </div>

      <DialogForm user={ user! } url={ '/api/messenger/message/private' }  params={ { id: dialog?.id } } />
    </Container>
  );
});

export default withDialogData(
  PrivateDialog,
);
