import { useEffect, useState } from 'react';
import { GetDetailedDockerImagesData } from '../../wailsjs/go/bindings/DockerCommandBindings';
import { models } from '../../wailsjs/go/models';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function firstRepoTagWithoutVersion(repoTags: string[]): string {
  const firstTag = repoTags?.[0];
  if (!firstTag) return '';
  const colonIndex = firstTag.lastIndexOf(':');
  return colonIndex === -1 ? firstTag : firstTag.slice(0, colonIndex);
}

export default function HomePage() {
  const [containers, setContainers] = useState<models.DockerContainerData[]>([]);

  useEffect(() => {
    GetDetailedDockerImagesData()
      .then((data) => setContainers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Home Page</h1>
      <p className="text-muted-foreground">Welcome to Dockemon</p>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Repo Tag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.map((container) => (
              <TableRow key={container.ID}>
                <TableCell className="font-mono text-xs">{container.ID}</TableCell>
                <TableCell>{container.RepoTitle}</TableCell>
                <TableCell>{container.ComposeProjectTitle}</TableCell>
                <TableCell>{container.Size}</TableCell>
                <TableCell>{container.RepoTag}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
