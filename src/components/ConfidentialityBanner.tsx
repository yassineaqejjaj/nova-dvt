import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ConfidentialityBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [reminderCount, setReminderCount] = useState(0);

  // Show periodic reminders every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isVisible) {
        setIsVisible(true);
        setReminderCount(prev => prev + 1);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Alert variant="default" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100 flex items-center justify-between">
        Protection des Données Confidentielles
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200 text-sm">
        <strong>Important :</strong> N'utilisez jamais de données clients confidentielles sans leur consentement explicite. 
        Assurez-vous d'avoir l'autorisation avant de partager ou d'analyser des informations sensibles.
      </AlertDescription>
    </Alert>
  );
};
