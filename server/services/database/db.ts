// For demonstration purposes, I have abstracted from database and
// implemented Redux storage as an in-memory database.

import { configureStore } from '@reduxjs/toolkit';

import usersReducer from './slices/users';
import dialogsReducer from './slices/dialogs';
import messagesReducer from './slices/messages';

const store = configureStore({
  reducer: {
    users: usersReducer,
    dialogs: dialogsReducer,
    messages: messagesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
