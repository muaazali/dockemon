import { memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, CircleDot, CirclePause, Layers, Server, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectHostContainersStatus, selectProjectGroups, type ProjectGroup } from '@/store/selectors';
import { fetchContainers } from '@/store/containersSlice';
import BackButton from '@/components/BackButton';
import ErrorState from '@/components/ErrorState';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

type ProjectCardProps = {
  group: ProjectGroup;
  onClick: (projectId: string) => void;
};

const ProjectCard = memo(function ProjectCard({ group, onClick }: ProjectCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onClick(group.projectId)}
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

export default function HostPage() {
  const { hostId } = useParams<{ hostId: string }>();
  const resolvedHostId = hostId ?? 'localhost';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const projectGroups = useAppSelector((state) => selectProjectGroups(state, resolvedHostId));
  const status = useAppSelector((state) => selectHostContainersStatus(state, resolvedHostId));

  const handleNavigate = (projectId: string) =>
    navigate(`/${hostId}/containers?projectId=${encodeURIComponent(projectId)}`);

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <BackButton />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card/60 px-6 py-5 shadow-lg shadow-black/10 backdrop-blur-2xl">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight">{hostId}</h1>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card/80 p-5 shadow-2xl shadow-black/10">
          <div className="mb-6 flex items-center justify-between text-muted-foreground"><span className="text-xs">Projects</span><Layers className="size-4 text-primary" /></div>
          <p className="text-3xl font-semibold">{projectGroups.length}</p><p className="mt-1 text-xs text-muted-foreground">Tracked workspaces</p>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-5 shadow-2xl shadow-black/10">
          <div className="mb-6 flex items-center justify-between text-muted-foreground"><span className="text-xs">Running containers</span><Activity className="size-4 text-emerald-400" /></div>
          <p className="text-3xl font-semibold">{projectGroups.reduce((total, group) => total + group.runningCount, 0)}</p><p className="mt-1 text-xs text-muted-foreground">Healthy workloads</p>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-5 shadow-2xl shadow-black/10">
          <div className="mb-6 flex items-center justify-between text-muted-foreground"><span className="text-xs">Host status</span><Zap className="size-4 text-amber-300" /></div>
          <p className="text-3xl font-semibold">Ready</p><p className="mt-1 text-xs text-muted-foreground">{hostId} connected</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card/60 px-5 py-4 shadow-lg shadow-black/10 backdrop-blur-2xl"><div><h2 className="text-lg font-semibold">Your projects</h2><p className="text-xs text-muted-foreground">Select a workspace to inspect its containers.</p></div><Server className="size-5 text-muted-foreground" /></div>

      {status === 'failed' ? (
        <div className="mt-6">
          <ErrorState onRetry={() => dispatch(fetchContainers(resolvedHostId))} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projectGroups.map((group) => (
            <ProjectCard key={group.projectId} group={group} onClick={handleNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}
