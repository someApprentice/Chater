import React from 'react';

import { render, screen } from '@testing-library/react';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import authReducer, { authenticate, deauthenticate } from '../features/auth/slice';

import { Router } from 'react-router';
import { Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { User } from '../models/user';

import { AuthenticatedRoute, UnauthenticatedRoute } from './router';

let store: ReturnType<typeof configureStore>;

let user: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  hash: 'shhhh-secret',
  avatar: 'data:image/png;base64,avatar=='
};

beforeEach(() => {
  store = configureStore({
    reducer: {
      auth: authReducer
    }
  });
});

test('authenticated route', () => {
  const history = createMemoryHistory({ initialEntries: ['/private'] });

  let store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        isPending: false,
        user
      }
    }
  });

  function App() {
    return (
      <>
        <h1>Chater</h1>

        <Switch>
          <AuthenticatedRoute  path='/private'>
            <>Private Page</>
          </AuthenticatedRoute>
        </Switch>
      </>
    );
  }

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByText(/Private Page/)).toBeInTheDocument();

  store.dispatch(deauthenticate());

  expect(history.location.pathname).toBe('/');
});

test('unauthenticated route', () => {
  const history = createMemoryHistory({ initialEntries: ['/authenticated'] });

  function App() {
    return (
      <>
        <h1>Chater</h1>

        <Switch>
          <UnauthenticatedRoute  path='/authenticated'>
            <>Unauthenticated Page</>
          </UnauthenticatedRoute>
        </Switch>
      </>
    );
  }

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByText(/Unauthenticated Page/)).toBeInTheDocument();

  store.dispatch(authenticate(user));

  expect(history.location.pathname).toBe('/');
});
