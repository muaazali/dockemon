import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  GetDetailedDockerImagesData,
  StartDockerContainer,
  StopDockerContainer,
  RestartDockerContainer,
} from '../../wailsjs/go/bindings/DockerCommandBindings';
import { models } from '../../wailsjs/go/models';

export type ContainerAction = 'start' | 'stop' | 'restart';

export interface HostContainersState {
  byId: Record<string, models.DockerContainerData>;
  allIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastUpdated: number | null;
}

export interface ContainersState {
  byHostId: Record<string, HostContainersState>;
  pendingActions: Record<string, ContainerAction>;
}

const initialState: ContainersState = {
  byHostId: {},
  pendingActions: {},
};

function emptyHostState(): HostContainersState {
  return { byId: {}, allIds: [], status: 'idle', error: null, lastUpdated: null };
}

function pendingKey(hostId: string, containerId: string): string {
  return `${hostId}:${containerId}`;
}

type ContainerActionArgs = { containerId: string; hostId: string };

export const fetchContainers = createAsyncThunk('containers/fetch', async (hostId: string) => {
  const containers = await GetDetailedDockerImagesData(hostId);
  return { hostId, containers };
});

export const startContainer = createAsyncThunk(
  'containers/start',
  async ({ containerId, hostId }: ContainerActionArgs) => {
    const success = await StartDockerContainer(containerId, hostId);
    return { containerId, hostId, success };
  }
);

export const stopContainer = createAsyncThunk(
  'containers/stop',
  async ({ containerId, hostId }: ContainerActionArgs) => {
    const success = await StopDockerContainer(containerId, hostId);
    return { containerId, hostId, success };
  }
);

export const restartContainer = createAsyncThunk(
  'containers/restart',
  async ({ containerId, hostId }: ContainerActionArgs) => {
    const success = await RestartDockerContainer(containerId, hostId);
    return { containerId, hostId, success };
  }
);

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
      .addCase(fetchContainers.pending, (state, action) => {
        const hostId = action.meta.arg;
        const hostState = (state.byHostId[hostId] ??= emptyHostState());
        if (hostState.status === 'idle') hostState.status = 'loading';
      })
      .addCase(
        fetchContainers.fulfilled,
        (state, action: PayloadAction<{ hostId: string; containers: models.DockerContainerData[] }>) => {
          const { hostId, containers } = action.payload;
          const hostState = (state.byHostId[hostId] ??= emptyHostState());
          const incoming = containers ?? [];
          const nextIds: string[] = [];
          const nextById: Record<string, models.DockerContainerData> = {};
          let changed = incoming.length !== hostState.allIds.length;

          for (const item of incoming) {
            const existing = hostState.byId[item.ID];
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
              if (nextIds[i] !== hostState.allIds[i]) {
                changed = true;
                break;
              }
            }
          }

          if (changed) {
            hostState.byId = nextById;
            hostState.allIds = nextIds;
          }
          hostState.status = 'succeeded';
          hostState.error = null;
          hostState.lastUpdated = Date.now();
        }
      )
      .addCase(fetchContainers.rejected, (state, action) => {
        const hostId = action.meta.arg;
        const hostState = (state.byHostId[hostId] ??= emptyHostState());
        hostState.status = 'failed';
        hostState.error = action.error.message ?? 'Failed to fetch containers';
      })
      .addCase(startContainer.pending, (state, action) => {
        state.pendingActions[pendingKey(action.meta.arg.hostId, action.meta.arg.containerId)] = 'start';
      })
      .addCase(startContainer.fulfilled, (state, action) => {
        delete state.pendingActions[pendingKey(action.payload.hostId, action.payload.containerId)];
      })
      .addCase(startContainer.rejected, (state, action) => {
        delete state.pendingActions[pendingKey(action.meta.arg.hostId, action.meta.arg.containerId)];
      })
      .addCase(stopContainer.pending, (state, action) => {
        state.pendingActions[pendingKey(action.meta.arg.hostId, action.meta.arg.containerId)] = 'stop';
      })
      .addCase(stopContainer.fulfilled, (state, action) => {
        delete state.pendingActions[pendingKey(action.payload.hostId, action.payload.containerId)];
      })
      .addCase(stopContainer.rejected, (state, action) => {
        delete state.pendingActions[pendingKey(action.meta.arg.hostId, action.meta.arg.containerId)];
      })
      .addCase(restartContainer.pending, (state, action) => {
        state.pendingActions[pendingKey(action.meta.arg.hostId, action.meta.arg.containerId)] = 'restart';
      })
      .addCase(restartContainer.fulfilled, (state, action) => {
        delete state.pendingActions[pendingKey(action.payload.hostId, action.payload.containerId)];
      })
      .addCase(restartContainer.rejected, (state, action) => {
        delete state.pendingActions[pendingKey(action.meta.arg.hostId, action.meta.arg.containerId)];
      });
  },
});

export default containersSlice.reducer;
