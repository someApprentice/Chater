import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../db';

import { User } from '../../../../src/models/user';

export type UsersState = {
  users: User[]
};

const initialState: UsersState = {
  users: [] as User[]
};

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    insert(state: UsersState, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },
    concat(state: UsersState, action: PayloadAction<User[]>) {
      state.users = state.users.concat(action.payload);
    }
  }
});

export default slice.reducer;

export function find(state: RootState, selector: (user: User) => boolean): User | undefined {
  return state
    .users
    .users
    .find(selector);
}

export function select(
  state: RootState,
  selector: (user: User) => boolean,
  limit: number = 0
): User[] {
  return state
    .users
    .users
    .filter(selector)
    .slice(-limit);
}

export const { insert, concat } = slice.actions;
