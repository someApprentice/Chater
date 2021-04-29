import { Router, Request, Response } from 'express';

import * as yup from 'yup';
import { nanoid } from '@reduxjs/toolkit';

import store from '../../services/database/db';
import { find, insert as insertDialog, update, select as selectDialogs } from '../../services/database/slices/dialogs';
import { insert as insertMessage, select as selectMessages } from '../../services/database/slices/messages';
import { find as findUser } from '../../services/database/slices/users';

import passport from '../../services/passport';

import { User } from '../../../src/models/user';
import { Dialog } from '../../../src/models/dialog';
import { Message } from '../../../src/models/message';

import { io } from '../../index';

const router = Router();

router.post('/message/private', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  let id = req.query.id?.toString() || '';

  if (!id)
    return res.status(400).send('Bad Request');

  let content = req.body.content;

  let schema = yup.object().shape({
    content: yup.string().required()
  });

  try {
    schema.validate({ content });
  } catch (err) {
    return res.status(400).send('Bad Request');
  }

  let user: User = req.user as User;

  let { ...dialog } = find(store.getState(), (dialog: Dialog) => dialog.id === id);

  if (!dialog)
    return res.sendStatus(500);

  let { ...party } = findUser(store.getState(), (u: User) => u.id !== user.id && dialog.party!.includes(u.id))!;

  let date = new Date();

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: date.getTime() / 1000,
    content
  };

  dialog.updated_at = date.getTime() / 1000;
  dialog.messages_count++;

  store.dispatch(insertMessage({ ...message }));
  store.dispatch(update({ ...dialog }));

  io.sockets
    .to(user.id)
    .to(party.id)
    .emit('private dialog update', dialog);

  io.sockets
    .to(user.id)
    .to(party.id)
    .emit('private message', message);

  return res
    .status(200)
    .type('json')
    .json(message);
});

router.post('/message/public', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  let content = req.body.content;

  let schema = yup.object().shape({
    content: yup.string().required()
  });

  try {
    schema.validate({ content });
  } catch (err) {
    return res.status(400).send('Bad Request');
  }

  let user: User = req.user as User;

  let { ...dialog } = find(store.getState(), (dialog: Dialog) => dialog.type === 'public');

  if (!dialog)
    return res.sendStatus(500);

  let date = new Date();

  let message: Message = {
    id: nanoid(),
    dialog: dialog.id,
    author: user.id,
    date: date.getTime() / 1000,
    content
  };

  dialog.updated_at = date.getTime() / 1000;
  dialog.messages_count++;

  store.dispatch(insertMessage({ ...message }));
  store.dispatch(update({ ...dialog }));

  io.sockets.emit('public dialog update', dialog);
  io.sockets.emit('public message', message);

  return res
    .status(200)
    .type('json')
    .json(message);
});

router.get('/dialogs/private', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  let user: User = req.user as User;

  let dialogs = selectDialogs(
    store.getState(),
    (dialog: Dialog) => dialog.type === 'private' && dialog.party!.includes(user.id)
  );

  return res
    .status(200)
    .type('json')
    .json(dialogs);
});

router.post('/dialog/private', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  let id = req.query.id?.toString() || '';

  if (!id)
    return res.status(400).send('Bad Request');

  let user: User = req.user as User;

  let dialog = find(store.getState(), (dialog: Dialog) => dialog.type === 'private' && dialog.party!.includes(id) && dialog.party!.includes(user.id));

  if (dialog) {
    return res
      .status(200)
      .type('json')
      .json(dialog);
  }

  dialog = {
    id: nanoid(),
    type: 'private',
    updated_at: (new Date()).getTime() / 1000,
    messages_count: 0,
    party: [ user.id, id ]
  };

  store.dispatch(insertDialog({ ...dialog }));

  io.sockets
    .to(user.id)
    .to(id)
    .emit('private dialog update', dialog);

  return res
    .status(200)
    .type('json')
    .json(dialog);
});

router.get('/dialog/public', (req: Request, res: Response) => {
  let dialog = find(store.getState(), (dialog: Dialog) => dialog.type === 'public');

  if (!dialog)
    return res.sendStatus(500);

  return res
    .status(200)
    .type('json')
    .json(dialog);
});

router.get('/dialog/private', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  let user: User = req.user as User;

  let id = req.query.id?.toString() || '';

  if (!id)
    return res.status(400).send('Bad Request');

  let dialog = find(store.getState(), (dialog: Dialog) => dialog.type === 'private' && dialog.party!.includes(id) && dialog.party!.includes(user.id));

  if (!dialog)
    return res.status(404).send('Dialog Not Found');

  return res
    .status(200)
    .type('json')
    .json(dialog);
});

router.get('/dialog', (req: Request, res: Response) => {
  let id = req.query.id?.toString() || '';

  if (!id)
    return res.status(400).send('Bad Request');

  let dialog = find(store.getState(), (dialog: Dialog) => dialog.id === id);

  if (!dialog)
    return res.status(404).send('Dialog Not Found');

  return res
    .status(200)
    .type('json')
    .json(dialog);
});

router.get('/messages', (req: Request, res: Response) => {
  let id = req.query.id?.toString() || '';
  let date = +req.query.date!;

  if (!id)
    return res.status(400).send('Bad Request');

  let dialog = find(store.getState(), (dialog: Dialog) => dialog.id === id);

  if (!dialog)
    return res.status(400).send('Bad Request');

  let selector = (message: Message) => message.dialog === dialog!.id;

  if (date) {
    selector = (message: Message) => message.dialog === dialog!.id && message.date < date;
  }

  let messages = selectMessages(store.getState(), selector);

  return res
    .status(200)
    .type('json')
    .json(messages);
});

export default router;
