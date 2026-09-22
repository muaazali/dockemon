import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Play, Square, RotateCw, ChevronDown, Tag, FileCode2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs';
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from '@/components/ui/collapsible';
import BackButton from '@/components/BackButton';
import ErrorState from '@/components/ErrorState';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchContainers, startContainer, stopContainer, restartContainer } from '@/store/containersSlice';
import { selectContainerById, selectContainerPendingAction, selectHostContainersStatus } from '@/store/selectors';
import { GetContainerLogs } from '../../wailsjs/go/bindings/DockerCommandBindings';

const LOGS_POLL_INTERVAL_MS = 1000;
const TAIL_OPTIONS = [10, 50, 100] as const;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}

export default function ContainerDetailPage() {
  const { hostId, containerId } = useParams<{ hostId: string; containerId: string }>();
  const resolvedHostId = hostId ?? 'localhost';
  const dispatch = useAppDispatch();
  const container = useAppSelector((state) => selectContainerById(state, resolvedHostId, containerId));
  const status = useAppSelector((state) => selectHostContainersStatus(state, resolvedHostId));
  const pendingAction = useAppSelector((state) => selectContainerPendingAction(state, resolvedHostId, containerId ?? ''));
  const isLocked = pendingAction !== undefined;

  const [tailLines, setTailLines] = useState<number>(50);
  const [logs, setLogs] = useState('');
  const [logsError, setLogsError] = useState<string | null>(null);
  const logsRequestId = useRef(0);

  const isRunning = container?.IsRunning ?? false;

  useEffect(() => {
    if (!containerId || !isRunning) {
      setLogs('');
      setLogsError(null);
      return;
    }

    let cancelled = false;
    const requestId = ++logsRequestId.current;

    const fetchLogs = async () => {
      try {
        const result = await GetContainerLogs(containerId, resolvedHostId, tailLines);
        if (!cancelled && logsRequestId.current === requestId) {
          setLogs(result);
          setLogsError(null);
        }
      } catch (err) {
        if (!cancelled && logsRequestId.current === requestId) {
          setLogsError(err instanceof Error ? err.message : 'Failed to fetch container logs');
        }
      }
    };

    fetchLogs();
    const intervalId = setInterval(fetchLogs, LOGS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [containerId, resolvedHostId, isRunning, tailLines]);

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-6 lg:px-10 lg:pb-10">
        <BackButton />
        <ErrorState onRetry={() => dispatch(fetchContainers(resolvedHostId))} />
      </div>
    );
  }

  if (!container) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-6 lg:px-10 lg:pb-10">
        <BackButton />
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center backdrop-blur-2xl">
          <Box className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {status === 'loading' ? 'Loading container…' : 'Container not found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-6 lg:px-10 lg:pb-10">
      <BackButton />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card/60 px-6 py-5 shadow-lg shadow-black/10 backdrop-blur-2xl">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {hostId} / Containers
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{container.RepoTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">ID: {container.ID}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Actions</CardTitle>
            </div>
            <span
              className={`flex items-center gap-1.5 text-xs font-medium ${
                container.IsRunning ? 'text-green-500' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  container.IsRunning ? 'bg-green-500' : 'bg-muted-foreground'
                }`}
              />
              {container.IsRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={isLocked || container.IsRunning}
              onClick={() => dispatch(startContainer({ containerId: container.ID, hostId: resolvedHostId }))}
            >
              <Play className="h-3.5 w-3.5" />
              Start
            </Button>
            <Button
              variant="outline"
              disabled={isLocked || !container.IsRunning}
              onClick={() => dispatch(stopContainer({ containerId: container.ID, hostId: resolvedHostId }))}
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
            <Button
              variant="outline"
              disabled={isLocked}
              onClick={() => dispatch(restartContainer({ containerId: container.ID, hostId: resolvedHostId }))}
            >
              <RotateCw className="h-3.5 w-3.5" />
              Restart
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            {container.ImageType} · {container.RepoTag}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <DetailRow label="ID" value={container.ID} />
          <DetailRow label="Project" value={container.ComposeProjectTitle || '—'} />
          <DetailRow label="Size" value={container.Size} />
          <DetailRow label="Comment" value={container.Comment || '—'} />
          {container.IsRunning && (
            <>
              <DetailRow label="CPU" value={container.CPUPercentage} />
              <DetailRow label="Memory" value={`${container.MemoryUsage} (${container.MemoryPercentage})`} />
              <DetailRow label="Network I/O" value={container.NetworkIO} />
              <DetailRow label="Block I/O" value={container.BlockIO} />
              <DetailRow label="PIDs" value={container.PIDs} />
            </>
          )}

          <Tabs defaultValue="logs" className="mt-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTab value="logs">Logs</TabsTab>
              </TabsList>
              {isRunning && (
                <select
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={tailLines}
                  onChange={(e) => setTailLines(Number(e.target.value))}
                >
                  {TAIL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      Last {option} lines
                    </option>
                  ))}
                </select>
              )}
            </div>

            <TabsPanel value="logs" className="mt-3">
              {!isRunning ? (
                <p className="text-sm text-muted-foreground">Start the container to view live logs.</p>
              ) : logsError ? (
                <p className="text-sm text-destructive">{logsError}</p>
              ) : (
                <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-black/30 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                  {logs || 'No logs yet.'}
                </pre>
              )}
            </TabsPanel>
          </Tabs>
        </CardContent>
      </Card>

      <Collapsible defaultOpen className="mt-6">
        <Card className="overflow-hidden">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Labels</CardTitle>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <CardContent>
              {Object.keys(container.Labels ?? {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels.</p>
              ) : (
                Object.entries(container.Labels).map(([key, value]) => (
                  <DetailRow key={key} label={key} value={value} />
                ))
              )}
            </CardContent>
          </CollapsiblePanel>
        </Card>
      </Collapsible>

      <Collapsible defaultOpen className="mt-6">
        <Card className="overflow-hidden">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Environment</CardTitle>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <CardContent>
              {(container.Env ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No environment variables.</p>
              ) : (
                container.Env.map((entry) => {
                  const separatorIndex = entry.indexOf('=');
                  const key = separatorIndex === -1 ? entry : entry.slice(0, separatorIndex);
                  const value = separatorIndex === -1 ? '' : entry.slice(separatorIndex + 1);
                  return <DetailRow key={key} label={key} value={value} />;
                })
              )}
            </CardContent>
          </CollapsiblePanel>
        </Card>
      </Collapsible>
    </div>
  );
}
