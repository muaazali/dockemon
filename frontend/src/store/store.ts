import { configureStore } from '@reduxjs/toolkit';
import containersReducer from './containersSlice';
import hostsReducer from './hostsSlice';

export const store = configureStore({
  reducer: {
    containers: containersReducer,
    hosts: hostsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
