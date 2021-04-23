import { User } from './user';

export type Dialog = {
  id: string,
  type: 'public' | 'private'
  updated_at: number,
  messages_count: number,
  party?: string[]
};
