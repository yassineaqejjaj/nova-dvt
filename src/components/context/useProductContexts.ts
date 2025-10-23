import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ProductContext {
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
  // metadata is free-form; we use industrySector in the page
  metadata?: Record<string, any> | null;
}

export interface ContextHistory {
  id: string;
  version: number;
  snapshot: any;
  created_at: string;
}

export interface ContextFormData {
  name: string;
  vision: string;
  objectives: string[];
  target_kpis: string[];
  constraints: string;
  target_audience: string;
  sprintDuration: string;
  teamSize: string;
  teamRoles: string[];
  techStack: string[];
  budget: string;
  timeline: string;
  industrySector: string; // stored in metadata.industrySector
}

export function useProductContexts() {
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

  const [formData, setFormData] = useState<ContextFormData>({
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
    timeline: '',
    industrySector: ''
  });

  const [newObjective, setNewObjective] = useState('');
  const [newKPI, setNewKPI] = useState('');
  const [editingObjectiveIndex, setEditingObjectiveIndex] = useState<number | null>(null);
  const [editingKPIIndex, setEditingKPIIndex] = useState<number | null>(null);

  useEffect(() => {
    loadContexts();
  }, []);

  useEffect(() => {
    if (selectedContext) loadContextHistory(selectedContext.id);
  }, [selectedContext]);

  useEffect(() => {
    if (!isEditing || !selectedContext) return;
    const t = setTimeout(() => handleSave(true), 5000);
    return () => clearTimeout(t);
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

      const typedContexts: ProductContext[] = (data || []).map((item: any) => ({
        ...item,
        objectives: Array.isArray(item.objectives) ? item.objectives : [],
        target_kpis: Array.isArray(item.target_kpis) ? item.target_kpis : [],
        metadata: item.metadata || {}
      }));

      setContexts(typedContexts);

      if (preserveSelection && selectedContext) {
        const updated = typedContexts.find(c => c.id === selectedContext.id);
        if (updated) {
          setSelectedContext(updated);
          return;
        }
      }

      const active = typedContexts.find(c => c.is_active) || typedContexts[0];
      if (active) {
        setSelectedContext(active);
        const metadata = (active as any).metadata || {};
        setFormData({
          name: active.name,
          vision: active.vision || '',
          objectives: active.objectives || [],
          target_kpis: active.target_kpis || [],
          constraints: active.constraints || '',
          target_audience: active.target_audience || '',
          sprintDuration: metadata.sprintDuration || '2',
          teamSize: metadata.teamSize || '',
          teamRoles: metadata.teamRoles || [],
          techStack: metadata.techStack || [],
          budget: metadata.budget || '',
          timeline: metadata.timeline || '',
          industrySector: metadata.industrySector || ''
        });
      }
    } catch (e: any) {
      console.error('Error loading contexts:', e);
      toast({ title: 'Erreur', description: 'Impossible de charger les contextes', variant: 'destructive' });
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
    } catch (e) {
      console.error('Error loading history:', e);
    }
  };

  const handleSave = async (silent = false) => {
    if (!formData.name.trim()) {
      if (!silent) toast({ title: 'Nom requis', description: 'Veuillez saisir un nom', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error(userError.message);
      if (!user) throw new Error('Vous devez être connecté');

      const contextData: any = {
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
          timeline: formData.timeline,
          industrySector: formData.industrySector
        }
      };

      if (selectedContext) {
        const { user_id, ...updateData } = contextData;
        const { error } = await supabase
          .from('product_contexts')
          .update(updateData)
          .eq('id', selectedContext.id)
          .eq('user_id', user.id);
        if (error) throw error;
        if (!silent) toast({ title: 'Contexte mis à jour', description: 'Modifications sauvegardées' });
      } else {
        const { data, error } = await supabase
          .from('product_contexts')
          .insert([contextData])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) setSelectedContext(data as any);
        if (!silent) toast({ title: 'Contexte créé', description: 'Le nouveau contexte a été sauvegardé' });
      }

      await loadContexts(true);
      setIsEditing(false);
    } catch (e: any) {
      console.error('Error saving context:', e);
      if (!silent) toast({ title: 'Erreur de sauvegarde', description: e.message || 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContext = async () => {
    if (!deleteContextId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.rpc('soft_delete_context', { context_id: deleteContextId });
      if (error) throw error;
      if (selectedContext?.id === deleteContextId) {
        setSelectedContext(null);
        setFormData({
          name: '', vision: '', objectives: [], target_kpis: [], constraints: '', target_audience: '',
          sprintDuration: '2', teamSize: '', teamRoles: [], techStack: [], budget: '', timeline: '', industrySector: ''
        });
        setIsEditing(false);
      }
      toast({ title: 'Contexte supprimé', description: 'Le contexte a été supprimé avec succès' });
      setDeleteContextId(null);
      await loadContexts();
    } catch (e: any) {
      console.error('Error deleting context:', e);
      toast({ title: 'Erreur', description: e?.message || 'Impossible de supprimer le contexte', variant: 'destructive' });
      setDeleteContextId(null);
    }
  };

  const handleNewContext = () => {
    setSelectedContext(null);
    setFormData({
      name: '', vision: '', objectives: [], target_kpis: [], constraints: '', target_audience: '',
      sprintDuration: '2', teamSize: '', teamRoles: [], techStack: [], budget: '', timeline: '', industrySector: ''
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
      timeline: metadata.timeline || '',
      industrySector: metadata.industrySector || ''
    });
    setIsEditing(false);
  };

  const handleSetActive = async (contextId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error: deactivateError } = await supabase
        .from('product_contexts')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_deleted', false);
      if (deactivateError) throw deactivateError;
      const { error: activateError } = await supabase
        .from('product_contexts')
        .update({ is_active: true })
        .eq('id', contextId)
        .eq('user_id', user.id);
      if (activateError) throw activateError;
      await loadContexts(true);
      toast({ title: 'Contexte activé', description: 'Ce contexte sera utilisé par défaut' });
    } catch (e: any) {
      console.error('Error activating context:', e);
      toast({ title: 'Erreur', description: 'Impossible d\'activer le contexte', variant: 'destructive' });
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({ ...prev, objectives: [...prev.objectives, newObjective.trim()] }));
      setNewObjective('');
      setIsEditing(true);
    }
  };
  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({ ...prev, objectives: prev.objectives.filter((_, i) => i !== index) }));
    setIsEditing(true);
  };
  const handleAddKPI = () => {
    if (newKPI.trim()) {
      setFormData(prev => ({ ...prev, target_kpis: [...prev.target_kpis, newKPI.trim()] }));
      setNewKPI('');
      setIsEditing(true);
    }
  };
  const handleRemoveKPI = (index: number) => {
    setFormData(prev => ({ ...prev, target_kpis: prev.target_kpis.filter((_, i) => i !== index) }));
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

  return {
    // state
    contexts, selectedContext, contextHistory, isLoading, isSaving, showHistory, deleteContextId, searchQuery, isEditing,
    formData, newObjective, newKPI, editingObjectiveIndex, editingKPIIndex,
    // setters
    setSearchQuery, setShowHistory, setDeleteContextId, setFormData, setNewObjective, setNewKPI, setIsEditing,
    setEditingObjectiveIndex, setEditingKPIIndex,
    // actions
    loadContexts, loadContextHistory, handleSave, handleDeleteContext, handleNewContext, handleSelectContext, handleSetActive,
    handleAddObjective, handleRemoveObjective, handleAddKPI, handleRemoveKPI, updateObjective, updateKPI,
  };
}
