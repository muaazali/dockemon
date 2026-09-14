import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
      <ArrowLeft className="size-4" />
      Back
    </Button>
  );
}
