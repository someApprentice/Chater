import React, { forwardRef, useEffect, PropsWithChildren } from 'react';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import messengerReducer, { pushMessage } from '../slice';

import withDialogData, { DialogProps } from './DialogHOC';

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

const Dialog = withDialogData(forwardRef<HTMLUListElement, PropsWithChildren<DialogProps>>(
  function ({ dialog, messages, isMessagesPending, onScroll }: DialogProps, ref) {

    return (
      <>
        <h2>Dialog</h2>

        <ul className="messages" ref={ ref } onScroll={ onScroll } style={ { height: '300px', overflow: 'auto' } }>
          { messages.map((message: Message) => (
            <li className="message" key={ message.id }>{ message.content }</li>
          )) }
        </ul>
      </>
    );
  }
));

function App() {
  let d = dialog;

  return (
    <>
      <h1>Chater</h1>

      <Dialog id={ d.id } />
    </>
  );
}

let store: ReturnType<typeof configureStore>;

beforeEach(() => {
  cy.intercept('GET', '/api/messenger/dialog*', (req) => {
    let id = req.query.id; 

    if (!id)
      req.reply(400, 'Bad Request');

    let d = dialogs.find(dialog => dialog.id == id);

    if (!d)
      req.reply(404, 'Dialog Not Found');

    req.reply(d!);
  });

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
      messenger: messengerReducer
    },
    preloadedState: {
      messenger: {
        dialogs: [],
        messages: [],
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

  cy.get('h2').should('have.text', 'Dialog');
});

it('automatically scrolls down with a large number of messages', () => {
  cy.mount(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  cy.get('.message').its('length').should('eq', 20);

  cy.get('.messages').then(el => {
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

  cy.get('.message').its('length').should('eq', 20);

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor((new Date()).getTime() / 1000),
    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium"
  } as Message;

  cy.window().its('store').invoke('dispatch', pushMessage(message));

  cy.get('.messages').should('contain', message.content);
  
  cy.get('.messages').then(el => {
    let e  = el.get(0);

    expect(e.scrollTop).to.eq(e.scrollHeight - e.offsetHeight);
  });
});

it('not scrolls down on a new message', () => {
  cy.mount(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  cy.get('.message').its('length').should('eq', 20);

  cy.get('.messages').scrollTo('0%', '80%');

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor((new Date()).getTime() / 1000),
    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium"
  } as Message;

  cy.window().its('store').invoke('dispatch', pushMessage(message));

  cy.get('.messages').should('contain', message.content);
  
  cy.get('.messages').then(el => {
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

  cy.get('.message').its('length').should('eq', 20);

  cy.get('.messages').scrollTo('0%', '30%');

  cy.get('.message').its('length').should('eq', 40);
});
