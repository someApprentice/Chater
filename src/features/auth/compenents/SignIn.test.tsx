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

import { UnauthenticatedRoute } from '../../../utils/router';

import SignIn from './SignIn';

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

        <UnauthenticatedRoute path='/login'>
          <SignIn />
        </UnauthenticatedRoute>
      </Switch>
    </>
  );
}

let u: User = {
  id: nanoid(),
  email: 'name@chater.com',
  name: 'Name',
  hash: 'shhhh-secret'
};

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json(u));
  })
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

test('SignIn rendering', async () => {
  const history = createMemoryHistory({ initialEntries: ['/login'] });

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
});

test('authentication and redirect to the index page', async () => {
  const history = createMemoryHistory({ initialEntries: ['/login'] });

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();

  await user.type(screen.getByLabelText(/^Email Address/), u.email);
  await user.type(screen.getByLabelText(/^Password/), 'password');

  await user.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(history.location.pathname).toBe('/');
    expect(screen.getByText(`Welcome, ${ u.name }`, { exact: false })).toBeInTheDocument();
  });
});

test('No matches found error',  async () => {
  let text = 'No matches found';
  server.use(
    rest.post('/api/auth/login', (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.text(text)
      );
    })
  );

  const history = createMemoryHistory({ initialEntries: ['/login'] });

  render(
    <Provider store={ store }>
      <Router history={ history }>
        <App />
      </Router>
    </Provider>
  );

  expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();

  await user.type(screen.getByLabelText(/^Email Address/), u.email);
  await user.type(screen.getByLabelText(/^Password/), 'password');

  await user.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(screen.getByText(text, { exact: false })).toBeInTheDocument();
  });
});
