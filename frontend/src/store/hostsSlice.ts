import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { AddHost, GetHosts } from '../../wailsjs/go/bindings/HostBindings';
import { models } from '../../wailsjs/go/models';

export interface HostsState {
  byId: Record<string, models.Host>;
  allIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: HostsState = {
  byId: {},
  allIds: [],
  status: 'idle',
  error: null,
};

export const fetchHosts = createAsyncThunk('hosts/fetch', async () => {
  return GetHosts();
});

export const addHost = createAsyncThunk('hosts/add', async (host: models.Host) => {
  const success = await AddHost(host);
  if (!success) {
    throw new Error('Unable to add host');
  }
  return host;
});

const hostsSlice = createSlice({
  name: 'hosts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHosts.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading';
      })
      .addCase(fetchHosts.fulfilled, (state, action: PayloadAction<models.Host[]>) => {
        const incoming = action.payload ?? [];
        state.byId = {};
        state.allIds = [];
        for (const host of incoming) {
          state.byId[host.ID] = host;
          state.allIds.push(host.ID);
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchHosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch hosts';
      })
      .addCase(addHost.fulfilled, (state, action: PayloadAction<models.Host>) => {
        const host = action.payload;
        if (!state.byId[host.ID]) {
          state.allIds.push(host.ID);
        }
        state.byId[host.ID] = host;
      });
  },
});

export default hostsSlice.reducer;
