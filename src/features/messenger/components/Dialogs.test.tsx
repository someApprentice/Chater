import React, { forwardRef, useEffect, PropsWithChildren } from 'react';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import authReducer from '../../auth/slice';
import usersReducer from '../../users/slice';
import messengerReducer from '../slice';

import { Router } from 'react-router';
import { Switch, Route, RouteComponentProps  } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { AuthenticatedRoute } from '../../../utils/router';

import Dialogs from './Dialogs'

import { User } from '../../../models/user';
import { Dialog } from '../../../models/dialog';

let u: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  hash: 'shhhh-secret'
};

let tester: User = {
  id: nanoid(),
  email: 'tester@chater.com',
  name: 'Tester'
};

let searched: User = {
  id: nanoid(),
  email: 'searched@chater.com',
  name: 'Searched'
};

let users = [ u, tester, searched ];

let dialog: Dialog = {
  id: nanoid(),
  type: 'public',
  updated_at: (new Date()).getTime() / 1000,
  messages_count: 0
};

let privateDialog: Dialog = {
  id: nanoid(),
  type: 'private',
  party: [ u.id, tester.id ],
  updated_at: (new Date()).getTime() / 1000,
  messages_count: 0
};

let dialogs = [ dialog, privateDialog ];

function App() {
  return (
    <>
      <h1>Chater</h1>

      <Dialogs isOpen={ true } handleDialogsClose={ () => { } } />

      <Switch>
        <Route exact path='/'>
          <>Index Page</>
        </Route>

        <AuthenticatedRoute
          path="/dialog/:id"
          render={
            (props: RouteComponentProps) => {
              let { id } = props.match.params as { id: string };

              return <>Private Dialog { id }</>
            }
          }
        />
      </Switch>
    </>
  );
}

const server = setupServer(
  rest.get('/api/messenger/dialogs/private/', (req, res, ctx) => {
    let d = dialogs.filter(dialog => dialog.type == 'private');

    return res(ctx.json(d));
  }),

  rest.get('/api/users/users', (req, res, ctx) => {
    let ids = req.url.searchParams.get('ids')?.toString().split(',') || [];

    return res(ctx.json(
      users
        .filter(user => ids.includes(user.id))
        .map(user => {
          const { hash, ...u } = user;

          return u;
        })
    ));
  }),

  rest.get('/api/users/search', (req, res, ctx) => {
    let query = req.url.searchParams.get('q')?.toString() || '';

    if (!query)
      return res(
        ctx.status(400),
        ctx.text('Bad Request')
      );

    return res(ctx.json(
      users
        .filter(user => user.name.includes(query))
        .map(user => {
          const { hash, ...u } = user;

          return u;
        })
    ));
  }),

  rest.post('/api/messenger/dialog/private', (req, res, ctx) => {
    let id = req.url.searchParams.get('id')?.toString() || '';

    if (!id)
      return res(
        ctx.status(400),
        ctx.text('Bad Request')
      );

    let d = dialogs.find(dialog => (
      dialog.type === 'private' &&
      dialog.party?.includes(u.id) &&
      dialog.party.includes(id)
    ));

    if (d)
      return res(ctx.json(d));

    d = {
      id: nanoid(),
      type: 'private',
      updated_at: (new Date()).getTime() / 1000,
      messages_count: 0,
      party: [ u.id, id ]
    };

    return res(ctx.json(d));
  }),
);

let store: ReturnType<typeof configureStore>;
let user: ReturnType<typeof userEvent.setup>;

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
        user: u,
        isPending: false
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

  user = userEvent.setup();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test('dialogs rendering', async () => {
  const history = createMemoryHistory({ initialEntries: ['/login'] });

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByText('Public', { exact: false })).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(tester.name)).toBeInTheDocument();
  });
});

test('user search and start of a private dialog', async () => {
  const history = createMemoryHistory({ initialEntries: ['/login'] });

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  await user.type(screen.getByPlaceholderText(/^Search/), searched.name);
  await user.click(screen.getByLabelText('search'));

  await waitFor(() => {
    expect(screen.getByText(searched.name)).toBeInTheDocument();
  });

  await user.click(screen.getByText(searched.name));

  await waitFor(() => {
    expect(history.location.pathname).toContain('/dialog');
    expect(screen.getByText('Private Dialog', { exact: false })).toBeInTheDocument();
  });
});
