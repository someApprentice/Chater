import { nanoid } from '@reduxjs/toolkit';

import { hash } from 'argon2';

import store from './services/database/db';

import { generate } from './services/avatar';

import { concat as concatUsers } from './services/database/slices/users';
import { concat as concatDialogs } from './services/database/slices/dialogs';
import { concat as concatMessages } from './services/database/slices/messages';

import { User } from '../src/models/user';
import { Dialog } from '../src/models/dialog';
import { Message } from '../src/models/message';

import ChatGPT_GENERATED_USERS from './ChatGPT_generated_users.json';
import ChatGPT_GENERATED_MESSAGES from './ChatGPT_generated_messages.json';


export async function populate() {
  let users: User[] = [] as User[];
  let dialogs: Dialog[] = [] as Dialog[];
  let messages: Message[] = [] as Message[];

  let id = nanoid();

  let avatar = await generate(250, 250, id);

  let user: User = {
    id,
    email: 'user@chater.com',
    name: 'User',
    hash: await hash('password'),
    avatar
  };
  
  users.push(user);

  const publicDialog: Dialog = {
    id: nanoid(),
    type: 'public',
    updated_at: (new Date()).getTime() / 1000,
    messages_count: 0
  };

  dialogs.push(publicDialog);

  for (let u of ChatGPT_GENERATED_USERS) {
    let id = nanoid();

    let avatar = await generate(250, 250, id);

    let user: User = {
      id,
      email: `${u}@chater.com`,
      name: u,
      hash: await hash('password'),
      avatar
    };

    users.push(user);
  }

  let days = ChatGPT_GENERATED_MESSAGES.length;

  for (let conversation of ChatGPT_GENERATED_MESSAGES) {
    for (let i in conversation.messages) {
      let d = new Date();
      d = new Date(d.setDate(d.getDate() - (days - conversation.day)));
      d = new Date(d.setSeconds(d.getSeconds() - (conversation.messages.length - Number(i))));

      let u = users.find(u => u.name == conversation.messages[i].author);

      let message: Message = {
        id: nanoid(),
        dialog: publicDialog.id,
        author: u!.id,
        date: Math.floor(d.getTime() / 1000),
        content: conversation.messages[i].content
      } as Message;

      messages.push(message);

      publicDialog.messages_count++;
    }
  }


  for (let i = 0; i < 10; i++) {
    let id = nanoid();

    let avatar = await generate(250, 250, id);

    let u: User = {
      id,
      email: `u${ i }@chater.com`,
      name: `U${ i }`,
      hash: await hash('password'),
      avatar
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
