import { useParams } from 'react-router-dom';

export default function HostImagesPage() {
  const { hostId } = useParams<{ hostId: string }>();

  return (
    <div>
      <h1>Host Images</h1>
      <p>Images for host: {hostId}</p>
    </div>
  );
}
