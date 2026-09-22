import { memo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Cpu, HardDrive, MemoryStick, Network, Activity, Play, Square, RotateCw } from 'lucide-react';
import { models } from '../../wailsjs/go/models';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import ErrorState from '@/components/ErrorState';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchContainers, startContainer, stopContainer, restartContainer } from '@/store/containersSlice';
import { selectContainersByProject, selectHostContainersStatus, selectContainerPendingAction } from '@/store/selectors';

const ContainerCard = memo(function ContainerCard({
  container,
}: {
  container: models.DockerContainerData;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { hostId } = useParams<{ hostId: string }>();
  const resolvedHostId = hostId ?? 'localhost';
  const pendingAction = useAppSelector((state) => selectContainerPendingAction(state, resolvedHostId, container.ID));
  const isLocked = pendingAction !== undefined;

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/50"
      onClick={() => navigate(`/${hostId}/containers/${container.ID}`)}
    >
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
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
          <span>ID: {container.ID.slice(0, 12)}</span>
          <span>Project: {container.ComposeProjectTitle}</span>
          <span>Size: {container.Size}</span>
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
  );
});

export default function ContainersPage() {
  const { hostId } = useParams<{ hostId: string }>();
  const resolvedHostId = hostId ?? 'localhost';
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const dispatch = useAppDispatch();
  const filteredContainers = useAppSelector((state) => selectContainersByProject(state, resolvedHostId, projectId));
  const status = useAppSelector((state) => selectHostContainersStatus(state, resolvedHostId));

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <BackButton />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card/60 px-6 py-5 shadow-lg shadow-black/10 backdrop-blur-2xl">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Workspace / Runtime</p>
          <h1 className="text-3xl font-semibold tracking-tight">Containers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
        Host: {hostId}
        {projectId ? ` · Project: ${projectId}` : ''}
          </p>
        </div>
        <div className="rounded-full border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">{filteredContainers.length} workloads</div>
      </div>

      {status === 'failed' ? (
        <div className="mt-6">
          <ErrorState onRetry={() => dispatch(fetchContainers(resolvedHostId))} />
        </div>
      ) : filteredContainers.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center backdrop-blur-2xl">
          <Box className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No containers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContainers.map((container) => (
            <ContainerCard key={container.ID} container={container} />
          ))}
        </div>
      )}
    </div>
  );
}
