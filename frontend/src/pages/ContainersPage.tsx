import { memo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Cpu, HardDrive, MemoryStick, Network, Activity, Play, Square, RotateCw } from 'lucide-react';
import { models } from '../../wailsjs/go/models';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import ErrorState from '@/components/ErrorState';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchContainers, startContainer, stopContainer, restartContainer } from '@/store/containersSlice';
import { selectContainersByProject, selectContainersStatus, selectContainerPendingAction } from '@/store/selectors';

const ContainerCard = memo(function ContainerCard({
  container,
}: {
  container: models.DockerContainerData;
}) {
  const dispatch = useAppDispatch();
  const pendingAction = useAppSelector((state) => selectContainerPendingAction(state, container.ID));
  const isLocked = pendingAction !== undefined;

  return (
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
                onClick={() => dispatch(startContainer(container.ID))}
              >
                <Play className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={isLocked || !container.IsRunning}
                onClick={() => dispatch(stopContainer(container.ID))}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={isLocked}
                onClick={() => dispatch(restartContainer(container.ID))}
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
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const dispatch = useAppDispatch();
  const filteredContainers = useAppSelector((state) => selectContainersByProject(state, projectId));
  const status = useAppSelector(selectContainersStatus);

  return (
    <div className="p-6">
      <BackButton />
      <h1 className="text-2xl font-semibold">Containers</h1>
      <p className="text-muted-foreground">
        Host: {hostId}
        {projectId ? ` · Project: ${projectId}` : ''}
      </p>

      {status === 'failed' ? (
        <div className="mt-6">
          <ErrorState onRetry={() => dispatch(fetchContainers())} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {filteredContainers.map((container) => (
            <ContainerCard key={container.ID} container={container} />
          ))}
        </div>
      )}
    </div>
  );
}
