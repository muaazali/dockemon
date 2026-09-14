import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
              <CardTitle>{container.RepoTitle}</CardTitle>
              <CardDescription>{container.RepoTag}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>ID: {container.ID}</span>
                <span>Project: {container.ComposeProjectTitle}</span>
                <span>Size: {container.Size}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
