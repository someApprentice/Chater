import React from 'react';

import { createMount } from '@material-ui/core/test-utils';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import authReducer, { authenticate, deauthenticate } from '../features/auth/slice';

import { Router } from 'react-router';
import { Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { User } from '../models/user';

import { AuthenticatedRoute, UnauthenticatedRoute } from './router';

let store: ReturnType<typeof configureStore>;
let mount: ReturnType<typeof createMount>;

let user: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  hash: 'shhhh-secret'
};

beforeAll(() => {
  mount = createMount();
});

beforeEach(() => {
  store = configureStore({
    reducer: {
      auth: authReducer
    }
  });
});

afterAll(() => {
  mount.cleanUp();
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

  const wrapper = mount(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(wrapper.text()).toContain('Private Page');

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

  const wrapper = mount(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(wrapper.text()).toContain('Unauthenticated Page');

  store.dispatch(authenticate(user));

  expect(history.location.pathname).toBe('/');
});
