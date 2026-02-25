import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export interface ChangeContext {
  changeNature: string;
  changeDescription: string;
  impactedAreas: string[];
  changeOrigin: string;
  priority: string;
}

const CHANGE_NATURES = [
  { value: 'new_requirement', label: 'Nouveau besoin', description: 'Ajout d\'une nouvelle fonctionnalité ou exigence' },
  { value: 'modification', label: 'Modification existante', description: 'Changement d\'une règle métier ou d\'un comportement' },
  { value: 'removal', label: 'Suppression', description: 'Retrait d\'une fonctionnalité ou d\'un périmètre' },
  { value: 'pivot', label: 'Pivot stratégique', description: 'Réorientation de la vision ou des objectifs' },
  { value: 'regulatory', label: 'Conformité / Réglementaire', description: 'Mise en conformité légale ou normative' },
  { value: 'technical', label: 'Évolution technique', description: 'Migration, refactoring ou changement d\'architecture' },
  { value: 'feedback', label: 'Retour utilisateur', description: 'Ajustement suite à des retours terrain' },
];

const IMPACT_AREAS = [
  { value: 'ui', label: 'Interface utilisateur' },
  { value: 'business_rules', label: 'Règles métier' },
  { value: 'data_model', label: 'Modèle de données' },
  { value: 'api', label: 'API / Intégrations' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Sécurité' },
  { value: 'analytics', label: 'Analytics / KPIs' },
  { value: 'user_journey', label: 'Parcours utilisateur' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'tests', label: 'Tests' },
];

const CHANGE_ORIGINS = [
  { value: 'stakeholder', label: 'Demande stakeholder' },
  { value: 'user_research', label: 'Recherche utilisateur' },
  { value: 'market', label: 'Évolution marché' },
  { value: 'tech_debt', label: 'Dette technique' },
  { value: 'incident', label: 'Incident / Bug' },
  { value: 'regulation', label: 'Réglementation' },
  { value: 'internal', label: 'Initiative interne' },
];

interface ChangeContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (context: ChangeContext) => void;
  artifactTitle: string;
  mode: 'analysis' | 'document';
}

export const ChangeContextDialog: React.FC<ChangeContextDialogProps> = ({
  open, onOpenChange, onSubmit, artifactTitle, mode,
}) => {
  const [form, setForm] = useState<ChangeContext>({
    changeNature: '',
    changeDescription: '',
    impactedAreas: [],
    changeOrigin: '',
    priority: 'medium',
  });

  const toggleArea = (value: string) => {
    setForm(f => ({
      ...f,
      impactedAreas: f.impactedAreas.includes(value)
        ? f.impactedAreas.filter(a => a !== value)
        : f.impactedAreas.length < 5 ? [...f.impactedAreas, value] : f.impactedAreas,
    }));
  };

  const handleSubmit = () => {
    onSubmit(form);
    setForm({ changeNature: '', changeDescription: '', impactedAreas: [], changeOrigin: '', priority: 'medium' });
  };

  const canSubmit = form.changeNature && form.changeDescription.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Contextualiser le changement
          </DialogTitle>
          <DialogDescription>
            {mode === 'document'
              ? `Décrivez le changement apporté par le document avant l'analyse de "${artifactTitle}".`
              : `Décrivez le changement à analyser sur "${artifactTitle}" pour une analyse plus précise.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 1. Nature du changement */}
          <div className="space-y-2">
            <Label className="font-medium">Nature du changement *</Label>
            <Select value={form.changeNature} onValueChange={v => setForm(f => ({ ...f, changeNature: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Quel type de changement ?" />
              </SelectTrigger>
              <SelectContent>
                {CHANGE_NATURES.map(n => (
                  <SelectItem key={n.value} value={n.value}>
                    <div>
                      <span className="font-medium">{n.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">— {n.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Description */}
          <div className="space-y-2">
            <Label className="font-medium">Décrivez le changement *</Label>
            <Textarea
              value={form.changeDescription}
              onChange={e => setForm(f => ({ ...f, changeDescription: e.target.value }))}
              placeholder="Ex : Les utilisateurs premium peuvent désormais annuler une commande jusqu'à 48h au lieu de 24h, avec remboursement partiel…"
              className="min-h-[100px] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">{form.changeDescription.length}/2000</p>
          </div>

          {/* 3. Zones d'impact pressenties */}
          <div className="space-y-2">
            <Label className="font-medium">Zones d'impact pressenties</Label>
            <p className="text-xs text-muted-foreground">Sélectionnez jusqu'à 5 zones que vous pensez impactées</p>
            <div className="flex flex-wrap gap-2">
              {IMPACT_AREAS.map(area => {
                const selected = form.impactedAreas.includes(area.value);
                return (
                  <Badge
                    key={area.value}
                    variant={selected ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors hover:bg-primary/10"
                    onClick={() => toggleArea(area.value)}
                  >
                    {selected && <X className="w-3 h-3 mr-1" />}
                    {area.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* 4. Origine */}
          <div className="space-y-2">
            <Label className="font-medium">Origine du changement</Label>
            <Select value={form.changeOrigin} onValueChange={v => setForm(f => ({ ...f, changeOrigin: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="D'où vient ce changement ?" />
              </SelectTrigger>
              <SelectContent>
                {CHANGE_ORIGINS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 5. Priorité */}
          <div className="space-y-2">
            <Label className="font-medium">Priorité</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={form.priority === p ? 'default' : 'outline'}
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={form.priority === p ? '' : 'text-muted-foreground'}
                >
                  {{ low: '🟢 Faible', medium: '🟡 Moyenne', high: '🟠 Haute', critical: '🔴 Critique' }[p]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Lancer l'analyse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
