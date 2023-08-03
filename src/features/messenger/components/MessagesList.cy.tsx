import React, { forwardRef, useEffect, PropsWithChildren } from 'react';

import { configureStore, nanoid } from '@reduxjs/toolkit';

import { useSelector, useDispatch } from 'react-redux';
import { Provider } from 'react-redux';

import { RootState } from '../../../store';

import authReducer from '../../auth/slice';
import usersReducer from '../../users/slice';
import messengerReducer, { getMessages, pushMessage } from '../slice';

import MessagesList from './MessagesList';

import { User } from '../../../models/user';
import { Dialog } from '../../../models/dialog';
import { Message } from '../../../models/message';

let user: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  avatar: 'data:image/png;base64,avatar=='
};

let dialog: Dialog = {
  id: nanoid(),
  type: 'public',
  updated_at: (new Date()).getTime() / 1000,
  messages_count: 0
};

let dialogs = [ dialog ];

let m: Message[] = [];

for (let i = 0; i < 100; i++) {
  let date = new Date();
  date = new Date(date.setDate(date.getDate() - 1));
  date = new Date(date.setHours(date.getHours() - 1));
  date = new Date(date.setSeconds(date.getSeconds() + i));

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor(date.getTime() / 1000),
    content: `${i} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
  } as Message;

  m.push(message);

  dialog.messages_count++;
}

function App() {
  let dispatch = useDispatch();

  let d = dialog;

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

  async function onScrollUp() {
    let id = dialog!.id;

    let date = messages[0].date;

    await dispatch(getMessages({ id, date }));
  }

  return (
    <>
      <h1>Chater</h1>

      <MessagesList
        messages={ messages }
        total={ d.messages_count }
        onScrollUp={ onScrollUp }
      />
    </>
  );
}

let store: ReturnType<typeof configureStore>;

beforeEach(() => {
  cy.intercept('GET', '/api/messenger/messages*', (req) => {
    let id = req.query.id;
    let date = req.query.date;

    if (!id)
      req.reply(400, 'Bad Request');

    let d = dialogs.find(dialog => dialog.id == id);

    if (!d)
      req.reply(404, 'Dialog Not Found');

    let messages = m
      .filter(message => {
        if (date)
          return message.dialog === d!.id && message.date < date;

        return message.dialog === d!.id;
      })
      .slice(-20);

      req.reply(messages);
  });

  store = configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,
      messenger: messengerReducer
    },
    preloadedState: {
      users: {
        users: [ user ],
        isPending: false
      },
      messenger: {
        dialogs: [],
        messages: m.slice(-20),
        isDialogPending: false,
        isDialogsPending: false,
        isMessagesPending: false,
      }
    }
  });

  // @ts-ignore
  window.store = store;
});

it('Dialog rendering', () => {
  cy.mount(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  cy.get('[aria-label=messages-list]').should('exist');
});

it('automatically scrolls down on start-up', () => {
  cy.mount(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  cy.get('[class*="messages"] [class*="message"]').its('length').should('eq', 20);

  cy.get('[aria-label=messages-list]').then(el => {
    let e  = el.get(0);

    expect(e.scrollTop).to.eq(e.scrollHeight - e.offsetHeight);
  });
});

it('automatically scrolls down on a new message', () => {
  cy.mount(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  cy.get('[class*="messages"] [class*="message"]').its('length').should('eq', 20);

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor((new Date()).getTime() / 1000),
    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium"
  } as Message;

  cy.window().its('store').invoke('dispatch', pushMessage(message));

  cy.get('[class*="messages"]').should('contain', message.content);
  
  cy.get('[aria-label=messages-list]').then(el => {
    let e  = el.get(0);

    expect(e.scrollTop).to.eq(e.scrollHeight - e.offsetHeight);
  });
});

it('not scrolls down on a new message when overflow is scrolled up', () => {
  cy.mount(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  cy.get('[class*="messages"] [class*="message"]').its('length').should('eq', 20);

  cy.get('[aria-label=messages-list]').scrollTo('0%', '80%');

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor((new Date()).getTime() / 1000),
    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium"
  } as Message;

  cy.window().its('store').invoke('dispatch', pushMessage(message));

  cy.get('[class*="messages"]').should('contain', message.content);
  
  cy.get('[aria-label=messages-list]').then(el => {
    let e  = el.get(0);

    expect(e.scrollTop).to.not.eq(e.scrollHeight - e.offsetHeight);
  });
});

it('rendering an old messages on scroll up', () => {
  cy.mount(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  cy.get('[class*="messages"] [class*="message"]').its('length').should('eq', 20);

  cy.get('[aria-label=messages-list]').scrollTo('0%', '30%');

  cy.get('[class*="messages"] [class*="message"]').its('length').should('eq', 40);
});
