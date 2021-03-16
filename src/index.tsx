import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

const jssStyles = document.querySelector('#jss-server-side');
if (jssStyles) {
  jssStyles.parentElement!.removeChild(jssStyles);
}

ReactDOM.hydrate(
  <React.StrictMode>
    <Provider store={ store }>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
