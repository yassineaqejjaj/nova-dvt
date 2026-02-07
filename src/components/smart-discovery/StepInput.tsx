import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ContextSelector } from '@/components/ContextSelector';
import { Loader2, Sparkles, Target, Lightbulb, Upload } from 'lucide-react';
import { ProductContext } from './types';

interface StepInputProps {
  ideaDescription: string;
  onIdeaChange: (value: string) => void;
  activeContext: ProductContext | null;
  onContextSelect: (context: ProductContext) => void;
  isLoading: boolean;
  onAnalyze: () => void;
}

export const StepInput = ({
  ideaDescription,
  onIdeaChange,
  activeContext,
  onContextSelect,
  isLoading,
  onAnalyze,
}: StepInputProps) => {
  return (
    <div className="space-y-6">
      {/* Context Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Contexte depuis Nova Core
          </CardTitle>
          <CardDescription>Le système lit, résume et affiche ce qu'il a compris</CardDescription>
        </CardHeader>
        <CardContent>
          <ContextSelector
            selectedContextId={activeContext?.id}
            onContextSelected={onContextSelect as any}
          />

          {activeContext && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="font-medium text-sm">Contexte chargé : {activeContext.name}</p>
              {activeContext.vision && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Vision :</span> {activeContext.vision}
                </p>
              )}
              {activeContext.target_audience && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Audience :</span> {activeContext.target_audience}
                </p>
              )}
              {activeContext.constraints && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Contraintes :</span> {activeContext.constraints}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Décrivez votre idée
          </CardTitle>
          <CardDescription>
            Idée ou phrase de stakeholder. Exemple : "On a trop d'abandons sur le tunnel mobile"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='Ex: "Le métier veut un outil plus simple pour piloter" ou "Les utilisateurs se plaignent de ne pas pouvoir exporter leurs données"...'
            value={ideaDescription}
            onChange={(e) => onIdeaChange(e.target.value)}
            rows={6}
            className="resize-none"
          />

          <Button
            onClick={onAnalyze}
            disabled={isLoading || !ideaDescription.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Lancer la Discovery
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
