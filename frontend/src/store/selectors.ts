import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { HostContainersState } from './containersSlice';
import type { HostStatsHistory } from './hostStatsSlice';
import { models } from '../../wailsjs/go/models';

const selectContainersState = (state: RootState) => state.containers;

const EMPTY_HOST_CONTAINERS_STATE: HostContainersState = {
  byId: {},
  allIds: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
};

const selectHostContainersRecord = createSelector(
  [selectContainersState, (_state: RootState, hostId: string) => hostId],
  (containers, hostId) => containers.byHostId[hostId] ?? EMPTY_HOST_CONTAINERS_STATE
);

export const selectContainersByHost = createSelector(
  [selectHostContainersRecord],
  (hostState) => hostState.allIds.map((id) => hostState.byId[id])
);

export const selectHostContainersStatus = createSelector(
  [selectHostContainersRecord],
  (hostState) => hostState.status
);

export const selectHostContainersError = createSelector(
  [selectHostContainersRecord],
  (hostState) => hostState.error
);

export const selectContainerPendingAction = createSelector(
  [selectContainersState, (_state: RootState, hostId: string, containerId: string) => `${hostId}:${containerId}`],
  (containers, key) => containers.pendingActions[key]
);

export const selectContainerById = createSelector(
  [
    (state: RootState, hostId: string) => selectContainersByHost(state, hostId),
    (_state: RootState, _hostId: string, containerId: string | undefined) => containerId,
  ],
  (containers, containerId) => containers.find((container) => container.ID === containerId)
);

// Containers without a compose project are treated as their own project, identified by container name
function getEffectiveProjectId(container: models.DockerContainerData): string {
  return container.ComposeProjectTitle || container.RepoTitle;
}

export const selectContainersByProject = createSelector(
  [
    (state: RootState, hostId: string) => selectContainersByHost(state, hostId),
    (_state: RootState, _hostId: string, projectId: string | null) => projectId,
  ],
  (containers, projectId) =>
    projectId ? containers.filter((container) => getEffectiveProjectId(container) === projectId) : containers
);

export type ProjectGroup = {
  title: string;
  projectId: string;
  imageCount: number;
  runningCount: number;
  stoppedCount: number;
};

const selectHostsState = (state: RootState) => state.hosts;

export const selectAllHosts = createSelector(
  [selectHostsState],
  (hosts) => hosts.allIds.map((id) => hosts.byId[id])
);

export const selectHostsStatus = createSelector(
  [selectHostsState],
  (hosts) => hosts.status
);

export const selectProjectGroups = createSelector([selectContainersByHost], (containers) => {
  const groups = new Map<string, { imageCount: number; runningCount: number }>();
  for (const container of containers) {
    const projectId = getEffectiveProjectId(container);
    const existing = groups.get(projectId) ?? { imageCount: 0, runningCount: 0 };
    groups.set(projectId, {
      imageCount: existing.imageCount + 1,
      runningCount: existing.runningCount + (container.IsRunning ? 1 : 0),
    });
  }
  return Array.from(groups.entries()).map(([projectId, { imageCount, runningCount }]) => ({
    title: projectId,
    projectId,
    imageCount,
    runningCount,
    stoppedCount: imageCount - runningCount,
  })) as ProjectGroup[];
});

export type HostSummary = {
  total: number;
  running: number;
};

export const selectHostSummary = createSelector([selectContainersByHost], (containers): HostSummary => ({
  total: containers.length,
  running: containers.filter((container) => container.IsRunning).length,
}));

const selectHostStatsState = (state: RootState) => state.hostStats;

export const selectHostStats = createSelector(
  [selectHostStatsState, (_state: RootState, hostId: string) => hostId],
  (hostStats, hostId) => hostStats.byHostId[hostId]?.stats ?? null
);

const EMPTY_HISTORY: HostStatsHistory = { cpu: [], memory: [] };

export const selectHostStatsHistory = createSelector(
  [selectHostStatsState, (_state: RootState, hostId: string) => hostId],
  (hostStats, hostId) => hostStats.byHostId[hostId]?.history ?? EMPTY_HISTORY
);
