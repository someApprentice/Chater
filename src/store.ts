import { configureStore } from '@reduxjs/toolkit';

import authReducer from './features/auth/slice';
import usersReducer from './features/users/slice';
import messengerReducer from './features/messenger/slice';

const preloadedState = eval(`(${ window.PRELOADED_STATE })`);

delete window.PRELOADED_STATE;

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    messenger: messengerReducer
  },
  preloadedState
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
