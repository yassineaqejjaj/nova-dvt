import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Loader2, Plus, Trash2 } from 'lucide-react';
import { ContextFormData } from './useProductContexts';

interface Props {
  formData: ContextFormData;
  isSaving: boolean;
  isEditing: boolean;
  showHistory: boolean;
  newObjective: string;
  newKPI: string;
  editingObjectiveIndex: number | null;
  editingKPIIndex: number | null;
  setFormData: (v: ContextFormData) => void;
  setIsEditing: (v: boolean) => void;
  setShowHistory: (v: boolean) => void;
  setNewObjective: (v: string) => void;
  setNewKPI: (v: string) => void;
  setEditingObjectiveIndex: (v: number | null) => void;
  setEditingKPIIndex: (v: number | null) => void;
  onSave: () => void;
  onAddObjective: () => void;
  onRemoveObjective: (i: number) => void;
  onAddKPI: () => void;
  onRemoveKPI: (i: number) => void;
  updateObjective: (i: number, v: string) => void;
  updateKPI: (i: number, v: string) => void;
}

export const ContextEditor: React.FC<Props> = ({
  formData,
  isSaving,
  isEditing,
  showHistory,
  newObjective,
  newKPI,
  editingObjectiveIndex,
  editingKPIIndex,
  setFormData,
  setIsEditing,
  setShowHistory,
  setNewObjective,
  setNewKPI,
  setEditingObjectiveIndex,
  setEditingKPIIndex,
  onSave,
  onAddObjective,
  onRemoveObjective,
  onAddKPI,
  onRemoveKPI,
  updateObjective,
  updateKPI,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Éditeur de contexte</CardTitle>
            <CardDescription>
              {isEditing ? 'Sauvegarde automatique activée' : 'Modifiez vos informations produit'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-2" /> Historique
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Secteur d'activité */}
            <div>
              <Label>Secteur d'activité</Label>
              <Select
                value={formData.industrySector}
                onValueChange={(v) => {
                  setFormData({ ...formData, industrySector: v });
                  setIsEditing(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="HealthTech">HealthTech</SelectItem>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Télécom">Télécom</SelectItem>
                  <SelectItem value="Industrie">Industrie</SelectItem>
                  <SelectItem value="Énergie">Énergie</SelectItem>
                  <SelectItem value="Secteur public">Secteur public</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Nom du contexte *</Label>
              <Input
                id="name"
                placeholder="ex: Application mobile e-commerce"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setIsEditing(true);
                }}
              />
            </div>

            <div>
              <Label htmlFor="vision">Vision</Label>
              <Textarea
                id="vision"
                placeholder="Quelle est la vision globale du produit?"
                value={formData.vision}
                onChange={(e) => {
                  setFormData({ ...formData, vision: e.target.value });
                  setIsEditing(true);
                }}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sprintDuration">Durée du sprint (semaines)</Label>
                <Input
                  id="sprintDuration"
                  type="number"
                  placeholder="2"
                  value={formData.sprintDuration}
                  onChange={(e) => {
                    setFormData({ ...formData, sprintDuration: e.target.value });
                    setIsEditing(true);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="teamSize">Taille de l'équipe</Label>
                <Input
                  id="teamSize"
                  placeholder="ex: 5-8 personnes"
                  value={formData.teamSize}
                  onChange={(e) => {
                    setFormData({ ...formData, teamSize: e.target.value });
                    setIsEditing(true);
                  }}
                />
              </div>
            </div>

            <div>
              <Label>Objectifs</Label>
              <p className="text-xs text-muted-foreground mb-2">Astuce: cliquez sur un objectif pour l'éditer.</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Ajouter un objectif..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onAddObjective()}
                />
                <Button type="button" onClick={onAddObjective}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.objectives.map((obj, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {editingObjectiveIndex === index ? (
                      <Input
                        defaultValue={obj}
                        autoFocus
                        onBlur={(e) => updateObjective(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateObjective(index, e.currentTarget.value);
                          } else if (e.key === 'Escape') {
                            setEditingObjectiveIndex(null);
                          }
                        }}
                        className="flex-1"
                      />
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex-1 cursor-pointer hover:bg-secondary/80"
                        onClick={() => setEditingObjectiveIndex(index)}
                      >
                        {obj}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => onRemoveObjective(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>KPIs cibles</Label>
              <p className="text-xs text-muted-foreground mb-2">Astuce: cliquez sur un KPI pour l'éditer.</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Ajouter un KPI..."
                  value={newKPI}
                  onChange={(e) => setNewKPI(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onAddKPI()}
                />
                <Button type="button" onClick={onAddKPI}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.target_kpis.map((kpi, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {editingKPIIndex === index ? (
                      <Input
                        defaultValue={kpi}
                        autoFocus
                        onBlur={(e) => updateKPI(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateKPI(index, e.currentTarget.value);
                          } else if (e.key === 'Escape') {
                            setEditingKPIIndex(null);
                          }
                        }}
                        className="flex-1"
                      />
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex-1 cursor-pointer hover:bg-secondary/80"
                        onClick={() => setEditingKPIIndex(index)}
                      >
                        {kpi}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => onRemoveKPI(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="target_audience">Public cible</Label>
              <Textarea
                id="target_audience"
                placeholder="Qui sont les utilisateurs principaux?"
                value={formData.target_audience}
                onChange={(e) => {
                  setFormData({ ...formData, target_audience: e.target.value });
                  setIsEditing(true);
                }}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="constraints">Contraintes</Label>
              <Textarea
                id="constraints"
                placeholder="Quelles sont les contraintes techniques, budgétaires, etc.?"
                value={formData.constraints}
                onChange={(e) => {
                  setFormData({ ...formData, constraints: e.target.value });
                  setIsEditing(true);
                }}
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
