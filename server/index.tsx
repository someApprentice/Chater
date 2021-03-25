import { readFile } from 'fs';
import { resolve } from 'path';

import express, { Request, Response } from 'express';

import cookieParser from 'cookie-parser';

import { verify } from 'jsonwebtoken';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import authReducer, { authenticate } from '../src/features/auth/slice';

import { renderToString } from 'react-dom/server';

import { StaticRouter } from 'react-router-dom';
import { StaticRouterContext } from 'react-router';

import { Helmet } from 'react-helmet';

import { ServerStyleSheets } from '@material-ui/core/styles';

import authRouter from './api/auth/routes';

import App from '../src/App';

import serialize from 'serialize-javascript';

import { User } from '../src/models/user';

const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET;

const app = express();

app.use(express.static(resolve(__dirname, '../build/static')));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('*', (req: Request, res: Response) => {
  let context: StaticRouterContext = {};

  let store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {}
  });

  if ('hash' in req.cookies) {
    let user: User;

    try {
      user = verify(req.cookies.hash, SECRET!) as User;
    } catch (err) {
      if (err && err.message)
        return res.status(400).send(err.message);

      return res.sendStatus(500);
    }

    user.hash = req.cookies.hash;

    store.dispatch(authenticate(user));

    let date = new Date();

    for (let key in req.cookies) {
      /* @TODO Set secure flag in production mode (SSL) */
      res.cookie(key, req.cookies[key], { expires: new Date(date.setMonth(date.getMonth() + 1)), secure: false, httpOnly: true });
    }
  }

  let state = store.getState();

  let sheets = new ServerStyleSheets();

  let content = renderToString(
    sheets.collect(
      <Provider store={ store }>
        <StaticRouter location={ req.path } context={ context }>
          <App />
        </StaticRouter>
      </Provider>
    )
  );

  if (context.url) {
    if (context.statusCode) 
      return res.redirect(context.statusCode, context.url);
    
    return res.redirect(context.url);
  }

  let css = sheets.toString();

  let helmet = Helmet.renderStatic();

  readFile(resolve(__dirname, '../build/index.html'), 'utf8', (err, data) => {
    if (err)
      return res.status(500).send('500 Internal Server Error');

    let html = data
      .replace(/<title>.*<\/title>/, helmet.title.toString())
      .replace(/__CSS__/, css)
      .replace(/__PRELOADED_STATE__/, serialize(JSON.stringify(state)))
      .replace(/<div id="root"><\/div>/, `<div id="root">${ content }</div>`);

    return res.status(context.statusCode || 200).send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${ PORT }`);
});
