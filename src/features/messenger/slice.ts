import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { RootState } from '../../store';

import axios, { AxiosResponse, AxiosError } from 'axios';

import { Dialog } from '../../models/dialog';
import { Message } from '../../models/message';

export type FetchError = {
  status: number,
  data: any
};

export type MessengerState = {
  dialogs: Dialog[],
  messages: Message[]
  isDialogPending: boolean,
  isDialogsPending: boolean,
  isMessagesPending: boolean,
  error?: FetchError
};

export const getPublicDialog = createAsyncThunk<
  Dialog,
  undefined,
  { rejectValue: FetchError }
>(
  'messenger/getPublicDialog',
  async (_, { rejectWithValue }) => {
    let response: AxiosResponse;

    try {
      response = await axios.get<Dialog>('/api/messenger/dialog/public');
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

export const getPrivateDialog = createAsyncThunk<
  Dialog,
  { id: string },
  { rejectValue: FetchError }
>(
  'messenger/getPrivateDialog',
  async (arg: { id: string }, { getState, rejectWithValue }) => {
    let user = (getState() as RootState).auth.user;

    let params = arg;

    let response: AxiosResponse;

    try {
      response = await axios.get<Dialog>('/api/messenger/dialog/private', { params, headers: { Authorization: `Bearer ${ user!.hash! }` } });
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

export const getDialog = createAsyncThunk<
  Dialog,
  { id: string },
  { rejectValue: FetchError }
>(
  'messenger/getDialog',
  async (arg: { id: string }, { rejectWithValue }) => {
    let params = arg;

    let response: AxiosResponse;

    try {
      response = await axios.get<Dialog>('/api/messenger/dialog', { params });
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

export const getPrivateDialogs = createAsyncThunk<
  Dialog[],
  undefined,
  { rejectValue: FetchError }
>(
  'messenger/getPrivateDialogs',
  async (_, { getState, rejectWithValue }) => {
    let user = (getState() as RootState).auth.user;

    let response: AxiosResponse;

    try {
      response = await axios.get<Dialog>('/api/messenger/dialogs/private', { headers: { Authorization: `Bearer ${ user!.hash! }` } });
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

export const getMessages = createAsyncThunk<
  Message[],
  { id: string, date?: number },
  { rejectValue: FetchError }
>(
  'messenger/getMessages',
  async (arg: { id: string, date?: number }, { rejectWithValue }) => {
    let params = arg;

    let response: AxiosResponse;

    try {
      response = await axios.get<Message[]>('/api/messenger/messages', { params });
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

const initialState: MessengerState = {
  dialogs: [] as Dialog[],
  messages: [] as Message[],
  isDialogPending: false,
  isDialogsPending: false,
  isMessagesPending: false,
};

const slice = createSlice({
  name: 'messenger',
  initialState,
  reducers: {
    pushDialog(state: MessengerState, action: PayloadAction<Dialog>) {
      let dialog = action.payload;

      let found = !!state.dialogs.find((d: Dialog) => d.id === dialog.id);

      if (found) {
        let key = state.dialogs.findIndex((d: Dialog) => d.id === dialog.id);

        state.dialogs[key] = dialog;
      }

      if (!found) {
        state.dialogs.push(dialog);
      }
    },
    pushMessage(state: MessengerState, action: PayloadAction<Message>) {
      let message = action.payload;

      let found = !!state.messages.find((m: Message) => m.id === message.id);

      if (found) {
        let key = state.messages.findIndex((m: Message) => m.id === message.id);

        state.messages[key] = message;
      }

      if (!found) {
        state.messages.push(message);
      }
    },
    reset(state: MessengerState) {
      let publicDialog = state.dialogs.find((dialog: Dialog) => dialog.type === 'public')!;

      let publicMessages = state.messages.filter((message: Message) => message.dialog === publicDialog!.id);

      return {
        ...initialState,
        dialogs: [ publicDialog ],
        messages: publicMessages
      };
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getPublicDialog.pending, (state: MessengerState) => {
      state.isDialogPending = true;
    });

    builder.addCase(getPublicDialog.fulfilled, (state: MessengerState, action: PayloadAction<Dialog>) => {
      let dialog = action.payload;

      let found = !!state.dialogs.find((d: Dialog) => d.id === dialog.id);

      if (found) {
        let key = state.dialogs.findIndex((d: Dialog) => d.id === dialog.id);

        state.dialogs[key] = dialog;
      }

      if (!found) {
        state.dialogs.push(dialog);
      }

      state.isDialogPending = false;
    });

    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(getPublicDialog.rejected, (state: MessengerState, { payload }) => {
      state.error = payload;
      state.isDialogPending = false;
    });

    builder.addCase(getPrivateDialog.pending, (state: MessengerState) => {
      state.isDialogPending = true;
    });

    builder.addCase(getPrivateDialog.fulfilled, (state: MessengerState, action: PayloadAction<Dialog>) => {
      let dialog = action.payload;

      let found = !!state.dialogs.find((d: Dialog) => d.id === dialog.id);

      if (found) {
        let key = state.dialogs.findIndex((d: Dialog) => d.id === dialog.id);

        state.dialogs[key] = dialog;
      }

      if (!found) {
        state.dialogs.push(dialog);
      }

      state.isDialogPending = false;
    });

    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(getPrivateDialog.rejected, (state: MessengerState, { payload }) => {
      state.error = payload;
      state.isDialogPending = false;
    });

    builder.addCase(getDialog.pending, (state: MessengerState) => {
      state.isDialogPending = true;
    });

    builder.addCase(getDialog.fulfilled, (state: MessengerState, action: PayloadAction<Dialog>) => {
      let dialog = action.payload;

      let found = !!state.dialogs.find((d: Dialog) => d.id === dialog.id);

      if (found) {
        let key = state.dialogs.findIndex((d: Dialog) => d.id === dialog.id);

        state.dialogs[key] = dialog;
      }

      if (!found) {
        state.dialogs.push(dialog);
      }

      state.isDialogPending = false;
    });

    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(getDialog.rejected, (state: MessengerState, { payload }) => {
      state.error = payload;
      state.isDialogPending = false;
    });

    builder.addCase(getPrivateDialogs.pending, (state: MessengerState) => {
      state.isDialogsPending = true;
    });

    builder.addCase(getPrivateDialogs.fulfilled, (state: MessengerState, action: PayloadAction<Dialog[]>) => {
      let dialogs = action.payload;

      dialogs.map((dialog: Dialog) => {
        let found = !!state.dialogs.find((d: Dialog) => d.id === dialog.id);

        if (found) {
          let key = state.dialogs.findIndex((d: Dialog) => d.id === dialog.id);

          state.dialogs[key] = dialog;
        }

        if (!found) {
          state.dialogs.push(dialog);
        }
      });

      state.isDialogsPending = false;
    });

    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(getPrivateDialogs.rejected, (state: MessengerState, { payload }) => {
      state.error = payload;
      state.isDialogsPending = false;
    });

    builder.addCase(getMessages.pending, (state: MessengerState) => {
      state.isMessagesPending = true;
    });

    builder.addCase(getMessages.fulfilled, (state: MessengerState, action: PayloadAction<Message[]>) => {
      let messages = action.payload;

      messages.map((message: Message) => {
        let found = !!state.messages.find((m: Message) => m.id === message.id);

        if (found) {
          let key = state.messages.findIndex((m: Message) => m.id === message.id);

          state.messages[key] = message;
        }

        if (!found) {
          state.messages.push(message);
        }
      });

      state.isMessagesPending = false;
    });

    // How to assign type to payload?
    // https://github.com/reduxjs/redux-toolkit/blob/master/src/createAsyncThunk.ts#L340-L353
    builder.addCase(getMessages.rejected, (state: MessengerState, { payload }) => {
      state.error = payload;
      state.isMessagesPending = false;
    });
  }
});

export default slice.reducer;

export const { pushDialog, pushMessage, reset } = slice.actions;
