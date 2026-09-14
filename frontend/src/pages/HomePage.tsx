import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetDetailedDockerImagesData } from '../../wailsjs/go/bindings/DockerCommandBindings';
import { models } from '../../wailsjs/go/models';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

type ProjectGroup = {
  title: string;
  imageCount: number;
  isRunning: boolean;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [containers, setContainers] = useState<models.DockerContainerData[]>([]);

  useEffect(() => {
    GetDetailedDockerImagesData()
      .then((data) => setContainers(data))
      .catch((err) => console.error(err));
  }, []);

  const projectGroups = useMemo<ProjectGroup[]>(() => {
    const groups = new Map<string, number>();
    for (const container of containers) {
      const title = container.ComposeProjectTitle || 'Untitled';
      groups.set(title, (groups.get(title) ?? 0) + 1);
    }
    return Array.from(groups.entries()).map(([title, imageCount]) => ({
      title,
      imageCount,
      isRunning: true, // TODO: derive from actual container status
    }));
  }, [containers]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Home Page</h1>
      <p className="text-muted-foreground">Welcome to Dockemon</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {projectGroups.map((group) => (
          <Card
            key={group.title}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() =>
              navigate(`/localhost/containers?projectId=${encodeURIComponent(group.title)}`)
            }
          >
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>
                {group.imageCount} {group.imageCount === 1 ? 'image' : 'images'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    group.isRunning ? 'bg-green-500' : 'bg-muted-foreground'
                  }`}
                />
                <span>{group.isRunning ? 'Running' : 'Stopped'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
