// For demonstration purposes, I have abstracted from database and
// implemented Redux storage as an in-memory database.

import { configureStore } from '@reduxjs/toolkit';

import usersReducer from './slices/users';

const store = configureStore({
  reducer: {
    users: usersReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
