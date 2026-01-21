import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Frown, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2,
  Check,
  X,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Persona } from './types';

interface StepPersonasProps {
  personas: Persona[];
  onUpdate: (personas: Persona[]) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  onRegenerate: () => void;
}

export const StepPersonas = ({
  personas,
  onUpdate,
  onNext,
  onBack,
  isLoading,
  onRegenerate
}: StepPersonasProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPersona, setNewPersona] = useState<Omit<Persona, 'id' | 'selected'>>({
    role: '',
    mainGoal: '',
    keyFrustration: '',
    usageContext: ''
  });

  const selectedCount = personas.filter(p => p.selected).length;

  const handleToggleSelect = (id: string) => {
    onUpdate(personas.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleEdit = (id: string, field: keyof Omit<Persona, 'id' | 'selected'>, value: string) => {
    onUpdate(personas.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleDelete = (id: string) => {
    onUpdate(personas.filter(p => p.id !== id));
  };

  const handleAddNew = () => {
    if (newPersona.role.trim()) {
      onUpdate([
        ...personas,
        {
          id: crypto.randomUUID(),
          ...newPersona,
          selected: true
        }
      ]);
      setNewPersona({
        role: '',
        mainGoal: '',
        keyFrustration: '',
        usageContext: ''
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
              <h3 className="font-semibold">Proposition de Personas</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez et ajustez les personas pertinents pour votre discovery
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

      {/* Personas List */}
      <div className="grid gap-4">
        {personas.map((persona) => (
          <Card 
            key={persona.id} 
            className={`transition-all ${persona.selected ? 'ring-2 ring-primary' : 'opacity-60'}`}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={persona.selected}
                  onCheckedChange={() => handleToggleSelect(persona.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-3">
                  {editingId === persona.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                        <Input
                          value={persona.role}
                          onChange={(e) => handleEdit(persona.id, 'role', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Objectif principal</label>
                        <Textarea
                          value={persona.mainGoal}
                          onChange={(e) => handleEdit(persona.id, 'mainGoal', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Frustration clé</label>
                        <Textarea
                          value={persona.keyFrustration}
                          onChange={(e) => handleEdit(persona.id, 'keyFrustration', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Contexte d'usage</label>
                        <Textarea
                          value={persona.usageContext}
                          onChange={(e) => handleEdit(persona.id, 'usageContext', e.target.value)}
                          rows={2}
                        />
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
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">{persona.role}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(persona.id)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => handleDelete(persona.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Objectif : </span>
                            {persona.mainGoal}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Frown className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Frustration : </span>
                            {persona.keyFrustration}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Contexte : </span>
                            {persona.usageContext}
                          </div>
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

      {/* Add New Persona */}
      {showNewForm ? (
        <Card className="border-dashed">
          <CardContent className="py-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Rôle</label>
              <Input
                placeholder="Ex: Responsable commercial"
                value={newPersona.role}
                onChange={(e) => setNewPersona({ ...newPersona, role: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Objectif principal</label>
              <Textarea
                placeholder="Quel est son objectif principal ?"
                value={newPersona.mainGoal}
                onChange={(e) => setNewPersona({ ...newPersona, mainGoal: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frustration clé</label>
              <Textarea
                placeholder="Quelle est sa principale frustration ?"
                value={newPersona.keyFrustration}
                onChange={(e) => setNewPersona({ ...newPersona, keyFrustration: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contexte d'usage</label>
              <Textarea
                placeholder="Dans quel contexte utilise-t-il le produit ?"
                value={newPersona.usageContext}
                onChange={(e) => setNewPersona({ ...newPersona, usageContext: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNew} disabled={!newPersona.role.trim()}>
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
          Créer un nouveau persona
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onNext} disabled={selectedCount === 0 || isLoading}>
          Valider et passer aux Parcours
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
