import { useParams } from 'react-router-dom';
import { Box, Cpu, HardDrive, MemoryStick, Network, Activity, Play, Square, RotateCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import ErrorState from '@/components/ErrorState';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchContainers, startContainer, stopContainer, restartContainer } from '@/store/containersSlice';
import { selectContainerById, selectContainerPendingAction, selectHostContainersStatus } from '@/store/selectors';

export default function ContainerDetailPage() {
  const { hostId, containerId } = useParams<{ hostId: string; containerId: string }>();
  const resolvedHostId = hostId ?? 'localhost';
  const dispatch = useAppDispatch();
  const container = useAppSelector((state) => selectContainerById(state, resolvedHostId, containerId));
  const status = useAppSelector((state) => selectHostContainersStatus(state, resolvedHostId));
  const pendingAction = useAppSelector((state) => selectContainerPendingAction(state, resolvedHostId, containerId ?? ''));
  const isLocked = pendingAction !== undefined;

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        <BackButton />
        <ErrorState onRetry={() => dispatch(fetchContainers(resolvedHostId))} />
      </div>
    );
  }

  if (!container) {
    return (
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        <BackButton />
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Box className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {status === 'loading' ? 'Loading container…' : 'Container not found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <BackButton />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
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
              <CardTitle>{container.RepoTitle}</CardTitle>
            </div>
            <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={isLocked || container.IsRunning}
                  onClick={() => dispatch(startContainer({ containerId: container.ID, hostId: resolvedHostId }))}
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={isLocked || !container.IsRunning}
                  onClick={() => dispatch(stopContainer({ containerId: container.ID, hostId: resolvedHostId }))}
                >
                  <Square className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={isLocked}
                  onClick={() => dispatch(restartContainer({ containerId: container.ID, hostId: resolvedHostId }))}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          <CardDescription>
            {container.ImageType} · {container.RepoTag}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>ID: {container.ID}</span>
            <span>Project: {container.ComposeProjectTitle}</span>
            <span>Size: {container.Size}</span>
            <span>Comment: {container.Comment}</span>
          </div>

          {container.IsRunning && (
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span>{container.CPUPercentage}</span>
              </div>
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <span>
                  {container.MemoryUsage} ({container.MemoryPercentage})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                <span>{container.NetworkIO}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span>{container.BlockIO}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>{container.PIDs} PIDs</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
