import { useEffect } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getDialog, getMessages } from '../slice';
import { getUsers } from '../../users/slice';

import { Dialog } from '../../../models/dialog';
import { Message } from '../../../models/message';
import { User } from '../../../models/user';

import MessagesList from './MessagesList';
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
  }
}));

export type PrivateDialogProps = {
  id: string
};

export default function PrivateDialog({ id }: PrivateDialogProps) {
  const classes = useStyles();

  let dispatch = useDispatch();

  let dialog = useSelector((state: RootState) => {
    return state
      .messenger
      .dialogs
      .find((dialog: Dialog) => dialog.id === id);
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

  let user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!dialog) {
      dispatch(getDialog({ id }));
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
      .find((u: User) => u.id !== user!.id && dialog?.party?.includes(u.id));
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

  return (
    <Container maxWidth="lg" className={ classes.container }>
      <Paper variant='outlined' square aria-label="dialog-header" className={ classes.header }>
        <div className={ classes.avatarWrapper }><Avatar src={ party?.avatar } className={ classes.avatar } /></div>
        <div className={ classes.name }>{ party?.name }</div>
      </Paper>

      <MessagesList
        messages={ messages }
        total={ dialog?.messages_count! }
        onScrollUp={ onScrollUp }
      /> 

      <DialogForm user={ user! } url={ '/api/messenger/message/private' }  params={ { id: dialog?.id } } />
    </Container>
  );
};
