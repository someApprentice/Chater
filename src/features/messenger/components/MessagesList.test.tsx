import { render, screen, waitFor } from '@testing-library/react';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { useSelector, useDispatch } from 'react-redux';

import authReducer from '../../auth/slice';
import usersReducer from '../../users/slice';
import messengerReducer, { pushMessage } from '../slice';
import { RootState } from '../../../store';

import { User } from '../../../models/user';
import { Dialog } from '../../../models/dialog';
import { Message } from '../../../models/message';

import MessagesList from './MessagesList';

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

for (let i = 0; i < 20; i++) {
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

function App() {
  let d = dialog;

  let messages = useSelector((state: RootState) => {
    return state
      .messenger
      .messages
      .filter((message: Message) => message.dialog == d.id)
      .slice()
      .sort((a: Message, b: Message) => a.date - b.date);
  });

  // jsdom cannot test layout
  function onScrollUp() {}

  return (
    <>
      <h1>Chater</h1>

      <MessagesList
        messages={ messages }
        total={ d.messages_count }
        onScrollUp={ onScrollUp }
      />
    </>
  )
}

let store: ReturnType<typeof configureStore>;

beforeEach(() => {
  store = configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,
      messenger: messengerReducer
    },
    preloadedState: {
      messenger: {
        dialogs: [],
        messages: m,
        isDialogPending: false,
        isDialogsPending: false,
        isMessagesPending: false,
      }
    }
  });
});

test('Dialog rendering', async () => {
  render(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  expect(screen.getByLabelText('messages-list')).toBeInTheDocument();
});

test('messages rendering', async () => {
  render(
    <Provider store={ store }>
      <App />
    </Provider>
  );

  expect(screen.getByLabelText('messages-list')).toBeInTheDocument();

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
    expect(screen.getAllByText("Lorem ipsum dolor sit amet")).toHaveLength(20);
    expect(screen.getByText(message.content)).toBeInTheDocument();
  });
});
