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

import TextField from '@material-ui/core/TextField';

import SignUp from './SignUp';

import { User } from '../../../models/user';

function App() {
  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  let user = useSelector((state: RootState) => state.auth.user);

  return (
    <>
      <h1>Chater</h1>

      { isAuthenticated ? `Welcome, ${ user!.name }` : "You're not logged in" }

      <Switch>
        <Route exact path='/'>
          <>Index Page</>
        </Route>

        <Route path='/login'>
          <SignUp />
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
  rest.post('/api/auth/registrate', (req, res, ctx) => {
    return res(ctx.json(user));
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

test('registration and redirect to the index page', async () => {
  const history = createMemoryHistory({ initialEntries: ['/login'] });

  const wrapper = mount(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  // https://stackoverflow.com/a/58061161/12948018
  expect(wrapper.findWhere(node => !!node.name() && node.type() === 'h1' && node.text() === 'Sign Up')).toHaveLength(1);

  wrapper.find('input[name="email"]').simulate('change', { target: { name: 'email', value: user.email } });
  wrapper.find('input[name="name"]').simulate('change', { target: { name: 'name', value: user.name } });
  wrapper.find('input[name="password"]').simulate('change', { target: { name: 'password', value: 'password' } });
  wrapper.find('input[name="retryPassword"]').simulate('change', { target: { name: 'retryPassword', value: 'password' } });

  // https://github.com/enzymejs/enzyme/issues/308
  // wrapper.find('button').simulate('click');
  wrapper.find('button').simulate('submit');

  // https://github.com/enzymejs/enzyme/issues/2073
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 333));
    wrapper.update();
  });

  expect(history.location.pathname).toBe('/');

  expect(wrapper.text()).toContain(`Welcome, ${ user.name }`);
});

test('User with this email already exists error',  async () => {
  server.use(
    rest.post('/api/auth/registrate', (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.text('User with this email already exists')
      );
    })
  );

  const history = createMemoryHistory({ initialEntries: ['/login'] });

  const wrapper = mount(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  // https://stackoverflow.com/a/58061161/12948018
  expect(wrapper.findWhere(node => !!node.name() && node.type() === 'h1' && node.text() === 'Sign Up')).toHaveLength(1);

  wrapper.find('input[name="email"]').simulate('change', { target: { name: 'email', value: user.email } });
  wrapper.find('input[name="name"]').simulate('change', { target: { name: 'name', value: user.name } });
  wrapper.find('input[name="password"]').simulate('change', { target: { name: 'password', value: 'password' } });
  wrapper.find('input[name="retryPassword"]').simulate('change', { target: { name: 'retryPassword', value: 'password' } });

  // https://github.com/enzymejs/enzyme/issues/308
  // wrapper.find('button').simulate('click');
  wrapper.find('button').simulate('submit');

  // https://github.com/enzymejs/enzyme/issues/2073
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 333));
    wrapper.update();
  });

  expect(wrapper.find(TextField).at(0).props().helperText).toContain('User with this email already exists');
});

