import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { GetHostStats } from '../../wailsjs/go/bindings/HostStatsBindings';
import { models } from '../../wailsjs/go/models';

const HISTORY_LIMIT = 40;

export interface HostStatsHistory {
  cpu: number[];
  memory: number[];
}

export interface HostStatsState {
  byHostId: Record<
    string,
    {
      stats: models.HostStats | null;
      history: HostStatsHistory;
      status: 'idle' | 'loading' | 'succeeded' | 'failed';
      error: string | null;
      lastUpdated: number | null;
    }
  >;
}

const initialState: HostStatsState = {
  byHostId: {},
};

function emptyHostState() {
  return {
    stats: null,
    history: { cpu: [], memory: [] } as HostStatsHistory,
    status: 'idle' as const,
    error: null,
    lastUpdated: null,
  };
}

function pushSample(history: number[], value: number): number[] {
  const next = history.length >= HISTORY_LIMIT ? history.slice(history.length - HISTORY_LIMIT + 1) : history.slice();
  next.push(value);
  return next;
}

export const fetchHostStats = createAsyncThunk('hostStats/fetch', async (hostId: string) => {
  const stats = await GetHostStats(hostId);
  return { hostId, stats };
});

const hostStatsSlice = createSlice({
  name: 'hostStats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostStats.pending, (state, action) => {
        const hostId = action.meta.arg;
        const hostState = (state.byHostId[hostId] ??= emptyHostState());
        if (hostState.status === 'idle') hostState.status = 'loading';
      })
      .addCase(
        fetchHostStats.fulfilled,
        (state, action: PayloadAction<{ hostId: string; stats: models.HostStats }>) => {
          const { hostId, stats } = action.payload;
          const hostState = (state.byHostId[hostId] ??= emptyHostState());
          hostState.stats = stats;
          hostState.history.cpu = pushSample(hostState.history.cpu, stats.CPUUsagePercent);
          hostState.history.memory = pushSample(hostState.history.memory, stats.MemoryUsedPercent);
          hostState.status = 'succeeded';
          hostState.error = null;
          hostState.lastUpdated = Date.now();
        }
      )
      .addCase(fetchHostStats.rejected, (state, action) => {
        const hostId = action.meta.arg;
        const hostState = (state.byHostId[hostId] ??= emptyHostState());
        hostState.status = 'failed';
        hostState.error = action.error.message ?? 'Failed to fetch host stats';
      });
  },
});

export default hostStatsSlice.reducer;
