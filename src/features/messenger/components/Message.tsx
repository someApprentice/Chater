import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import ListItemText from '@material-ui/core/ListItemText';

import clsx from 'clsx';

import { useSelector } from 'react-redux';

import { RootState } from '../../../store';

import { User } from '../../../models/user';
import { Message } from '../../../models/message';

export type MessageProps = {
  message: Message,
  isSent?: boolean,
  isLastInGroup?: boolean
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  wrapper: {
    'display': 'flex'
  },
  message: {
    maxWidth: '85%',
    backgroundColor: '#e3f2fd',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
    marginTop: '2px',
    marginBottom: '2px',
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
    left: '7px',
    right: 'auto'
  },
  isSent: {
    flexDirection: 'row-reverse',
    '& $isLastInGroup': {
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: 0
    },
    '& $tail': {
      transform: 'translateY(1px) scaleX(-1)',
      left: 'auto',
      right: '7px'
    }
  }
}));

export default function Message(
  {
    message,
    isSent = false,
    isLastInGroup = false
  }: MessageProps
) {
  const classes = useStyles();

  let author = useSelector((state: RootState) => state.users.users.find((user: User) => user.id === message.author));

  return (
    <div
      className={
        clsx(
          classes.wrapper,
          isSent && classes.isSent
        )
      }
    >
      <div className={ clsx(classes.message, isLastInGroup && classes.isLastInGroup) }>
        <ListItemText
          primary={ author ? author.name : "Unknown" }
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
  )
}
