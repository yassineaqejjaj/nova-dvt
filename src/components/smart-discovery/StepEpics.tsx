import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp,
  Users,
  BarChart3,
  Edit3, 
  Trash2,
  Check,
  Plus,
  ArrowRight,
  Loader2,
  Merge
} from 'lucide-react';
import { Epic, Persona } from './types';

interface StepEpicsProps {
  epics: Epic[];
  personas: Persona[];
  onUpdate: (epics: Epic[]) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  onRegenerate: () => void;
}

export const StepEpics = ({
  epics,
  personas,
  onUpdate,
  onNext,
  onBack,
  isLoading,
  onRegenerate
}: StepEpicsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newEpic, setNewEpic] = useState<Omit<Epic, 'id' | 'selected'>>({
    title: '',
    description: '',
    objective: '',
    expectedValue: '',
    personaId: '',
    personaRole: '',
    indicators: []
  });
  const [newIndicator, setNewIndicator] = useState('');

  const selectedPersonas = personas.filter(p => p.selected);
  const selectedCount = epics.filter(e => e.selected).length;

  const handleToggleSelect = (id: string) => {
    onUpdate(epics.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const handleEdit = (id: string, field: keyof Omit<Epic, 'id' | 'selected'>, value: any) => {
    onUpdate(epics.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleDelete = (id: string) => {
    onUpdate(epics.filter(e => e.id !== id));
  };

  const handleAddIndicator = (epicId: string, indicator: string) => {
    if (indicator.trim()) {
      const epic = epics.find(e => e.id === epicId);
      if (epic) {
        handleEdit(epicId, 'indicators', [...epic.indicators, indicator.trim()]);
      }
    }
  };

  const handleRemoveIndicator = (epicId: string, index: number) => {
    const epic = epics.find(e => e.id === epicId);
    if (epic) {
      handleEdit(epicId, 'indicators', epic.indicators.filter((_, i) => i !== index));
    }
  };

  const handleAddNew = () => {
    if (newEpic.title.trim() && newEpic.personaId) {
      const persona = selectedPersonas.find(p => p.id === newEpic.personaId);
      onUpdate([
        ...epics,
        {
          id: crypto.randomUUID(),
          ...newEpic,
          personaRole: persona?.role || '',
          selected: true
        }
      ]);
      setNewEpic({
        title: '',
        description: '',
        objective: '',
        expectedValue: '',
        personaId: '',
        personaRole: '',
        indicators: []
      });
      setShowNewForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Génération des Epics</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez les Epics à transformer en User Stories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={selectedCount > 0 ? "default" : "secondary"}>
                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
              </Badge>
              <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Régénérer"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Epics List */}
      <div className="grid gap-4">
        {epics.map((epic) => (
          <Card 
            key={epic.id} 
            className={`transition-all ${epic.selected ? 'ring-2 ring-primary' : 'opacity-60'}`}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={epic.selected}
                  onCheckedChange={() => handleToggleSelect(epic.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-3">
                  {editingId === epic.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Titre</label>
                        <Input
                          value={epic.title}
                          onChange={(e) => handleEdit(epic.id, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <Textarea
                          value={epic.description}
                          onChange={(e) => handleEdit(epic.id, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Objectif</label>
                        <Textarea
                          value={epic.objective}
                          onChange={(e) => handleEdit(epic.id, 'objective', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Valeur attendue</label>
                        <Textarea
                          value={epic.expectedValue}
                          onChange={(e) => handleEdit(epic.id, 'expectedValue', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Persona concerné</label>
                        <select
                          value={epic.personaId}
                          onChange={(e) => {
                            const persona = selectedPersonas.find(p => p.id === e.target.value);
                            handleEdit(epic.id, 'personaId', e.target.value);
                            handleEdit(epic.id, 'personaRole', persona?.role || '');
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          {selectedPersonas.map(p => (
                            <option key={p.id} value={p.id}>{p.role}</option>
                          ))}
                        </select>
                      </div>
                      <Button size="sm" onClick={() => setEditingId(null)}>
                        <Check className="mr-1 h-4 w-4" />
                        Terminé
                      </Button>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{epic.title}</h3>
                          <Badge variant="outline" className="mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            {epic.personaRole}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(epic.id)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => handleDelete(epic.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{epic.description}</p>
                      
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Objectif : </span>
                            {epic.objective}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Valeur attendue : </span>
                            {epic.expectedValue}
                          </div>
                        </div>
                      </div>

                      {/* Indicators */}
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1 mb-2">
                          <BarChart3 className="h-4 w-4" />
                          Indicateurs liés
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {epic.indicators.map((indicator, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {indicator}
                              <button 
                                onClick={() => handleRemoveIndicator(epic.id, idx)}
                                className="hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Epic */}
      {showNewForm ? (
        <Card className="border-dashed">
          <CardContent className="py-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                placeholder="Ex: Améliorer l'export de données"
                value={newEpic.title}
                onChange={(e) => setNewEpic({ ...newEpic, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Décrivez l'Epic..."
                value={newEpic.description}
                onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Objectif</label>
              <Textarea
                placeholder="Quel est l'objectif de cet Epic ?"
                value={newEpic.objective}
                onChange={(e) => setNewEpic({ ...newEpic, objective: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valeur attendue</label>
              <Textarea
                placeholder="Quelle valeur apporte cet Epic ?"
                value={newEpic.expectedValue}
                onChange={(e) => setNewEpic({ ...newEpic, expectedValue: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Persona concerné</label>
              <select
                value={newEpic.personaId}
                onChange={(e) => setNewEpic({ ...newEpic, personaId: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Sélectionner un persona</option>
                {selectedPersonas.map(p => (
                  <option key={p.id} value={p.id}>{p.role}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNew} disabled={!newEpic.title.trim() || !newEpic.personaId}>
                <Plus className="mr-1 h-4 w-4" />
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowNewForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un nouvel Epic
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onNext} disabled={selectedCount === 0 || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              Générer les User Stories
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
