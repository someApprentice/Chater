import { useRef, useState, useEffect } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';

import clsx from 'clsx';

import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';

import { RootState } from '../../../store';

import { Message } from '../../../models/message';

import MessageComponent from './Message';

const useStyles = makeStyles((theme: Theme) => createStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flex: '1 1 auto',
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
    [theme.breakpoints.up('lg')]: {
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
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

  const ref = useRef<HTMLDivElement>(null);

  let [ isScrolledDown, setIsScrolledDown ] = useState(false);
    
  let isPending = useSelector((state: RootState) => state.messenger.isMessagesPending);

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
      ref={ ref } onScroll={ onScroll } 
      className={ clsx(
        classes.wrapper,
        isPending && classes.isPending
      )}
    >
      {
        isPending && !messages.length
          ? <div className={ classes.spinner }><CircularProgress /></div>
          : <>
              <List className={ classes.messages }>
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
