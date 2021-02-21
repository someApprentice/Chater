import { configureStore } from '@reduxjs/toolkit';

const preloadedState = eval(`(${ window.PRELOADED_STATE })`);

delete window.PRELOADED_STATE;

const store = configureStore({
  reducer: {

  },
  preloadedState
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
