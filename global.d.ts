import { UsersState } from './src/features/users/slice';

declare global {
  interface Window {
    PRELOADED_STATE?: {
      users: UsersState
    }
  }
}
