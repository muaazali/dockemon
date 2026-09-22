import { configureStore } from '@reduxjs/toolkit';
import containersReducer from './containersSlice';
import hostsReducer from './hostsSlice';
import hostStatsReducer from './hostStatsSlice';

export const store = configureStore({
  reducer: {
    containers: containersReducer,
    hosts: hostsReducer,
    hostStats: hostStatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
