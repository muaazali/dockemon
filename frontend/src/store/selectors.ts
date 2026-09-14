import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

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

export const selectContainersByProject = createSelector(
  [selectAllContainers, (_state: RootState, projectId: string | null) => projectId],
  (containers, projectId) =>
    projectId ? containers.filter((container) => container.ComposeProjectTitle === projectId) : containers
);

export type ProjectGroup = {
  title: string;
  imageCount: number;
  runningCount: number;
  stoppedCount: number;
};

export const selectProjectGroups = createSelector([selectAllContainers], (containers) => {
  const groups = new Map<string, { imageCount: number; runningCount: number }>();
  for (const container of containers) {
    const title = container.ComposeProjectTitle || 'Untitled';
    const existing = groups.get(title) ?? { imageCount: 0, runningCount: 0 };
    groups.set(title, {
      imageCount: existing.imageCount + 1,
      runningCount: existing.runningCount + (container.IsRunning ? 1 : 0),
    });
  }
  return Array.from(groups.entries()).map(([title, { imageCount, runningCount }]) => ({
    title,
    imageCount,
    runningCount,
    stoppedCount: imageCount - runningCount,
  })) as ProjectGroup[];
});
