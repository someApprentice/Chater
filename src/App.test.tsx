import React from 'react';
import { render, screen } from '@testing-library/react';
import store from './store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import App from './App';

test('renders learn react link', () => {
  render(
    <Provider store={ store }>
      <Router>
        <CookiesProvider>
          <App />
        </CookiesProvider>
      </Router>
    </Provider>
  );

  const linkElement = screen.getByText(/Chater/i);
  expect(linkElement).toBeInTheDocument();
});
