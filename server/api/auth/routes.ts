import { Router, Request, Response } from 'express';

import { sign } from 'jsonwebtoken';

import * as yup from 'yup';

import { registrate, login } from '../../services/authorizer';

import passport from '../../services/passport';

import { User } from '../../../src/models/user';

const router = Router();

const SECRET = process.env.SECRET;

router.post('/registrate', async (req: Request, res: Response) => {
  let email = req.body.email.toLowerCase();
  let name = req.body.name;
  let password = req.body.password;

  let schema = yup.object().shape({
    email: yup.string().email().required(),
    name: yup.string().required(),
    password: yup.string().required()
  });
  
  if (!await schema.isValid({ email, name, password }))
    return res.status(400).send('Bad Request');

  let user: User;

  try {
    user = await registrate(email, name, password);
  } catch (err) {
    if (err && err.stack && err.message) 
      return res.status(400).send(`Bad Request: ${ err.message }`);
    
    return res.sendStatus(500);
  }

  let date = new Date();
  let expires = new Date(date.setMonth(date.getMonth() + 1));

  let hash = sign(user, SECRET!, { expiresIn: expires.getTime() - new Date().getTime() });

  user.hash = hash;

  /* @TODO Set secure flag in production mode (SSL) */
  res.cookie('id', user.id, { expires, secure: false, httpOnly: true });
  res.cookie('email', user.email, { expires, secure: false, httpOnly: true });
  res.cookie('name', user.name, { expires, secure: false, httpOnly: true });
  res.cookie('hash', user.hash, { expires, secure: false, httpOnly: true });

  return res
    .status(200)
    .type('json')
    .json(user);
});

router.post('/login', async (req: Request, res: Response) => {
  let email = req.body.email.toLowerCase();
  let password = req.body.password;

  let schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required()
  });

  if (!await schema.isValid({ email, password }))
    return res.status(400).send('Bad Request');

  let user: User;

  try {
    user = await login(email, password);
  } catch (err) {
    if (err && err.stack && err.message)
      return res.status(404).send(err.message);

    return res.sendStatus(500);
  }

  let date = new Date();
  let expires = new Date(date.setMonth(date.getMonth() + 1));

  let hash = sign(user, SECRET!, { expiresIn: expires.getTime() - new Date().getTime() });

  user.hash = hash;

  /* @TODO Set secure flag in production mode (SSL) */
  res.cookie('id', user.id, { expires, secure: false, httpOnly: true });
  res.cookie('email', user.email, { expires, secure: false, httpOnly: true });
  res.cookie('name', user.name, { expires, secure: false, httpOnly: true });
  res.cookie('hash', user.hash, { expires, secure: false, httpOnly: true });

  return res
    .status(200)
    .type('json')
    .json(user);
});

router.post('/logout', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
  res.clearCookie('id');
  res.clearCookie('email');
  res.clearCookie('name');
  res.clearCookie('hash');

  return res.sendStatus(200);
});

export default router;
