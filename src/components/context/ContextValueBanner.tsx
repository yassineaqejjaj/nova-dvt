import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, Target, GitBranch } from 'lucide-react';

export const ContextValueBanner: React.FC = () => {
  const capabilities = [
    { icon: <Lightbulb className="w-4 h-4" />, text: 'Structurer une discovery cohérente' },
    { icon: <FileText className="w-4 h-4" />, text: 'Générer des user stories alignées' },
    { icon: <Target className="w-4 h-4" />, text: 'Prioriser selon vos objectifs' },
    { icon: <GitBranch className="w-4 h-4" />, text: 'Aligner les décisions produit' },
  ];

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Avec ce contexte, Nova pourra :
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {capabilities.map((cap, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">{cap.icon}</span>
                  <span>{cap.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
