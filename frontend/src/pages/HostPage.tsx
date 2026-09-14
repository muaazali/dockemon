import { useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';

export default function HostPage() {
  const { hostId } = useParams<{ hostId: string }>();

  return (
    <div>
      <BackButton />
      <h1>Host Information</h1>
      <p>Host ID: {hostId}</p>
    </div>
  );
}
