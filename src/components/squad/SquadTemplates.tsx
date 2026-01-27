import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Rocket, Users2, Lightbulb } from 'lucide-react';

interface SquadTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  suggestedPurpose: string;
}

const templates: SquadTemplate[] = [
  {
    id: 'discovery',
    name: 'Squad Discovery',
    description: 'Exploration et définition de besoins',
    icon: <Compass className="w-5 h-5" />,
    suggestedPurpose: 'Explorer les besoins utilisateurs et définir le périmètre produit',
  },
  {
    id: 'delivery',
    name: 'Squad Delivery',
    description: 'Conception et spécification',
    icon: <Rocket className="w-5 h-5" />,
    suggestedPurpose: 'Structurer les features et produire des spécifications prêtes pour le développement',
  },
  {
    id: 'committee',
    name: 'Squad Comité',
    description: 'Décisions stratégiques',
    icon: <Users2 className="w-5 h-5" />,
    suggestedPurpose: 'Faciliter les arbitrages et décisions produit stratégiques',
  },
  {
    id: 'innovation',
    name: 'Squad Innovation',
    description: 'Idéation et exploration',
    icon: <Lightbulb className="w-5 h-5" />,
    suggestedPurpose: 'Générer et évaluer des idées innovantes pour le produit',
  },
];

interface SquadTemplatesProps {
  onSelectTemplate: (template: SquadTemplate) => void;
}

export const SquadTemplates: React.FC<SquadTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Ou choisissez un modèle pour démarrer rapidement :
      </p>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onSelectTemplate(template)}
          >
            <CardContent className="p-3 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {template.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { templates };
export type { SquadTemplate };
