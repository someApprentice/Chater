import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';

import clsx from 'clsx';

import { useSelector } from 'react-redux';

import { RootState } from '../../../store';

import { User } from '../../../models/user';
import { Message } from '../../../models/message';

export type MessageProps = {
  message: Message,
  isFirstInGroup?: boolean,
  isLastInGroup?: boolean
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  wrapper: {
    'display': 'flex',
    paddingTop: 0,
    paddingBottom: 0
  },
  message: {
    display: 'flex',
    flexDirection: 'column-reverse',
    maxWidth: '85%',
  },
  avatar: {
    position: 'absolute',
    left: 5,
    width: '40px',
    height: '40px',
    minWidth: 'auto',
    '& img': {
      borderRadius: '50%',
      width: 'inherit',
      height: 'inherit'
    }
  },
  bubble: {
    backgroundColor: '#e3f2fd',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
    marginTop: '2px',
    marginBottom: '2px',
    marginLeft: '35px',
    padding: '6px'
  },
  content: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  isLastInGroup: {
    borderBottomLeftRadius: 0,
  },
  tail: {
    fill: '#e3f2fd',
    height: '20px',
    position: 'absolute',
    transform: 'translateY(1px)',
    width: '11px',
    marginTop: '-14px',
    left: '42px',
    right: 'auto'
  },
  isSent: {
    flexDirection: 'row-reverse',
    '& $avatar': {
      left: 'auto',
      right: 5
    },
    '& $bubble': {
      marginLeft: 0,
      marginRight: '35px'
    },
    '& $isLastInGroup': {
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: 0
    },
    '& $tail': {
      transform: 'translateY(1px) scaleX(-1)',
      left: 'auto',
      right: '42px'
    }
  }
}));

export default function Message(
  {
    message,
    isFirstInGroup = false,
    isLastInGroup = false
  }: MessageProps
) {
  const classes = useStyles();

  let user = useSelector((state: RootState) => state.auth.user);

  let author = useSelector((state: RootState) => (
    state
      .users
      .users
      .find((user: User) => user.id === message.author)
  ));

  return (
    <ListItem
      className={
        clsx(
          classes.wrapper,
          message.author === user?.id && classes.isSent
        )
      }
    >
      <div className={ classes.message }>
        {
          isLastInGroup
            ? <ListItemAvatar className={ classes.avatar }>
                <Avatar src={ author?.avatar } />
              </ListItemAvatar>
            : null
        }

        <div className={ clsx(classes.bubble, isLastInGroup && classes.isLastInGroup) }>
          <ListItemText
            primary={
              isFirstInGroup
                ? author ? author.name : "Unknown"
                : null
            }
            secondary={ message.content }
            className={ classes.content }
          />

          {
            isLastInGroup
              ? <svg viewBox="0 0 11 20" width="11" height="20" className={ classes.tail }>
                  <g transform="translate(9 -14)" fill="inherit" fillRule="evenodd">
                    <path d="M-6 16h6v17c-.193-2.84-.876-5.767-2.05-8.782-.904-2.325-2.446-4.485-4.625-6.48A1 1 0 01-6 16z" transform="matrix(1 0 0 -1 0 49)" id="corner-fill" fill="inherit"></path>
                  </g>
                </svg>
              : null
          }
        </div>
      </div>
    </ListItem>
  )
}
