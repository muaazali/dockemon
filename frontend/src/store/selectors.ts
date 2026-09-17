import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { models } from '../../wailsjs/go/models';

const selectContainersState = (state: RootState) => state.containers;

export const selectAllContainers = createSelector(
  [selectContainersState],
  (containers) => containers.allIds.map((id) => containers.byId[id])
);

export const selectContainersStatus = createSelector(
  [selectContainersState],
  (containers) => containers.status
);

export const selectContainersError = createSelector(
  [selectContainersState],
  (containers) => containers.error
);

export const selectContainerPendingAction = createSelector(
  [selectContainersState, (_state: RootState, containerId: string) => containerId],
  (containers, containerId) => containers.pendingActions[containerId]
);

export const selectContainerById = createSelector(
  [selectContainersState, (_state: RootState, containerId: string | undefined) => containerId],
  (containers, containerId) => (containerId ? containers.byId[containerId] : undefined)
);

// Containers without a compose project are treated as their own project, identified by container name
function getEffectiveProjectId(container: models.DockerContainerData): string {
  return container.ComposeProjectTitle || container.RepoTitle;
}

export const selectContainersByProject = createSelector(
  [selectAllContainers, (_state: RootState, projectId: string | null) => projectId],
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

export const selectProjectGroups = createSelector([selectAllContainers], (containers) => {
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
