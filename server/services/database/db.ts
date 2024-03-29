// For demonstration purposes, I decided not to use external databases
// and implement a standalone in-memory database using Redux state as the storage.

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
