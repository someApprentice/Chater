import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import axios, { AxiosResponse } from 'axios';

import { User } from '../../models/user';

export type AuthError = {
  status: number,
  data: any
};

export type AuthState = {
  isAuthenticated: boolean,
  user?: User
  isPending: boolean;
  error?: AuthError
};

const initialState: AuthState = {
  isAuthenticated: false,
  isPending: false
};

export const login = createAsyncThunk<
  User,
  { email: string, password: string },
  { rejectValue: AuthError }
>(
  'auth/login',
  async (arg: { email: string, password: string }, { rejectWithValue }) => {
    let email = arg.email;
    let password = arg.password;

    let response: AxiosResponse;

    try {
      response = await axios.post<User>('/api/auth/login', { email, password });
    } catch (err) {
      return rejectWithValue({
        status: err.response.status,
        data: err.response.data
      });
    }

    return response.data;
  }
);

export const registrate = createAsyncThunk<
  User,
  { email: string, name: string, password: string },
  { rejectValue: AuthError }
>(
  'auth/registrate',
  async (arg: { email: string, name: string, password: string }, { rejectWithValue }) => {
    let email = arg.email;
    let name = arg.name;
    let password = arg.password;

    let response: AxiosResponse;

    try {
      response = await axios.post<User>('/api/auth/registrate', { email, name, password });
    } catch (err) {
      return rejectWithValue({
        status: err.response.status,
        data: err.response.data
      });
    }

    return response.data;
  }
);

export const logout = createAsyncThunk<
  undefined,
  undefined,
  { rejectValue: AuthError }
>(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    // https://stackoverflow.com/a/64799136/12948018
    let { auth } = getState() as { auth: AuthState };

    if (!auth.user)
      throw new Error('You are not authenticated');

    let hash = auth.user!.hash!;

    let response: AxiosResponse;

    try {
      response = await axios.post<string>('/api/auth/logout', null, { headers: { Authorization: `Bearer ${ hash }` }, withCredentials: true });
    } catch (err) {
      return rejectWithValue({
        status: err.response.status,
        data: err.response.data
      });
    }

    return response.data;
  }
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticate(state: AuthState, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    deauthenticate(state: AuthState) {
      state.isAuthenticated = false;
      state.user = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state: AuthState) => {
      state.isPending = true;
    });

    builder.addCase(login.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isPending = false;
    });
    
    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(login.rejected, (state: AuthState, { payload }) => {
      state.error = payload;
      state.isPending = false;
    });

    builder.addCase(registrate.pending, (state: AuthState) => {
      state.isPending = true;
    });

    builder.addCase(registrate.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isPending = false;
    });
    
    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(registrate.rejected, (state: AuthState, { payload }) => {
      state.error = payload;
      state.isPending = false;
    });

    builder.addCase(logout.pending, (state: AuthState) => {
      state.isPending = true;
    });

    builder.addCase(logout.fulfilled, (state: AuthState) => {
      state.isAuthenticated = false;
      state.user = undefined;
      state.isPending = false;
    });
    
    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(logout.rejected, (state: AuthState, { payload }) => {
      state.error = payload;
      state.isPending = false;
    });
  }
});

export default slice.reducer;

export const { authenticate, deauthenticate } = slice.actions;
