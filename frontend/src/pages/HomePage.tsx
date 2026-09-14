import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, CircleDot, CirclePause } from 'lucide-react';
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
  runningCount: number;
  stoppedCount: number;
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
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <CardTitle>{group.title}</CardTitle>
              </div>
              <CardDescription>
                {group.imageCount} {group.imageCount === 1 ? 'image' : 'images'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <CircleDot className="h-4 w-4 text-green-500" />
                  <span>{group.runningCount} running</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CirclePause className="h-4 w-4 text-muted-foreground" />
                  <span>{group.stoppedCount} stopped</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
