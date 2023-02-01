import React, { forwardRef, useEffect, PropsWithChildren } from 'react';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { render, screen, getByText, waitFor } from '@testing-library/react';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider, useSelector } from 'react-redux';

import authReducer from '../../auth/slice';
import usersReducer from '../../users/slice';
import messengerReducer, { pushMessage } from '../slice';

import { MemoryRouter as Router } from 'react-router-dom';

import PrivateDialog from './PrivateDialog';

import { User } from '../../../models/user';
import { Dialog } from '../../../models/dialog';
import { Message } from '../../../models/message';

let user: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name'
};

let tester: User = {
  id: nanoid(),
  email: 'tester@chater.com',
  name: 'Tester'
};

let users: User[] = [ user, tester ];

let dialog: Dialog = {
  id: nanoid(),
  type: 'private',
  updated_at: (new Date()).getTime() / 1000,
  messages_count: 0,
  party: [ user.id, tester.id ]
};

let dialogs: Dialog[] = [ dialog ];

let messages: Message[] = [
  {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor((new Date().getTime()) / 1000),
    content: "Hey Tester!"
  },
  {
    id: nanoid(),
    dialog: dialog.id,
    author: tester.id,
    date: Math.floor((new Date().getTime()) / 1000),
    content: "Hey User!"
  }
];

function App() {
  let d = dialog;

  return (
    <>
      <h1>Chater</h1>

      <PrivateDialog id={ d.id } />
    </>
  );
}

const server = setupServer(
   rest.get('/api/messenger/dialog', (req, res, ctx) => {
    let id = req.url.searchParams.get('id');

    if (!id)
      return res(
        ctx.status(400),
        ctx.text('Bad Request')
      );

    let d = dialogs.find(dialog => dialog.id == id);

    if (!d)
      return res(
        ctx.status(404),
        ctx.text('Dialog Not Found')
      );

    return res(ctx.json(d));
  }),

  rest.get('/api/messenger/messages/', (req, res, ctx) => {
    let id = req.url.searchParams.get('id');
    let date = +req.url.searchParams.get('date')!;

    if (!id)
      return res(
        ctx.status(400),
        ctx.text('Bad Request')
      );

    let d = dialogs.find(dialog => dialog.id == id);

    if (!d)
      return res(
        ctx.status(404),
        ctx.text('Bad Request')
      );

      let m = messages
        .filter(message => {
          if (date)
            return message.dialog === d!.id && message.date < date;

          return message.dialog === d!.id;
        })
        .slice(-20);

    return res(ctx.json(m));
  }),

  rest.get('/api/users/users', (req, res, ctx) => {
    let ids = req.url.searchParams.get('ids')?.split(',') || [];

    if (!ids)
      return res(
        ctx.status(400),
        ctx.text('Bad Request')
      );

    let us = users.filter(user => ids.includes(user.id))

    return res(ctx.json(us));
  })
);

let store: ReturnType<typeof configureStore>;

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  store = configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,   
      messenger: messengerReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isPending: false,
        user: user
      },
      users: {
        users: [],
        isPending: false
      },
      messenger: {
        dialogs: [],
        messages: [],
        isDialogPending: false,
        isDialogsPending: false,
        isMessagesPending: false,
      }
    }
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test('PrivateDialog rendering', async () => {
  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByText(tester.name)).toBeInTheDocument();
  });
});

test('messages rendering', async () => {
  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByText('Hey Tester!')).toBeInTheDocument();
    expect(screen.getByText('Hey User!')).toBeInTheDocument();
  });
});

test('authors rendering', async () => {
  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  await waitFor(() => {
    const list = screen.getByRole('list');

    expect(getByText(list, user.name)).toBeInTheDocument();
    expect(getByText(list, tester.name)).toBeInTheDocument();
  });
});
