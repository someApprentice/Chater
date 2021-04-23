import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

import { RootState } from '../db';

import { Dialog } from '../../../../src/models/dialog';

export type DialogsState = {
  dialogs: Dialog[]
};

const initialState: DialogsState = {
  dialogs: [] as Dialog[]
};

const slice = createSlice({
  name: 'dialogs',
  initialState,
  reducers: {
    insert(state: DialogsState, action: PayloadAction<Dialog>) {
      state.dialogs.push(action.payload);
    },
    update(state: DialogsState, action: PayloadAction<Dialog>) {
      let dialog = action.payload;

      if (state.dialogs.find((d: Dialog) => d.id === dialog.id)) {
        let key = state.dialogs.findIndex((d: Dialog) => d.id === dialog.id);

        state.dialogs[key] = dialog;
      }
    },
    concat(state: DialogsState, action: PayloadAction<Dialog[]>) {
      state.dialogs = state.dialogs.concat(action.payload);
    }
  }
});

export default slice.reducer;

export function select(
  state: RootState,
  selector: (dialog: Dialog) => boolean,
  sort: (a: Dialog, b: Dialog) => number = (a, b) => a.updated_at - b.updated_at,
  limit: number = 0
): Dialog[] {
  return state
    .dialogs
    .dialogs
    .filter(selector)
    .sort(sort)
    .slice(-limit);
}

export function find(state: RootState, selector: (dialog: Dialog) => boolean): Dialog | undefined {
  return state
    .dialogs
    .dialogs
    .find(selector);
}

export const { insert, update, concat } = slice.actions;
