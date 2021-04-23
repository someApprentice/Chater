import { ComponentType, useState, useEffect, useRef } from 'react';

import { AsyncThunk, AsyncThunkAction } from '@reduxjs/toolkit';

import { useParams } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getDialog, getMessages } from '../slice';

import { Dialog } from '../../../models/dialog';
import { Message } from '../../../models/message';

export type Props = {
  id: string
};

export type DialogProps = {
  dialog?: Dialog,
  messages: Message[],
  isMessagesPending: boolean,
  onScroll: () => void
};

export default function withDialogData<T>(Component: ComponentType<DialogProps & T>) {
  return function({ id, ...props }: Props & T) {
    let dispatch = useDispatch();

    const listRef = useRef<HTMLUListElement>(null);

    let [ isScrolledDown, setIsScrolledDown ] = useState(false);

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

    let isMessagesPending = useSelector((state: RootState) => state.messenger.isMessagesPending);

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

    useEffect(() => {
      if (listRef.current && !!messages.length) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, [!!messages.length, !!listRef.current]);

    useEffect(() => {
      if (listRef.current && isScrolledDown) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, [messages.length]);

    async function onScrollUp() {
      if (isMessagesPending || messages.length === dialog?.messages_count) {
        return;
      }

      let id = dialog!.id;

      let date = messages[0].date;

      let firstMessageBeforeRequest = listRef.current!.firstElementChild;

      await dispatch(getMessages({ id, date }));

      if (listRef.current!.scrollTop === 0)
        firstMessageBeforeRequest!.scrollIntoView();
    }

    function onScrollDown() { }

    function onScroll() {
      // is scrolled down?
      if (
        listRef.current &&
        listRef.current.scrollTop + listRef.current.offsetHeight === listRef.current.scrollHeight
      ) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }

      // is scroll above than 1/3 of scroller height?
      if (
        listRef.current &&
        listRef.current.scrollTop < listRef.current.scrollHeight / 3
      ) {
        onScrollUp();
      }

      // is scroll below than 2/3 of scroller height?
      if (
        listRef.current &&
        listRef.current.scrollTop + listRef.current.offsetHeight > listRef.current.scrollHeight / 3 * 2
      ) {
        onScrollDown();
      }
    }

    return <Component
      dialog={ dialog }
      messages={ messages }
      isMessagesPending={ isMessagesPending }
      onScroll={ onScroll } 
      ref={ listRef }
      { ...props as unknown as T } 
    />;
  }
}
