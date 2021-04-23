import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import ListItemText from '@material-ui/core/ListItemText';

import { useSelector } from 'react-redux';

import { RootState } from '../../../store';

import { User } from '../../../models/user';
import { Message } from '../../../models/message';

export type MessageProps = {
  message: Message
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  message: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}));

export default function Message({ message }: MessageProps) {
  const classes = useStyles();

  let author = useSelector((state: RootState) => state.users.users.find((user: User) => user.id === message.author));

  return (
    <ListItemText
      primary={ author ? author.name : "Unknown" }
      secondary={ message.content }
      className={ classes.message }
    />
  )
}
