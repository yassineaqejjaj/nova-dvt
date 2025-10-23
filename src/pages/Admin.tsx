import React from 'react';
import { AdminPanel } from '@/components/AdminPanel';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';

export default function Admin() {
  const navigate = useNavigate();

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <AdminPanel />
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
