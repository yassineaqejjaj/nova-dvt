import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, History, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductContext {
  id: string;
  name: string;
  vision: string | null;
  objectives: string[];
  target_kpis: string[];
  constraints: string | null;
  target_audience: string | null;
  industry_sector?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ContextHistory {
  id: string;
  version: number;
  snapshot: any;
  created_at: string;
}

interface ProductContextManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContextSelected?: () => void;
}

export const ProductContextManager = ({ open, onOpenChange, onContextSelected }: ProductContextManagerProps) => {
  const { toast } = useToast();
  const [contexts, setContexts] = useState<ProductContext[]>([]);
  const [selectedContext, setSelectedContext] = useState<ProductContext | null>(null);
  const [contextHistory, setContextHistory] = useState<ContextHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deleteContextId, setDeleteContextId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    vision: '',
    objectives: [] as string[],
    target_kpis: [] as string[],
    constraints: '',
    target_audience: '',
    industry_sector: ''
  });

  const [newObjective, setNewObjective] = useState('');
  const [newKPI, setNewKPI] = useState('');
  const [editingObjectiveIndex, setEditingObjectiveIndex] = useState<number | null>(null);
  const [editingKPIIndex, setEditingKPIIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadContexts();
    }
  }, [open]);

  useEffect(() => {
    if (selectedContext) {
      loadContextHistory(selectedContext.id);
    }
  }, [selectedContext]);

  // Autosave every 5 seconds when editing
  useEffect(() => {
    if (!isEditing || !selectedContext) return;

    const timer = setTimeout(() => {
      handleSave(true); // silent save
    }, 5000);

    return () => clearTimeout(timer);
  }, [formData, isEditing, selectedContext]);

  const loadContexts = async (preserveSelection = false) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('product_contexts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const typedContexts: ProductContext[] = (data || []).map(item => ({
        ...item,
        objectives: Array.isArray(item.objectives) ? item.objectives as string[] : [],
        target_kpis: Array.isArray(item.target_kpis) ? item.target_kpis as string[] : [],
        industry_sector: (item as any).industry_sector ?? ((item as any).metadata?.industry_sector ?? '')
      }));
      
      setContexts(typedContexts);

      // If preserving selection and a context is already selected, keep it
      if (preserveSelection && selectedContext) {
        const updatedContext = typedContexts.find(c => c.id === selectedContext.id);
        if (updatedContext) {
          setSelectedContext(updatedContext);
          return; // Don't update form data, keep user's edits
        }
      }

      // Otherwise, select active context or most recent
      const activeContext = typedContexts?.find(c => c.is_active) || typedContexts?.[0];
      if (activeContext) {
        setSelectedContext(activeContext);
        setFormData({
          name: activeContext.name,
          vision: activeContext.vision || '',
          objectives: activeContext.objectives || [],
          target_kpis: activeContext.target_kpis || [],
          constraints: activeContext.constraints || '',
          target_audience: activeContext.target_audience || '',
          industry_sector: activeContext.industry_sector || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading contexts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contextes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadContextHistory = async (contextId: string) => {
    try {
      const { data, error } = await supabase
        .from('context_history')
        .select('*')
        .eq('context_id', contextId)
        .order('version', { ascending: false })
        .limit(3);

      if (error) throw error;
      setContextHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSave = async (silent = false) => {
    if (!formData.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour le contexte",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Erreur d\'authentification: ' + userError.message);
      }
      if (!user) throw new Error('Vous devez être connecté pour sauvegarder un contexte');

      const sectorVal = formData.industry_sector.trim() || null;

      const baseData = {
        user_id: user.id,
        name: formData.name.trim(),
        vision: formData.vision.trim() || null,
        objectives: formData.objectives.filter(o => o.trim()),
        target_kpis: formData.target_kpis.filter(k => k.trim()),
        constraints: formData.constraints.trim() || null,
        target_audience: formData.target_audience.trim() || null
      };

      if (selectedContext) {
        // Update existing (do not update user_id on UPDATE to satisfy RLS WITH CHECK)
        const { user_id, ...rest } = baseData as any;
        const updateData = {
          ...rest,
          metadata: {
            ...(((selectedContext as any)?.metadata) || {}),
            industry_sector: sectorVal
          }
        };
        const { error } = await supabase
          .from('product_contexts')
          .update(updateData)
          .eq('id', selectedContext.id)
          .eq('user_id', user.id);

        if (error) throw error;

        if (!silent) {
          toast({
            title: "Contexte mis à jour",
            description: "Les modifications ont été sauvegardées"
          });
        }
      } else {
        // Create new - check limit
        if (contexts.length >= 10) {
          toast({
            title: "Limite atteinte",
            description: "Vous avez atteint la limite de 10 contextes. Supprimez-en un pour continuer.",
            variant: "destructive"
          });
          return;
        }

        const insertData = {
          ...baseData,
          metadata: { industry_sector: sectorVal }
        };

        const { data, error } = await supabase
          .from('product_contexts')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        
        const typedContext: ProductContext = {
          ...data,
          objectives: Array.isArray(data.objectives) ? data.objectives as string[] : [],
          target_kpis: Array.isArray(data.target_kpis) ? data.target_kpis as string[] : []
        };
        
        setSelectedContext(typedContext);
        
        toast({
          title: "Contexte créé",
          description: "Le nouveau contexte a été créé avec succès"
        });
      }

      await loadContexts(true); // Preserve selection after save
    } catch (error: any) {
      console.error('Error saving context:', error);
      if (!silent) {
        const errorMessage = error.message || error.details || "Impossible de sauvegarder le contexte";
        toast({
          title: "Erreur de sauvegarde",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = async (contextId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, deactivate all contexts
      const { error: deactivateError } = await supabase
        .from('product_contexts')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_deleted', false);

      if (deactivateError) {
        console.error('Error deactivating contexts:', deactivateError);
        throw deactivateError;
      }

      // Then activate the selected one
      const { error: activateError } = await supabase
        .from('product_contexts')
        .update({ is_active: true })
        .eq('id', contextId)
        .eq('user_id', user.id);

      if (activateError) {
        console.error('Error activating context:', activateError);
        throw activateError;
      }

      await loadContexts(true);
      
      // Notify parent component to reload active context
      if (onContextSelected) {
        onContextSelected();
      }
      
      toast({
        title: "Contexte activé",
        description: "Ce contexte sera utilisé par défaut dans les workflows"
      });
    } catch (error: any) {
      console.error('Error setting active context:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'activer le contexte",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteContextId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mark as deleted (soft delete)
      const { error } = await supabase
        .rpc('soft_delete_context', { context_id: deleteContextId });

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast({
        title: "Contexte supprimé",
        description: "Le contexte a été supprimé avec succès"
      });

      // Clear form if deleting current context
      if (selectedContext?.id === deleteContextId) {
        setSelectedContext(null);
        setFormData({
          name: '',
          vision: '',
          objectives: [],
          target_kpis: [],
          constraints: '',
          target_audience: '',
          industry_sector: ''
        });
      }

      // Reload contexts
      await loadContexts();
    } catch (error: any) {
      console.error('Error deleting context:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le contexte",
        variant: "destructive"
      });
    } finally {
      setDeleteContextId(null);
    }
  };

  const handleRestore = async (historyItem: ContextHistory) => {
    if (!selectedContext) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const snapshot = historyItem.snapshot;
      const { error } = await supabase
        .from('product_contexts')
        .update({
          name: snapshot.name,
          vision: snapshot.vision,
          objectives: snapshot.objectives,
          target_kpis: snapshot.target_kpis,
          constraints: snapshot.constraints,
          target_audience: snapshot.target_audience
        })
        .eq('id', selectedContext.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setFormData({
        name: snapshot.name,
        vision: snapshot.vision || '',
        objectives: snapshot.objectives || [],
        target_kpis: snapshot.target_kpis || [],
        constraints: snapshot.constraints || '',
        target_audience: snapshot.target_audience || '',
        industry_sector: snapshot.industry_sector || ''
      });

      toast({
        title: "Version restaurée",
        description: `Version ${historyItem.version} restaurée avec succès`
      });

      await loadContexts();
      setShowHistory(false);
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: "Erreur",
        description: "Impossible de restaurer la version",
        variant: "destructive"
      });
    }
  };

  const handleSelectContext = (context: ProductContext) => {
    setSelectedContext(context);
    setFormData({
      name: context.name,
      vision: context.vision || '',
      objectives: context.objectives || [],
      target_kpis: context.target_kpis || [],
      constraints: context.constraints || '',
      target_audience: context.target_audience || '',
      industry_sector: context.industry_sector || ''
    });
    setIsEditing(false);
  };

  const handleNewContext = () => {
    setSelectedContext(null);
    setFormData({
      name: '',
      vision: '',
      objectives: [],
      target_kpis: [],
      constraints: '',
      target_audience: '',
      industry_sector: ''
    });
    setIsEditing(true);
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
      setIsEditing(true);
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
    setIsEditing(true);
  };

  const updateObjective = (index: number, newValue: string) => {
    if (newValue.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.map((obj, i) => i === index ? newValue.trim() : obj)
      }));
      setIsEditing(true);
    }
    setEditingObjectiveIndex(null);
  };

  const addKPI = () => {
    if (newKPI.trim()) {
      setFormData(prev => ({
        ...prev,
        target_kpis: [...prev.target_kpis, newKPI.trim()]
      }));
      setNewKPI('');
      setIsEditing(true);
    }
  };

  const removeKPI = (index: number) => {
    setFormData(prev => ({
      ...prev,
      target_kpis: prev.target_kpis.filter((_, i) => i !== index)
    }));
    setIsEditing(true);
  };

  const updateKPI = (index: number, newValue: string) => {
    if (newValue.trim()) {
      setFormData(prev => ({
        ...prev,
        target_kpis: prev.target_kpis.map((kpi, i) => i === index ? newValue.trim() : kpi)
      }));
      setIsEditing(true);
    }
    setEditingKPIIndex(null);
  };

  const filteredContexts = contexts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestion des Contextes Produit</DialogTitle>
            <DialogDescription>
              Créez et gérez les contextes de vos projets pour alimenter automatiquement vos workflows
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
            {/* Left sidebar - Context list */}
            <div className="col-span-1 flex flex-col gap-2 overflow-hidden">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={handleNewContext} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredContexts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {searchQuery ? 'Aucun contexte trouvé' : 'Aucun contexte. Créez-en un !'}
                    </div>
                  ) : (
                    filteredContexts.map(context => (
                      <Card
                        key={context.id}
                        className={`cursor-pointer transition-colors ${
                          selectedContext?.id === context.id
                            ? 'border-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleSelectContext(context)}
                      >
                        <CardHeader className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm">{context.name}</CardTitle>
                            {context.is_active && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Actif
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-xs">
                            Mis à jour {new Date(context.updated_at).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="text-xs text-muted-foreground text-center">
                {contexts.length} / 10 contextes
              </div>
            </div>

            {/* Right content - Context form */}
            <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
              {selectedContext || isEditing ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSaving && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Sauvegarde...
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {selectedContext && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHistory(true)}
                          >
                            <History className="h-4 w-4 mr-2" />
                            Historique
                          </Button>
                          {!selectedContext.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetActive(selectedContext.id)}
                            >
                              Définir comme actif
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteContextId(selectedContext.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button onClick={() => handleSave(false)} disabled={isSaving}>
                        Sauvegarder
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-4 pr-4">
                      <div className="space-y-2">
                        <Label>Secteur d'activité</Label>
                        <Select
                          value={formData.industry_sector}
                          onValueChange={(v) => {
                            setFormData({ ...formData, industry_sector: v });
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

                      <div className="space-y-2">
                        <Label htmlFor="name">Nom du produit *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            setIsEditing(true);
                          }}
                          placeholder="Ex: Application mobile de gestion de tâches"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vision">Vision</Label>
                        <Textarea
                          id="vision"
                          value={formData.vision}
                          onChange={(e) => {
                            setFormData({ ...formData, vision: e.target.value });
                            setIsEditing(true);
                          }}
                          placeholder="Quelle est la vision de votre produit ?"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Objectifs</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newObjective}
                            onChange={(e) => setNewObjective(e.target.value)}
                            placeholder="Ajouter un objectif"
                            onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                          />
                          <Button onClick={addObjective} size="icon" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {formData.objectives.map((obj, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {editingObjectiveIndex === idx ? (
                                <Input
                                  defaultValue={obj}
                                  autoFocus
                                  onBlur={(e) => updateObjective(idx, e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      updateObjective(idx, e.currentTarget.value);
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
                                  onClick={() => setEditingObjectiveIndex(idx)}
                                >
                                  {obj}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeObjective(idx)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>KPIs Cibles</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newKPI}
                            onChange={(e) => setNewKPI(e.target.value)}
                            placeholder="Ajouter un KPI"
                            onKeyPress={(e) => e.key === 'Enter' && addKPI()}
                          />
                          <Button onClick={addKPI} size="icon" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {formData.target_kpis.map((kpi, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {editingKPIIndex === idx ? (
                                <Input
                                  defaultValue={kpi}
                                  autoFocus
                                  onBlur={(e) => updateKPI(idx, e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      updateKPI(idx, e.currentTarget.value);
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
                                  onClick={() => setEditingKPIIndex(idx)}
                                >
                                  {kpi}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeKPI(idx)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="constraints">Contraintes</Label>
                        <Textarea
                          id="constraints"
                          value={formData.constraints}
                          onChange={(e) => {
                            setFormData({ ...formData, constraints: e.target.value });
                            setIsEditing(true);
                          }}
                          placeholder="Quelles sont les contraintes techniques, budgétaires ou temporelles ?"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry_sector">
                          Secteur d'activité
                        </Label>
                        <Input
                          id="industry_sector"
                          value={formData.industry_sector}
                          onChange={(e) => {
                            setFormData({ ...formData, industry_sector: e.target.value });
                            setIsEditing(true);
                          }}
                          placeholder="Ex: E-commerce, SaaS, FinTech, HealthTech..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target_audience">
                          Public cible
                        </Label>
                        <Textarea
                          id="target_audience"
                          value={formData.target_audience}
                          onChange={(e) => {
                            setFormData({ ...formData, target_audience: e.target.value });
                            setIsEditing(true);
                          }}
                          placeholder="Qui sont vos utilisateurs cibles ?"
                          rows={2}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez ou créez un contexte</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historique des versions</DialogTitle>
            <DialogDescription>
              Les 3 dernières versions de ce contexte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {contextHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun historique disponible
              </p>
            ) : (
              contextHistory.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">
                          Version {item.version}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(item.created_at).toLocaleString('fr-FR')}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item)}
                      >
                        Restaurer
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteContextId} onOpenChange={(open) => { if (!open) setDeleteContextId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement ce contexte.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};