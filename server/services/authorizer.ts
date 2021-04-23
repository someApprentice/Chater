import { hash, verify } from 'argon2';

import { nanoid } from '@reduxjs/toolkit';

import store from './database/db';
import { insert, find } from './database/slices/users';

import { User } from '../../src/models/user';

export function push(user: User) {
  store.dispatch(insert(user));

  return { ...user } as User;
}

export async function registrate(email: string, name: string, password: string): Promise<User> {
  if (!!find(store.getState(), (user: User) => user.email === email))
    throw new Error('User with this email already exists');

  let h = await hash(password);

  let id = nanoid();

  let user: User = {
    id,
    email,
    name,
    hash: h
  };
  
  store.dispatch(insert(user));

  // TypeError: Cannot assign to read only property 'hash' of object '#<Object>'
  // return user;
  return { ...user } as User;
}

export async function login(email: string, password: string): Promise<User> {
  let user = find(store.getState(), (user: User) => user.email === email );

  if (!user || !await verify(user!.hash!, password))
    throw new Error('No matches found');

  // TypeError: Cannot assign to read only property 'hash' of object '#<Object>'
  // return user!;
  return { ...user! } as User;
}

export function authorize(payload: User): User {
  let user = find(store.getState(), (user: User) => user.id === payload.id);

  if (!user)
    throw new Error('User not found');

  // TypeError: Cannot assign to read only property 'hash' of object '#<Object>'
  // return user!;
  return { ...user! } as User;
}
