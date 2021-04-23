import { readFile } from 'fs';
import { resolve } from 'path';

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import cookieParser from 'cookie-parser';

import db from './services/database/db';
import { verify } from 'jsonwebtoken';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import authReducer, { authenticate } from '../src/features/auth/slice';
import usersReducer from '../src/features/users/slice';
import messengerReducer, { pushDialog } from '../src/features/messenger/slice';

import { renderToString } from 'react-dom/server';

import { StaticRouter } from 'react-router-dom';
import { StaticRouterContext } from 'react-router';

import { Helmet } from 'react-helmet';

import { ServerStyleSheets } from '@material-ui/core/styles';

import authRouter from './api/auth/routes';
import usersRouter from './api/users/routes';
import messengerRouter from './api/messenger/routes';

import App from '../src/App';

import serialize from 'serialize-javascript';

import { User } from '../src/models/user';
import { Dialog } from '../src/models/dialog';

import * as yup from 'yup';

import { populate } from './populate';
import s from './services/database/db'

const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET;

const app = express();
const server = createServer(app);

export const io = new Server(server);

app.use(express.static(resolve(__dirname, '../build/static')));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/messenger', messengerRouter);

app.get('*', (req: Request, res: Response) => {
  let context: StaticRouterContext = {};

  let store = configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,
      messenger: messengerReducer
    },
    preloadedState: {}
  });

  let publicDialog = db.getState().dialogs.dialogs.find((dialog: Dialog) => (
    dialog.type === 'public'
  ))!;

  store.dispatch(pushDialog(publicDialog));

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

io.sockets.on('connect', (socket) => {
  socket.on('join', (data, ack) => {
    let schema = yup.object().shape({
      hash: yup.string().required()
    });

    try {
      schema.validate(data);
    } catch (err) {
      return ack({ err })
    }

    let user: User;

    try {
      user = verify(data.hash, SECRET!) as User;
    } catch (err) {
      return ack({ err })
    }

    socket.join(user.id);
  });

  socket.on('leave', (data, ack) => {
    let schema = yup.object().shape({
      hash: yup.string().required()
    });

    try {
      schema.validate(data);
    } catch (err) {
      return ack({ err })
    }

    let user: User;

    try {
      user = verify(data.hash, SECRET!) as User;
    } catch (err) {
      return ack({ err })
    }

    socket.leave(user.id);
  });
});

server.listen(PORT, async () => {
  await populate();

  console.log(`Node server listening on http://localhost:${ PORT }`);
});
