import React from 'react';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { server as socket } from '../test/__mocks__/socket.io-client'

import { render, screen, getByRole, getByText, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import authReducer from './features/auth/slice';
import usersReducer from './features/users/slice';
import messengerReducer from './features/messenger/slice';

import { MemoryRouter as Router } from 'react-router-dom';

import { User } from './models/user';
import { Dialog } from './models/dialog';
import { Message } from './models/message';

import App from './App';

let store: ReturnType<typeof configureStore>;
let user: ReturnType<typeof userEvent.setup>;

let u: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  hash: 'shhhh-secret',
  avatar: 'data:image/png;base64,avatar=='
};

let publicDialog: Dialog = {
  id: nanoid(),
  type: 'public',
  updated_at: (new Date()).getTime() / 1000,
  messages_count: 0
};

let message: Message = {
  id: nanoid(),
  dialog: publicDialog.id,
  author: u.id,
  date: (new Date()).getTime() / 1000,
  content: "Lorem ipsum dolor sit amet"
} as Message;

const server = setupServer(
   rest.get('/api/messenger/dialog/public', (req, res, ctx) => {
    return res(ctx.json(publicDialog));
  }),

  rest.get('/api/users/users', (req, res, ctx) => {
    let ids = req.url.searchParams.get('ids')?.toString().split(',') || [];

    if (!ids)
      return res(
        ctx.status(400),
        ctx.text('Bad Request')
      );

    let users = [ u ];

    return res(ctx.json(
      users
        .filter(user => ids.includes(user.id))
        .map(user => {
          const { hash, ...u } = user;

          return u;
        })
    ));
  }),

  rest.post('/api/messenger/message/public', (req, res, ctx) => {
    let content = (req.body as Record<string, any>).content || ''; 

    if (!content)
      return res(
        ctx.status(400),
        ctx.text('Bad Request')
      );

    let date = new Date();
    
    let d = {
      ...publicDialog,
      updated_at: date.getTime() / 1000,
      messages_count: 1
    };

    let message: Message = {
      id: nanoid(),
      dialog: d.id,
      author: u.id,
      date: date.getTime() / 1000,
      content
    };

    socket.emit('public dialog update', d);
    socket.emit('public message', message);

    return res(ctx.json(message));
  }),

  rest.get('/api/messenger/dialogs/private/', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.get('/api/messenger/messages/', (req, res, ctx) => {
    return res(ctx.json([]));
  }),
);

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
      messenger: {
        dialogs: [
          publicDialog
        ],
        messages: [],
        isDialogPending: false,
        isDialogsPending: false,
        isMessagesPending: false,
      }
    }
  });

  user = userEvent.setup();
});

afterEach(() => {
  server.resetHandlers();
  socket.reset();
});

afterAll(() => {
  server.close();
});

test('App rendering', () => {
  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.queryByRole('heading')).toHaveTextContent('Chater');
});

test("rendering Message from socket", async () => {
  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  socket.emit('connect');

  let date = (new Date(publicDialog.updated_at * 1000))
  date = new Date(date.setSeconds(date.getSeconds() + 1))

  let dialog = {
    ...publicDialog,
    updated_at: date.getTime() / 1000,
    messages_count: publicDialog.messages_count + 1
  };

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: u.id,
    date: date.getTime() / 1000,
    content: "Lorem ipsum dolor sit amet"
  } as Message;

  socket.emit('public dialog update', dialog);
  socket.emit('public message', message);

  await waitFor(() => {
    expect(screen.getByText(message.content)).toBeInTheDocument();
  });
});

test('sending Message', async () => {
  let store = configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,
      messenger: messengerReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isPending: false,
        user: u
      },
      messenger: {
        dialogs: [
          publicDialog
        ],
        messages: [],
        isDialogPending: false,
        isDialogsPending: false,
        isMessagesPending: false,
      }
    } 
  });

  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  socket.emit('connect')

  let text = "Lorem ipsum dolor sit amet";

  const messageForm = screen.getByLabelText('message-form');

  await user.type(getByRole(messageForm, 'textbox'), text);
  await user.click(getByRole(messageForm, 'button'));

  await waitFor(() => {
    const main = screen.getByRole('main')
    const list = getByRole(main, 'list')
    expect(getByText(list, text, { exact: false })).toBeInTheDocument();
  });
});

test('authenticated state', () => {
  let store = configureStore({
    reducer: {
      auth: authReducer,
      messenger: messengerReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isPending: false,
        user: u
      },
      messenger: {
        dialogs: [
          publicDialog
        ],
        messages: [],
        isDialogPending: false,
        isDialogsPending: false,
        isMessagesPending: false,
      }
    } 
  });

  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByLabelText('logout')).toBeInTheDocument();
});

test('unauthenticated state', () => {
  render(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );
  
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Registration')).toBeInTheDocument();
});
