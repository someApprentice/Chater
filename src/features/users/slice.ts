import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import axios, { AxiosResponse, AxiosError } from 'axios';

import { User } from '../../models/user';

export type FetchError = {
  status: number,
  data: any
};

export type UsersState = {
  users: User[],
  isPending: boolean,
  error?: FetchError
};

export const getUser = createAsyncThunk<
  User,
  { id: string },
  { rejectValue: FetchError }
>(
  'users/getUser',
  async (arg: { id: string }, { rejectWithValue }) => {
    let id = arg.id;

    let response: AxiosResponse;

    try {
      response = await axios.get<User>('/api/users/user', { params: { id } });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          status: (err as AxiosError).response!.status as number,
          data: (err as AxiosError).response!.data as string
        });
      }

      return rejectWithValue({
        status: 500,
        data: err
      });
    }

    return response.data;
  }
);

export const getUsers = createAsyncThunk<
  User[],
  { ids: string[] },
  { rejectValue: FetchError }
>(
  'users/getUsers',
  async (arg: { ids: string[] }, { rejectWithValue }) => {
    let ids = arg.ids.join();

    let response: AxiosResponse;

    try {
      response = await axios.get<User>('/api/users/users', { params: { ids } });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          status: (err as AxiosError).response!.status as number,
          data: (err as AxiosError).response!.data as string
        });
      }

      return rejectWithValue({
        status: 500,
        data: err
      });
    }

    return response.data;
  }
);

const initialState: UsersState = {
  users: [] as User[],
  isPending: false,
};

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    push(state: UsersState, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },
    pushUsers(state: UsersState, action: PayloadAction<User[]>) {
      let users = action.payload;

      users.map((user: User) => {
        let found = !!state.users.find((u: User) => u.id === user.id);

        if (found) {
          let key = state.users.findIndex((u: User) => u.id === user.id);

          state.users[key] = user;
        }

        if (!found) {
          state.users.push(user);
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getUser.pending, (state: UsersState) => {
      state.isPending = true;
    });

    builder.addCase(getUser.fulfilled, (state: UsersState, action: PayloadAction<User>) => {
      let user = action.payload;

      let found = !!state.users.find((u: User) => u.id === user.id);

      if (found) {
        let key = state.users.findIndex((u: User) => u.id === user.id);

        state.users[key] = user;
      }

      if (!found) {
        state.users.push(user);
      }

      state.isPending = false;
    });
    
    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(getUser.rejected, (state: UsersState, { payload }) => {
      state.error = payload;
      state.isPending = false;
    });

    builder.addCase(getUsers.pending, (state: UsersState) => {
      state.isPending = true;
    });

    builder.addCase(getUsers.fulfilled, (state: UsersState, action: PayloadAction<User[]>) => {
      let users = action.payload;

      users.map((user: User) => {
        let found = !!state.users.find((u: User) => u.id === user.id);

        if (found) {
          let key = state.users.findIndex((u: User) => u.id === user.id);

          state.users[key] = user;
        }

        if (!found) {
          state.users.push(user);
        }
      });

      state.isPending = false;
    });
    
    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(getUsers.rejected, (state: UsersState, { payload }) => {
      state.error = payload;
      state.isPending = false;
    });
  }
});

export default slice.reducer;

export const { push, pushUsers } = slice.actions;
