import { store } from './store';
import { fetchContainers } from './containersSlice';

const POLL_INTERVAL_MS = 5000;

let pollHandle: ReturnType<typeof setInterval> | null = null;

// Starts a single app-wide poller so container data is fetched once, regardless of how many pages mount
export function startContainersPolling(intervalMs = POLL_INTERVAL_MS) {
  if (pollHandle) return;

  store.dispatch(fetchContainers());
  pollHandle = setInterval(() => {
    store.dispatch(fetchContainers());
  }, intervalMs);
}

export function stopContainersPolling() {
  if (pollHandle) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}
