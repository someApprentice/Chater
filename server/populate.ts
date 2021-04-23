import { nanoid } from '@reduxjs/toolkit';

import { hash } from 'argon2';

import store from './services/database/db';

import { concat as concatUsers } from './services/database/slices/users';
import { concat as concatDialogs } from './services/database/slices/dialogs';
import { concat as concatMessages } from './services/database/slices/messages';

import { User } from '../src/models/user';
import { Dialog } from '../src/models/dialog';
import { Message } from '../src/models/message';

export async function populate() {
  let users: User[] = [] as User[];
  let dialogs: Dialog[] = [] as Dialog[];
  let messages: Message[] = [] as Message[];

  let user: User = {
    id: nanoid(),
    email: 'user@chater.com',
    name: 'User',
    hash: await hash('password')
  };
  
  users.push(user);

  const publicDialog: Dialog = {
    id: nanoid(),
    type: 'public',
    updated_at: (new Date()).getTime() / 1000,
    messages_count: 0
  };

  dialogs.push(publicDialog);

  // old public messages
  for (let i = 0; i < 60; i++) {
    let d = new Date();
    d = new Date(d.setDate(d.getDate() - 1));
    d = new Date(d.setHours(d.getHours() - 1));
    d = new Date(d.setSeconds(d.getSeconds() - i));

    let message: Message = {
      id: nanoid(),
      dialog: publicDialog.id,
      author: user.id,
      date: Math.floor(d.getTime() / 1000),
      content: "Old Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    } as Message;

    messages.push(message);

    publicDialog.messages_count++;
  }

  // public messages
  for (let i = 0; i < 20; i++) {
    let d = new Date();
    d = new Date(d.setDate(d.getDate() - 1));
    d = new Date(d.setSeconds(d.getSeconds() + i));

    let message: Message = {
      id: nanoid(),
      dialog: publicDialog.id,
      author: user.id,
      date: Math.floor(d.getTime() / 1000),
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    } as Message;

    messages.push(message);

    publicDialog.messages_count++;
  }

  // new public messages
  for (let i = 0; i < 60; i++) {
    let d = new Date();
    d = new Date(d.setDate(d.getDate() - 1));
    d = new Date(d.setHours(d.getHours() + 1));
    d = new Date(d.setSeconds(d.getSeconds() + i));

    let message: Message = {
      id: nanoid(),
      dialog: publicDialog.id,
      author: user.id,
      date: Math.floor(d.getTime() / 1000),
      content: "New Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    } as Message;

    messages.push(message);

    publicDialog.messages_count++;
  }

  for (let i = 0; i < 10; i++) {
    let u: User = {
      id: nanoid(),
      email: `u${ i }@chater.com`,
      name: `U${ i }`,
      hash: await hash('password')
    };

    users.push(u);

    let dialog: Dialog = {
      id: nanoid(),
      type: 'private',
      updated_at: (new Date()).getTime() / 1000,
      messages_count: 0,
      party: [ user.id, u.id ]
    };

    dialogs.push(dialog);

    // old private messages
    for (let i = 0; i < 60; i++) {
      let d = new Date();
      d = new Date(d.setDate(d.getDate() - 1));
      d = new Date(d.setHours(d.getHours() - 1));
      d = new Date(d.setSeconds(d.getSeconds() - i));

      let message: Message = {
        id: nanoid(),
        dialog: dialog.id,
        author: u.id,
        date: Math.floor(d.getTime() / 1000),
        content: "Old Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      } as Message;

      messages.push(message);

      dialog.messages_count++;
    }
    
    // private messages
    for (let i = 0; i < 20; i++) {
      let d = new Date();
      d = new Date(d.setDate(d.getDate() - 1));
      d = new Date(d.setSeconds(d.getSeconds() + i));

      let message: Message = {
        id: nanoid(),
        dialog: dialog.id,
        author: u.id,
        date: Math.floor(d.getTime() / 1000),
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      } as Message;

      messages.push(message);

      dialog.messages_count++;
    }

    // new private messages
    for (let i = 0; i < 60; i++) {
      let d = new Date();
      d = new Date(d.setDate(d.getDate() - 1));
      d = new Date(d.setHours(d.getHours() + 1));
      d = new Date(d.setSeconds(d.getSeconds() + i));

      let message: Message = {
        id: nanoid(),
        dialog: dialog.id,
        author: u.id,
        date: Math.floor(d.getTime() / 1000),
        content: "New Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      } as Message;

      messages.push(message);

      dialog.messages_count++;
    }
  }

  store.dispatch(concatUsers(users));
  store.dispatch(concatDialogs(dialogs));
  store.dispatch(concatMessages(messages));
}
