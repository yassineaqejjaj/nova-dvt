import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Settings2 } from 'lucide-react';
import { PersonaConfig, DetailLevel, PersonaOrientation, DETAIL_LEVELS, ORIENTATION_OPTIONS } from './types';
import { cn } from '@/lib/utils';

interface StepConfigProps {
  config: PersonaConfig;
  onConfigChange: (config: PersonaConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepConfig = ({ config, onConfigChange, onNext, onBack }: StepConfigProps) => {
  const updateConfig = (updates: Partial<PersonaConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Configuration de la génération
          </CardTitle>
          <CardDescription>
            Ajustez ces paramètres pour obtenir des personas adaptés à votre besoin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Persona Count */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Nombre de personas</Label>
            <div className="flex gap-3">
              {([1, 2, 3] as const).map((count) => (
                <Button
                  key={count}
                  variant="outline"
                  size="lg"
                  className={cn(
                    'flex-1 h-16 text-lg font-semibold transition-all',
                    config.personaCount === count && 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  )}
                  onClick={() => updateConfig({ personaCount: count })}
                >
                  {count}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {config.personaCount === 1 && 'Un persona principal pour une cible prioritaire.'}
              {config.personaCount === 2 && 'Deux personas pour comparer des segments distincts.'}
              {config.personaCount === 3 && 'Trois personas pour une vision complète du marché.'}
            </p>
          </div>

          {/* Detail Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Niveau de détail</Label>
            <div className="flex gap-3">
              {DETAIL_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  variant="outline"
                  size="lg"
                  className={cn(
                    'flex-1 h-12 font-medium transition-all',
                    config.detailLevel === level.value && 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  )}
                  onClick={() => updateConfig({ detailLevel: level.value })}
                >
                  {level.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {config.detailLevel === 'synthesis' && 'Essentiel uniquement : rôle, objectifs, frustrations clés.'}
              {config.detailLevel === 'standard' && 'Équilibré : comportements, motivations et contexte inclus.'}
              {config.detailLevel === 'detailed' && 'Complet : tous les aspects avec nuances et exemples.'}
            </p>
          </div>

          {/* Orientation */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Orientation principale</Label>
            <div className="grid gap-3">
              {ORIENTATION_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(
                    'h-auto py-3 px-4 justify-start text-left transition-all',
                    config.orientation === option.value && 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  )}
                  onClick={() => updateConfig({ orientation: option.value })}
                >
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <p className="text-sm text-muted-foreground font-normal mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Résumé :</span>
            <span className="font-medium">
              {config.personaCount} persona{config.personaCount > 1 ? 's' : ''} ·{' '}
              {DETAIL_LEVELS.find(l => l.value === config.detailLevel)?.label} ·{' '}
              Focus {ORIENTATION_OPTIONS.find(o => o.value === config.orientation)?.label.toLowerCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button onClick={onNext}>
          Générer les personas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
