import React, { forwardRef, useEffect, PropsWithChildren } from 'react';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { render, screen, waitFor } from '@testing-library/react';

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
  name: 'Name'
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
  date = new Date(date.setSeconds(date.getSeconds() - i));

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor(date.getTime() / 1000),
    content: "Lorem ipsum dolor sit amet"
  } as Message;

  m.push(message);

  dialog.messages_count++;
}

const Dialog = withDialogData(forwardRef<HTMLUListElement, PropsWithChildren<DialogProps>>(
  function ({ dialog, messages, isMessagesPending, onScroll }: DialogProps, ref) {

    return (
      <>
        <h2>Dialog</h2>

        <ul>
          { messages.map((message: Message) => (
            <li key={ message.id }>{ message.content }</li>
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

    let messages = m
      .filter(message => {
        if (date)
          return message.dialog === d!.id && message.date < date;

        return message.dialog === d!.id;
      })
      .slice(-20);

    return res(ctx.json(messages));
  })
);

let store: ReturnType<typeof configureStore>;

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
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
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test('Dialog rendering', async () => {
  render(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  expect(screen.getByRole('heading', { name: 'Dialog' })).toBeInTheDocument();
});

test('messages rendering', async () => {
  render(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  expect(screen.getByRole('heading', { name: 'Dialog' })).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getAllByText("Lorem ipsum dolor sit amet")).toHaveLength(20);
  });

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: Math.floor((new Date()).getTime() / 1000),
    content: "Test Message"
  } as Message;

  store.dispatch(pushMessage(message));

  await waitFor(() => {
    expect(screen.getByText(message.content)).toBeInTheDocument();
  });
});
