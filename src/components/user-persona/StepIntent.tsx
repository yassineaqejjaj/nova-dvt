import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { ResearchIntent, INTENT_OPTIONS } from './types';
import { cn } from '@/lib/utils';

interface StepIntentProps {
  intent: ResearchIntent | null;
  productDescription: string;
  targetAudience: string;
  onIntentChange: (intent: ResearchIntent) => void;
  onProductDescriptionChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepIntent = ({
  intent,
  productDescription,
  targetAudience,
  onIntentChange,
  onProductDescriptionChange,
  onTargetAudienceChange,
  onNext,
  onBack,
}: StepIntentProps) => {
  const canContinue = intent && productDescription.trim().length > 20;

  return (
    <div className="space-y-6">
      {/* Research Intent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Pourquoi créez-vous ces personas ?
          </CardTitle>
          <CardDescription>
            Cette intention guide la génération pour des personas plus utiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={intent || ''}
            onValueChange={(value) => onIntentChange(value as ResearchIntent)}
            className="grid gap-3"
          >
            {INTENT_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                  intent === option.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                <div className="flex-1">
                  <span className="font-medium">{option.label}</span>
                  <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Product Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description du produit</CardTitle>
          <CardDescription>
            Décrivez votre produit pour des personas contextualisés.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productDescription">Produit et problème résolu *</Label>
            <Textarea
              id="productDescription"
              value={productDescription}
              onChange={(e) => onProductDescriptionChange(e.target.value)}
              placeholder="Quel problème principal le produit résout ?
Pour qui ?
Dans quel contexte d'usage ?"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 caractères. Plus de détails = personas plus précis.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Audience cible (optionnel)</Label>
            <Textarea
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => onTargetAudienceChange(e.target.value)}
              placeholder="Ex: Professionnels de la tech en PME, managers d'équipes de 5-20 personnes..."
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button onClick={onNext} disabled={!canContinue}>
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
