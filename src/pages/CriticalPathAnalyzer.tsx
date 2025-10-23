import { CriticalPathAnalyzer as CriticalPathAnalyzerComponent } from '@/components/CriticalPathAnalyzer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CriticalPathAnalyzerPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>
      <CriticalPathAnalyzerComponent />
    </div>
  );
}
