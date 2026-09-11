import { useParams } from 'react-router-dom';

export default function HostPage() {
  const { hostId } = useParams<{ hostId: string }>();

  return (
    <div>
      <h1>Host Information</h1>
      <p>Host ID: {hostId}</p>
    </div>
  );
}
