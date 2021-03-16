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
    }
  }
});

export default slice.reducer;

export const findById = (state: RootState, id: string): User | undefined => state.users.users.find((user: User) => user.id === id);
export const findByEmail = (state: RootState, email: string): User | undefined => state.users.users.find((user: User) => user.email === email);

export const { insert } = slice.actions;
