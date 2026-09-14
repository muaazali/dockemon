import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  GetDetailedDockerImagesData,
  StartDockerContainer,
  StopDockerContainer,
  RestartDockerContainer,
} from '../../wailsjs/go/bindings/DockerCommandBindings';
import { models } from '../../wailsjs/go/models';

export type ContainerAction = 'start' | 'stop' | 'restart';

export interface ContainersState {
  byId: Record<string, models.DockerContainerData>;
  allIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastUpdated: number | null;
  pendingActions: Record<string, ContainerAction>;
}

const initialState: ContainersState = {
  byId: {},
  allIds: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
  pendingActions: {},
};

export const fetchContainers = createAsyncThunk('containers/fetch', async () => {
  return GetDetailedDockerImagesData();
});

export const startContainer = createAsyncThunk('containers/start', async (containerId: string) => {
  const success = await StartDockerContainer(containerId);
  return { containerId, success };
});

export const stopContainer = createAsyncThunk('containers/stop', async (containerId: string) => {
  const success = await StopDockerContainer(containerId);
  return { containerId, success };
});

export const restartContainer = createAsyncThunk('containers/restart', async (containerId: string) => {
  const success = await RestartDockerContainer(containerId);
  return { containerId, success };
});

// Cheap structural equality check for flat container records to preserve object identity when unchanged
function isSameContainer(a: models.DockerContainerData, b: models.DockerContainerData): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const containersSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContainers.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading';
      })
      .addCase(
        fetchContainers.fulfilled,
        (state, action: PayloadAction<models.DockerContainerData[]>) => {
          const incoming = action.payload ?? [];
          const nextIds: string[] = [];
          const nextById: Record<string, models.DockerContainerData> = {};
          let changed = incoming.length !== state.allIds.length;

          for (const item of incoming) {
            const existing = state.byId[item.ID];
            if (existing && isSameContainer(existing, item)) {
              nextById[item.ID] = existing;
            } else {
              nextById[item.ID] = item;
              changed = true;
            }
            nextIds.push(item.ID);
          }

          if (!changed) {
            for (let i = 0; i < nextIds.length; i++) {
              if (nextIds[i] !== state.allIds[i]) {
                changed = true;
                break;
              }
            }
          }

          if (changed) {
            state.byId = nextById;
            state.allIds = nextIds;
          }
          state.status = 'succeeded';
          state.error = null;
          state.lastUpdated = Date.now();
        }
      )
      .addCase(fetchContainers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch containers';
      })
      .addCase(startContainer.pending, (state, action) => {
        state.pendingActions[action.meta.arg] = 'start';
      })
      .addCase(startContainer.fulfilled, (state, action) => {
        delete state.pendingActions[action.payload.containerId];
      })
      .addCase(startContainer.rejected, (state, action) => {
        delete state.pendingActions[action.meta.arg];
      })
      .addCase(stopContainer.pending, (state, action) => {
        state.pendingActions[action.meta.arg] = 'stop';
      })
      .addCase(stopContainer.fulfilled, (state, action) => {
        delete state.pendingActions[action.payload.containerId];
      })
      .addCase(stopContainer.rejected, (state, action) => {
        delete state.pendingActions[action.meta.arg];
      })
      .addCase(restartContainer.pending, (state, action) => {
        state.pendingActions[action.meta.arg] = 'restart';
      })
      .addCase(restartContainer.fulfilled, (state, action) => {
        delete state.pendingActions[action.payload.containerId];
      })
      .addCase(restartContainer.rejected, (state, action) => {
        delete state.pendingActions[action.meta.arg];
      });
  },
});

export default containersSlice.reducer;
