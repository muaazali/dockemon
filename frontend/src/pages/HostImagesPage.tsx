import { useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';

export default function HostImagesPage() {
  const { hostId } = useParams<{ hostId: string }>();

  return (
    <div>
      <BackButton />
      <h1>Host Images</h1>
      <p>Images for host: {hostId}</p>
    </div>
  );
}
