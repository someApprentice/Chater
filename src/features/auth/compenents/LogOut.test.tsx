import React from 'react';
import { act } from 'react-dom/test-utils';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { createMount } from '@material-ui/core/test-utils';

import { configureStore, nanoid } from '@reduxjs/toolkit';
import { Provider, useSelector } from 'react-redux';

import authReducer from '../slice';
import { RootState } from '../../../store';

import { Router } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

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
      </Switch>
    </>
  );
}

let user: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  hash: 'shhhh-secret'
};

const server = setupServer(
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('OK'));
  })
);

let store: ReturnType<typeof configureStore>;
let mount: ReturnType<typeof createMount>;

beforeAll(() => {
  server.listen();
  mount = createMount();
});

beforeEach(() => {
  store = configureStore({
    reducer: {
      auth: authReducer
    }
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  mount.cleanUp();
  server.close();
});

test('logout and redirect to the index page', async () => {
  const history = createMemoryHistory({ initialEntries: ['/login'] });

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
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(wrapper.find(LogOut)).toHaveLength(1);

  // https://github.com/enzymejs/enzyme/issues/308
  // wrapper.find('button').simulate('click');
  wrapper.find('button').simulate('submit');

  // https://github.com/enzymejs/enzyme/issues/2073
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 333));
    wrapper.update();
  });

  expect(history.location.pathname).toBe('/');

  expect(wrapper.text()).toContain("You're not logged in");
});
