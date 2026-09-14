import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, CircleDot, CirclePause } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectProjectGroups, type ProjectGroup } from '@/store/selectors';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

type ProjectCardProps = {
  group: ProjectGroup;
  onClick: (title: string) => void;
};

const ProjectCard = memo(function ProjectCard({ group, onClick }: ProjectCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onClick(group.title)}
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
  );
});

export default function HomePage() {
  const navigate = useNavigate();
  const projectGroups = useAppSelector(selectProjectGroups);

  const handleNavigate = (title: string) =>
    navigate(`/localhost/containers?projectId=${encodeURIComponent(title)}`);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Home Page</h1>
      <p className="text-muted-foreground">Welcome to Dockemon</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {projectGroups.map((group) => (
          <ProjectCard key={group.title} group={group} onClick={handleNavigate} />
        ))}
      </div>
    </div>
  );
}
