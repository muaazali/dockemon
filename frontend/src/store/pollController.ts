import { store } from './store';
import { fetchContainers } from './containersSlice';
import { selectAllHosts } from './selectors';

const POLL_INTERVAL_MS = 5000;

let pollHandle: ReturnType<typeof setInterval> | null = null;

function pollAllHosts() {
  for (const host of selectAllHosts(store.getState())) {
    store.dispatch(fetchContainers(host.ID));
  }
}

// Starts a single app-wide poller that fetches container data for every saved host, regardless of which page is
// active. Safe to call multiple times; only one interval ever runs.
export function startContainersPolling(intervalMs = POLL_INTERVAL_MS) {
  if (pollHandle) return;

  pollAllHosts();
  pollHandle = setInterval(pollAllHosts, intervalMs);
}

export function stopContainersPolling() {
  if (pollHandle) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}
