import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, History, Search, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ProductContext {
  id: string;
  name: string;
  vision: string | null;
  objectives: string[];
  target_kpis: string[];
  constraints: string | null;
  target_audience: string | null;
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

export const ProductContextPage = () => {
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
    sprintDuration: '2',
    teamSize: '',
    teamRoles: [] as string[],
    techStack: [] as string[],
    budget: '',
    timeline: ''
  });

  const [newObjective, setNewObjective] = useState('');
  const [newKPI, setNewKPI] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    loadContexts();
  }, []);

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
        target_kpis: Array.isArray(item.target_kpis) ? item.target_kpis as string[] : []
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
        const metadata = (activeContext as any).metadata || {};
        setFormData({
          name: activeContext.name,
          vision: activeContext.vision || '',
          objectives: activeContext.objectives || [],
          target_kpis: activeContext.target_kpis || [],
          constraints: activeContext.constraints || '',
          target_audience: activeContext.target_audience || '',
          sprintDuration: metadata.sprintDuration || '2',
          teamSize: metadata.teamSize || '',
          teamRoles: metadata.teamRoles || [],
          techStack: metadata.techStack || [],
          budget: metadata.budget || '',
          timeline: metadata.timeline || ''
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

      const contextData = {
        user_id: user.id,
        name: formData.name.trim(),
        vision: formData.vision.trim() || null,
        objectives: formData.objectives.filter(o => o.trim()),
        target_kpis: formData.target_kpis.filter(k => k.trim()),
        constraints: formData.constraints.trim() || null,
        target_audience: formData.target_audience.trim() || null,
        metadata: {
          sprintDuration: formData.sprintDuration,
          teamSize: formData.teamSize,
          teamRoles: formData.teamRoles.filter(r => r.trim()),
          techStack: formData.techStack.filter(t => t.trim()),
          budget: formData.budget,
          timeline: formData.timeline
        }
      } as any;

      if (selectedContext) {
        // Update existing
        const { error } = await supabase
          .from('product_contexts')
          .update(contextData)
          .eq('id', selectedContext.id);

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

        const { data, error } = await supabase
          .from('product_contexts')
          .insert([contextData])
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
          description: "Le nouveau contexte a été sauvegardé"
        });
      }

      loadContexts(true); // Preserve selection after save
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving context:', error);
      const errorMessage = error.message || error.details || "Impossible de sauvegarder le contexte";
      toast({
        title: "Erreur de sauvegarde",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
      setIsEditing(true);
    }
  };

  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
    setIsEditing(true);
  };

  const handleAddKPI = () => {
    if (newKPI.trim()) {
      setFormData(prev => ({
        ...prev,
        target_kpis: [...prev.target_kpis, newKPI.trim()]
      }));
      setNewKPI('');
      setIsEditing(true);
    }
  };

  const handleRemoveKPI = (index: number) => {
    setFormData(prev => ({
      ...prev,
      target_kpis: prev.target_kpis.filter((_, i) => i !== index)
    }));
    setIsEditing(true);
  };

  const handleDeleteContext = async () => {
    if (!deleteContextId) return;

    try {
      const { error } = await supabase
        .from('product_contexts')
        .update({ is_deleted: true })
        .eq('id', deleteContextId);

      if (error) throw error;

      toast({
        title: "Contexte supprimé",
        description: "Le contexte a été supprimé avec succès"
      });

      setDeleteContextId(null);
      loadContexts();
    } catch (error: any) {
      console.error('Error deleting context:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contexte",
        variant: "destructive"
      });
    }
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
      sprintDuration: '2',
      teamSize: '',
      teamRoles: [],
      techStack: [],
      budget: '',
      timeline: ''
    });
    setIsEditing(false);
  };

  const handleSelectContext = (context: ProductContext) => {
    setSelectedContext(context);
    const metadata = (context as any).metadata || {};
    setFormData({
      name: context.name,
      vision: context.vision || '',
      objectives: context.objectives || [],
      target_kpis: context.target_kpis || [],
      constraints: context.constraints || '',
      target_audience: context.target_audience || '',
      sprintDuration: metadata.sprintDuration || '2',
      teamSize: metadata.teamSize || '',
      teamRoles: metadata.teamRoles || [],
      techStack: metadata.techStack || [],
      budget: metadata.budget || '',
      timeline: metadata.timeline || ''
    });
    setIsEditing(false);
  };

  const filteredContexts = contexts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetActive = async (contextId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Deactivate all contexts
      const { error: deactivateError } = await supabase
        .from('product_contexts')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_deleted', false);

      if (deactivateError) throw deactivateError;

      // Activate selected context
      const { error: activateError } = await supabase
        .from('product_contexts')
        .update({ is_active: true })
        .eq('id', contextId)
        .eq('user_id', user.id);

      if (activateError) throw activateError;

      await loadContexts(true);
      toast({
        title: "Contexte activé",
        description: "Ce contexte sera utilisé par défaut"
      });
    } catch (error: any) {
      console.error('Error activating context:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le contexte",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Contexte Produit Global</h1>
        <p className="text-muted-foreground">
          Gérez et réutilisez vos contextes produit à travers toute l'application
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Contexts List - Full Width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Mes Contextes ({contexts.length}/10)</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Button onClick={handleNewContext} size="default">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau contexte
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredContexts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'Aucun contexte trouvé' : 'Aucun contexte. Créez-en un pour commencer!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredContexts.map((context) => (
                  <Card
                    key={context.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedContext?.id === context.id
                        ? 'border-primary shadow-md ring-2 ring-primary/20'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectContext(context)}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base truncate">{context.name}</h3>
                              {context.is_active && (
                                <Badge variant="default" className="text-xs shrink-0">
                                  Actif
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                              {context.vision || 'Aucune vision définie'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {context.objectives.length} objectifs
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {context.target_kpis.length} KPIs
                          </Badge>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button
                            variant={context.is_active ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={(e) => handleSetActive(context.id, e)}
                            disabled={context.is_active}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            {context.is_active ? 'Actif' : 'Définir actif'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteContextId(context.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Context Editor - Full Width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedContext ? 'Modifier le contexte' : 'Nouveau contexte'}
                </CardTitle>
                <CardDescription>
                  {selectedContext
                    ? 'Sauvegarde automatique toutes les 5 secondes'
                    : 'Créez un nouveau contexte produit'}
                </CardDescription>
              </div>
              {selectedContext && contextHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="w-4 h-4 mr-1" />
                  Historique
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Nom du contexte *</Label>
                  <Input
                    id="name"
                    placeholder="ex: Application mobile e-commerce"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
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
                      setFormData(prev => ({ ...prev, vision: e.target.value }));
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
                        setFormData(prev => ({ ...prev, sprintDuration: e.target.value }));
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
                        setFormData(prev => ({ ...prev, teamSize: e.target.value }));
                        setIsEditing(true);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Rôles de l'équipe</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="ex: Product Owner, Scrum Master..."
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newRole.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              teamRoles: [...prev.teamRoles, newRole.trim()]
                            }));
                            setNewRole('');
                            setIsEditing(true);
                          }
                        }
                      }}
                    />
                    <Button type="button" onClick={() => {
                      if (newRole.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          teamRoles: [...prev.teamRoles, newRole.trim()]
                        }));
                        setNewRole('');
                        setIsEditing(true);
                      }
                    }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.teamRoles.map((role, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {role}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              teamRoles: prev.teamRoles.filter((_, i) => i !== index)
                            }));
                            setIsEditing(true);
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Stack technique</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="ex: React, Node.js, PostgreSQL..."
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTech.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              techStack: [...prev.techStack, newTech.trim()]
                            }));
                            setNewTech('');
                            setIsEditing(true);
                          }
                        }
                      }}
                    />
                    <Button type="button" onClick={() => {
                      if (newTech.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          techStack: [...prev.techStack, newTech.trim()]
                        }));
                        setNewTech('');
                        setIsEditing(true);
                      }
                    }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              techStack: prev.techStack.filter((_, i) => i !== index)
                            }));
                            setIsEditing(true);
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      placeholder="ex: 100k€"
                      value={formData.budget}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, budget: e.target.value }));
                        setIsEditing(true);
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="ex: Q1 2025 - Q4 2025"
                      value={formData.timeline}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, timeline: e.target.value }));
                        setIsEditing(true);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Objectifs</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ajouter un objectif..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddObjective()}
                    />
                    <Button type="button" onClick={handleAddObjective}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.objectives.map((obj, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded-md"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="flex-1 text-sm">{obj}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveObjective(index)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>KPIs cibles</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ajouter un KPI..."
                      value={newKPI}
                      onChange={(e) => setNewKPI(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddKPI()}
                    />
                    <Button type="button" onClick={handleAddKPI}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.target_kpis.map((kpi, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded-md"
                      >
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="flex-1 text-sm">{kpi}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveKPI(index)}
                          className="h-6 w-6"
                        >
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
                      setFormData(prev => ({ ...prev, target_audience: e.target.value }));
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
                      setFormData(prev => ({ ...prev, constraints: e.target.value }));
                      setIsEditing(true);
                    }}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {selectedContext ? 'Sauvegarder' : 'Créer le contexte'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteContextId} onOpenChange={() => setDeleteContextId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le contexte?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement ce contexte. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContext}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
