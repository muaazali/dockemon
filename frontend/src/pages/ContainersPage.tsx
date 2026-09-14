import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Cpu, HardDrive, MemoryStick, Network, Activity } from 'lucide-react';
import { GetDetailedDockerImagesData } from '../../wailsjs/go/bindings/DockerCommandBindings';
import { models } from '../../wailsjs/go/models';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BackButton from '@/components/BackButton';

export default function ContainersPage() {
  const { hostId } = useParams<{ hostId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [containers, setContainers] = useState<models.DockerContainerData[]>([]);

  useEffect(() => {
    GetDetailedDockerImagesData()
      .then((data) => setContainers(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredContainers = useMemo(
    () =>
      projectId
        ? containers.filter((container) => container.ComposeProjectTitle === projectId)
        : containers,
    [containers, projectId]
  );

  return (
    <div className="p-6">
      <BackButton />
      <h1 className="text-2xl font-semibold">Containers</h1>
      <p className="text-muted-foreground">
        Host: {hostId}
        {projectId ? ` · Project: ${projectId}` : ''}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {filteredContainers.map((container) => (
          <Card key={container.ID}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>{container.RepoTitle}</CardTitle>
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
        ))}
      </div>
    </div>
  );
}
