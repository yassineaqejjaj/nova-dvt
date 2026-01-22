import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Link2, 
  Plus, 
  Store, 
  Quote, 
  BarChart3, 
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { DecisionValidation } from './types';

interface ValidationPanelProps {
  decisionId: string;
  userId: string;
  assumptions: string[];
  onValidationAdded?: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  decisionId,
  userId,
  assumptions,
  onValidationAdded
}) => {
  const [validations, setValidations] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    validationType: 'store_feedback' as DecisionValidation['validationType'],
    title: '',
    content: '',
    validatesAssumption: '',
    assumptionStatus: 'pending' as DecisionValidation['assumptionStatus'],
    confidenceImpact: 'neutral' as DecisionValidation['confidenceImpact']
  });

  useEffect(() => {
    loadValidations();
  }, [decisionId]);

  const loadValidations = async () => {
    try {
      const { data, error } = await supabase
        .from('decision_validations')
        .select('*')
        .eq('decision_id', decisionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setValidations(data || []);
    } catch (error) {
      console.error('Error loading validations:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('decision_validations')
        .insert({
          decision_id: decisionId,
          user_id: userId,
          validation_type: formData.validationType,
          title: formData.title,
          content: formData.content,
          validates_assumption: formData.validatesAssumption || null,
          assumption_status: formData.assumptionStatus,
          confidence_impact: formData.confidenceImpact
        });

      if (error) throw error;

      toast({
        title: "Validation ajoutée",
        description: "Le retour terrain a été enregistré"
      });

      setShowAddDialog(false);
      setFormData({
        validationType: 'store_feedback',
        title: '',
        content: '',
        validatesAssumption: '',
        assumptionStatus: 'pending',
        confidenceImpact: 'neutral'
      });
      loadValidations();
      onValidationAdded?.();
    } catch (error) {
      console.error('Error adding validation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la validation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'store_feedback': return <Store className="w-4 h-4" />;
      case 'advisor_quote': return <Quote className="w-4 h-4" />;
      case 'kpi_snapshot': return <BarChart3 className="w-4 h-4" />;
      case 'pilot_result': return <FlaskConical className="w-4 h-4" />;
      default: return <Link2 className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-500/20 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Validé</Badge>;
      case 'invalidated':
        return <Badge className="bg-red-500/20 text-red-700"><XCircle className="w-3 h-3 mr-1" />Invalidé</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500/20 text-amber-700"><Clock className="w-3 h-3 mr-1" />Partiel</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'increases': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreases': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Rattacher la Réalité</h4>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un retour terrain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type de validation</label>
                <Select
                  value={formData.validationType}
                  onValueChange={(v) => setFormData({ ...formData, validationType: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store_feedback">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Retour boutique
                      </div>
                    </SelectItem>
                    <SelectItem value="advisor_quote">
                      <div className="flex items-center gap-2">
                        <Quote className="w-4 h-4" />
                        Citation conseiller
                      </div>
                    </SelectItem>
                    <SelectItem value="kpi_snapshot">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Snapshot KPI
                      </div>
                    </SelectItem>
                    <SelectItem value="pilot_result">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" />
                        Résultat pilote
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Retour équipe Paris Vendôme"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contenu</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Décrivez le retour terrain..."
                  rows={3}
                />
              </div>

              {assumptions.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Valide l'hypothèse (optionnel)</label>
                  <Select
                    value={formData.validatesAssumption}
                    onValueChange={(v) => setFormData({ ...formData, validatesAssumption: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une hypothèse" />
                    </SelectTrigger>
                    <SelectContent>
                      {assumptions.map((assumption, i) => (
                        <SelectItem key={i} value={assumption}>
                          {assumption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Statut hypothèse</label>
                  <Select
                    value={formData.assumptionStatus}
                    onValueChange={(v) => setFormData({ ...formData, assumptionStatus: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="validated">Validée</SelectItem>
                      <SelectItem value="invalidated">Invalidée</SelectItem>
                      <SelectItem value="partial">Partielle</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Impact confiance</label>
                  <Select
                    value={formData.confidenceImpact}
                    onValueChange={(v) => setFormData({ ...formData, confidenceImpact: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increases">Augmente ↑</SelectItem>
                      <SelectItem value="decreases">Diminue ↓</SelectItem>
                      <SelectItem value="neutral">Neutre −</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2 pr-2">
          {validations.map((v) => (
            <div key={v.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(v.validation_type)}
                  <span className="font-medium text-sm">{v.title}</span>
                </div>
                {getImpactIcon(v.confidence_impact)}
              </div>
              {v.content && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.content}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(v.assumption_status)}
                <span className="text-xs text-muted-foreground">
                  {new Date(v.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}

          {validations.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune validation terrain</p>
              <p className="text-xs">Ajoutez des retours pour fermer la boucle</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
