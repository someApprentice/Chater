import { useRef, useState, useEffect } from 'react';

import { makeStyles, createStyles, useTheme, Theme } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';

import clsx from 'clsx';

import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';

import { RootState } from '../../../store';

import { Message } from '../../../models/message';

import MessageComponent from './Message';

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
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: `calc(var(--vh, 1vh) * 100 - 64px - 64.88px - 80px)`, // screen size - header size - dialog header size - form size
    [theme.breakpoints.up('lg')]: {
      height: `calc(var(--vh, 1vh) * 100 - 64px - 64.88px - 112px)`, // screen size - header size - dialog header size - form size
    }
  },
  isPending: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
  },
  messages: {
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

export type MessagesListProps = {
  messages: Message[],
  total: number,
  onScrollUp?: (() => void) | (() => Promise<void>)
};

export default function MessagesList({
  messages,
  total,
  onScrollUp = () => {}
}: MessagesListProps) {
  const classes = useStyles();

  const ref = useRef<HTMLUListElement>(null);

  let [ isScrolledDown, setIsScrolledDown ] = useState(false);
    
  let isPending = useSelector((state: RootState) => state.messenger.isMessagesPending);

  let user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (ref.current && !!messages.length) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [!!messages.length, !!ref.current]);

  useEffect(() => {
    if (ref.current && isScrolledDown) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages.length]);

  async function onScroll() {
    // is scrolled down?
    if (
      ref.current &&
      ref.current.scrollTop + ref.current.offsetHeight === ref.current.scrollHeight
    ) {
      setIsScrolledDown(true);
    } else {
      setIsScrolledDown(false);
    }

    // is scroll above than 1/3 of scroller height?
    if (
      ref.current &&
      ref.current.scrollTop < ref.current.scrollHeight / 3
    ) {
      if (isPending || messages.length === total) {
        return;
      }

      let firstMessageBeforeRequest = ref.current!.firstElementChild;

      await onScrollUp();

      if (ref.current!.scrollTop === 0)
        firstMessageBeforeRequest!.scrollIntoView();
    }
  }

  return (
    <div
      aria-label="messages-list"
      className={ clsx(
        classes.wrapper,
        isPending && classes.isPending
      )}
    >
      {
        isPending && !messages.length
          ? <div className={ classes.spinner }><CircularProgress /></div>
          : <>
            <List ref={ ref } onScroll={ onScroll } className={ classes.messages }>
              {
                isPending && !!messages.length
                  ? <div className={ classes.spinner }><CircularProgress /></div>
                  : null
              }

              {
                messages.map((message: Message, i: number, arr: Message[]) => (
                  <MessageComponent
                    key={ message.id }
                    message={ message }
                    isFirstInGroup={ i == 0 || message.author != arr[i - 1].author }
                    isLastInGroup={ i == arr.length - 1 || message.author != arr[i + 1].author }
                  />
                ))
              }
            </List>
          </>
      }
    </div>
  )
}
