import { useParams } from 'react-router-dom';

export default function ImageDetailPage() {
  const { hostId, imageId } = useParams<{ hostId: string; imageId: string }>();

  return (
    <div>
      <h1>Image Detail</h1>
      <p>Host ID: {hostId}</p>
      <p>Image ID: {imageId}</p>
    </div>
  );
}
