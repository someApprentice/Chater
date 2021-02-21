import { readFile } from 'fs';
import { resolve } from 'path';

import express, { Request, Response } from 'express';

import Cookies from 'universal-cookie';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { renderToString } from 'react-dom/server';

import { StaticRouter } from 'react-router-dom';

import { CookiesProvider } from 'react-cookie';

import { Helmet } from 'react-helmet';

import App from '../src/App';

import serialize from 'serialize-javascript';

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static(resolve(__dirname, '../build/static')));

app.get('*', (req: Request, res: Response) => {
  let cookies = new Cookies(req.headers.cookie);

  let context = {};

  let store = configureStore({
    reducer: {

    },
    preloadedState: {

    }
  });

  let state = store.getState();

  let content = renderToString(
    <Provider store={ store }>
      <StaticRouter location={ req.path } context={ context }>
        <CookiesProvider cookies={ cookies }>
          <App />
        </CookiesProvider>
      </StaticRouter>
    </Provider>
  );

  let helmet = Helmet.renderStatic();

  let c = cookies.getAll();

  let date = new Date();

  for (let key in c) {
    /* @TODO Set secure flag in production mode (SSL) */
    res.cookie(key, c[key], { expires: new Date(date.setMonth(date.getMonth() + 1)), secure: false, httpOnly: true });
  }

  readFile(resolve(__dirname, '../build/index.html'), 'utf8', (err, data) => {
    if (err)
      return res.status(500).send('500 Internal Server Error');

    let html = data
      .replace(/<title>.*<\/title>/, helmet.title.toString())
      .replace(/__PRELOADED_STATE__/, serialize(JSON.stringify(state)))
      .replace(/<div id="root"><\/div>/, `<div id="root">${ content }</div>`);

    return res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${ PORT }`);
});
