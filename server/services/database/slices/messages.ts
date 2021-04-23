import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../db';

import { Message } from '../../../../src/models/message';

export type MessagesState = {
  messages: Message[]
};

const initialState: MessagesState = {
  messages: [] as Message[]
};

const slice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    insert(state: MessagesState, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    concat(state: MessagesState, action: PayloadAction<Message[]>) {
      state.messages = state.messages.concat(action.payload);
    }
  }
});

export default slice.reducer;

export function select(
  state: RootState,
  selector: (message: Message) => boolean,
  sort: (a: Message, b: Message) => number = (a, b) => a.date - b.date,
  limit: number = 20
): Message[] {
  return state
    .messages
    .messages
    .filter(selector)
    .sort(sort)
    .slice(-limit);
}

export const { insert, concat } = slice.actions;
