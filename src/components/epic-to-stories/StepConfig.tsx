import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings2, ArrowRight, ArrowLeft, X, Layers, FileText, Compass } from 'lucide-react';
import { GenerationConfig } from './types';

interface StepConfigProps {
  config: GenerationConfig;
  onUpdateConfig: (config: GenerationConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const GRANULARITY_OPTIONS = [
  { 
    value: 'macro', 
    label: 'Macro (MVP)', 
    description: 'Stories larges, idéales pour une v1 rapide',
    stories: '3-5 stories'
  },
  { 
    value: 'standard', 
    label: 'Standard', 
    description: 'Découpage équilibré, prêt pour le sprint',
    stories: '5-8 stories'
  },
  { 
    value: 'fine', 
    label: 'Fin (Delivery)', 
    description: 'Stories granulaires, estimation précise',
    stories: '8-12 stories'
  },
];

const FORMAT_OPTIONS = [
  { 
    value: 'simple', 
    label: 'User Story simple',
    description: 'As a... I want... So that...'
  },
  { 
    value: 'with_ac', 
    label: 'Story + Critères d\'acceptation',
    description: 'Inclut les critères de validation'
  },
  { 
    value: 'with_ac_risks', 
    label: 'Story + AC + Risques',
    description: 'Complet avec analyse des risques'
  },
];

const ORIENTATION_OPTIONS = [
  { 
    value: 'user_value', 
    label: 'Valeur utilisateur',
    description: 'Focus sur les bénéfices utilisateur',
    icon: '👤'
  },
  { 
    value: 'technical', 
    label: 'Faisabilité technique',
    description: 'Focus sur l\'implémentation',
    icon: '⚙️'
  },
  { 
    value: 'balanced', 
    label: 'Équilibré',
    description: 'Mix valeur et technique',
    icon: '⚖️'
  },
];

const StepConfig = ({ config, onUpdateConfig, onNext, onBack }: StepConfigProps) => {
  const [focusInput, setFocusInput] = useState('');

  const handleAddFocus = () => {
    if (focusInput.trim() && !config.focusAreas.includes(focusInput.trim())) {
      onUpdateConfig({
        ...config,
        focusAreas: [...config.focusAreas, focusInput.trim()]
      });
      setFocusInput('');
    }
  };

  const handleRemoveFocus = (area: string) => {
    onUpdateConfig({
      ...config,
      focusAreas: config.focusAreas.filter(a => a !== area)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Paramétrage de la génération
        </CardTitle>
        <CardDescription>
          Configurez le niveau de détail et l'orientation des User Stories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Granularity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Niveau de découpage</Label>
          </div>
          <RadioGroup
            value={config.granularity}
            onValueChange={(v) => onUpdateConfig({ ...config, granularity: v as any })}
            className="grid gap-3"
          >
            {GRANULARITY_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  config.granularity === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onUpdateConfig({ ...config, granularity: option.value as any })}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="cursor-pointer font-medium">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {option.stories}
                </Badge>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Format */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Format des stories</Label>
          </div>
          <RadioGroup
            value={config.format}
            onValueChange={(v) => onUpdateConfig({ ...config, format: v as any })}
            className="grid gap-3"
          >
            {FORMAT_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  config.format === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onUpdateConfig({ ...config, format: option.value as any })}
              >
                <RadioGroupItem value={option.value} id={`format-${option.value}`} />
                <div className="flex-1">
                  <Label htmlFor={`format-${option.value}`} className="cursor-pointer font-medium">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Orientation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Orientation principale</Label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ORIENTATION_OPTIONS.map((option) => (
              <div
                key={option.value}
                onClick={() => onUpdateConfig({ ...config, orientation: option.value as any })}
                className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                  config.orientation === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <p className="font-medium text-sm mt-2">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Focus areas */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Domaines d'attention (optionnel)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="ex.: Sécurité, Performance, Accessibilité..."
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleAddFocus}>
              Ajouter
            </Button>
          </div>
          {config.focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.focusAreas.map((area) => (
                <Badge key={area} variant="secondary" className="gap-1 pr-1">
                  {area}
                  <button
                    onClick={() => handleRemoveFocus(area)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={onNext}>
            Générer les stories
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepConfig;
