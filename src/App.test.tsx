import React from 'react';

import { createMount } from '@material-ui/core/test-utils';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import authReducer from './features/auth/slice';

import { MemoryRouter as Router } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import LogOut from './features/auth/compenents/LogOut';

import { User } from './models/user';

import App from './App';

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

test('render App', () => {
  const wrapper = mount(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  expect(wrapper.find(Typography).at(0).text()).toContain('Chater');
});

test('authenticated state', () => {
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

  const wrapper = mount(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  expect(wrapper.text()).toContain(`Welcome, ${ user.name }`);

  expect(wrapper.find(Link)).toHaveLength(1);
  expect(wrapper.find(LogOut)).toHaveLength(1);
});

test('unauthenticated state', () => {
  const wrapper = mount(
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  expect(wrapper.text()).toContain("You're not logged in");

  expect(wrapper.find(Link)).toHaveLength(3);
});
