import React from 'react';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider, useSelector } from 'react-redux';

import authReducer from '../slice';
import { RootState } from '../../../store';

import { Router } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { AuthenticatedRoute } from '../../../utils/router';

import LogOut from './LogOut';

import { User } from '../../../models/user';

function App() {
  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  let user = useSelector((state: RootState) => state.auth.user);

  return (
    <>
      <h1>Chater</h1>

      { isAuthenticated ? `Welcome, ${ user!.name }` : "You're not logged in" }

      <LogOut />

      <Switch>
        <Route exact path='/'>
          <>Index Page</>
        </Route>

        <AuthenticatedRoute path='/private'>
          <>Private Page</>
        </AuthenticatedRoute>
      </Switch>
    </>
  );
}

let u: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  hash: 'shhhh-secret',
  avatar: 'data:image/png;base64,avatar=='
};

const server = setupServer(
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('OK'));
  })
);

let store: ReturnType<typeof configureStore>;
let user: ReturnType<typeof userEvent.setup>;

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  user = userEvent.setup();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test('LogOut rendering', async () => {
  const history = createMemoryHistory({ initialEntries: ['/private'] });

  let store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isPending: false,
        user: u
      }
    }
  });

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByLabelText('logout')).toBeInTheDocument();
});

test('logout and redirect to the index page', async () => {
  const history = createMemoryHistory({ initialEntries: ['/private'] });

  let store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isPending: false,
        user: u
      }
    }
  });

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByLabelText('logout')).toBeInTheDocument();

  await user.click(screen.getByLabelText('logout'));

  await waitFor(() => {
    expect(history.location.pathname).toBe('/');

    expect(screen.getByText(/You're not logged in/)).toBeInTheDocument();
  });
});
