import { useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';

export default function HostImagesPage() {
  const { hostId } = useParams<{ hostId: string }>();

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <BackButton />
      <div className="rounded-2xl border border-border bg-card/60 px-6 py-5 shadow-lg shadow-black/10 backdrop-blur-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Host Images</h1>
        <p className="mt-1 text-sm text-muted-foreground">Images for host: {hostId}</p>
      </div>
    </div>
  );
}
