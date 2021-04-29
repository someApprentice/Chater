import { Router, Request, Response } from 'express';

import store from '../../services/database/db';
import { find, select } from '../../services/database/slices/users';

import { User } from '../../../src/models/user';

const router = Router();

router.get('/user', (req: Request, res: Response) => {
  let id = req.query.id?.toString() || '';

  if (!id)
    return res.status(400).send('Bad Request');

  let user = find(store.getState(), (user: User) => user.id === id); 

  if (!user)
    return res.status(404).send('User Not Found');

  // omit hash property
  const { hash, ...u } = user;

  return res
    .status(200)
    .type('json')
    .json(u);
});

router.get('/users', (req: Request, res: Response) => {
  let ids = req.query.ids?.toString().split(',') || [];

  if (!ids)
    return res.status(400).send('Bad Request');

  let users = select(store.getState(), (user: User) => ids.includes(user.id)); 

  let us = users.map((user: User) => {
    // omit hash property
    const { hash, ...u } = user;

    return u;
  });

  return res
    .status(200)
    .type('json')
    .json(us);
});

router.get('/search', (req: Request, res: Response) => {
  let query = req.query.q?.toString() || '';

  if (!query)
    return res.status(400).send('Bad Request');

  let users = select(store.getState(), (user: User) => user.name.includes(query)); 

  let us = users.map((user: User) => {
    // omit hash property
    const { hash, ...u } = user;

    return u;
  });

  return res
    .status(200)
    .type('json')
    .json(us);
});

export default router;
