import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Artifact } from '@/types';
import { 
  Search, FileText, Grid3X3, TrendingUp, Loader2, 
  FolderOpen, Plus, Layers, Code, Clock, Star, SortAsc
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CanvasGenerator } from './CanvasGenerator';
import { ProjectArtifactsView } from './ProjectArtifactsView';
import { EnhancedArtifactCard } from './artifacts/EnhancedArtifactCard';
import { ArtifactStats } from './artifacts/ArtifactStats';

interface ArtifactsProps {
  userId: string;
}

interface EnhancedArtifact extends Artifact {
  squad_name?: string;
  product_context_name?: string;
  product_context_id?: string;
  workflow_source?: string;
  status?: 'draft' | 'validated' | 'obsolete';
  is_key?: boolean;
  usage_count?: number;
}

export const Artifacts: React.FC<ArtifactsProps> = ({ userId }) => {
  const [artifacts, setArtifacts] = useState<EnhancedArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'type'>('recent');
  const [showGenerator, setShowGenerator] = useState(false);
  const [activeContextId, setActiveContextId] = useState<string | null>(null);

  useEffect(() => {
    loadArtifacts();
    loadActiveContext();
  }, [userId]);

  const loadActiveContext = async () => {
    try {
      const { data } = await supabase
        .from('product_contexts')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .maybeSingle();
      if (data) setActiveContextId(data.id);
    } catch (error) {
      console.error('Error loading context:', error);
    }
  };

  const loadArtifacts = async () => {
    try {
      setLoading(true);
      
      // Load artifacts with related data
      const { data: artifactsData, error: artifactsError } = await supabase
        .from('artifacts')
        .select(`
          *,
          squads:squad_id(name),
          product_contexts:product_context_id(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (artifactsError) throw artifactsError;
      
      // Enhance artifacts with additional data
      const enhanced: EnhancedArtifact[] = (artifactsData || []).map((a: any) => ({
        ...a,
        squad_name: a.squads?.name,
        product_context_name: a.product_contexts?.name,
        // Derive status from metadata or default
        status: a.metadata?.status || 'draft',
        is_key: a.metadata?.is_key || false,
        usage_count: a.metadata?.usage_count || 0,
        workflow_source: a.metadata?.workflow_source,
      }));

      setArtifacts(enhanced);
    } catch (error) {
      console.error('Error loading artifacts:', error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des artefacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('artifacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setArtifacts(artifacts.filter(a => a.id !== id));
      toast({
        title: 'Succès',
        description: 'Artefact supprimé avec succès',
      });
    } catch (error) {
      console.error('Error deleting artifact:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de suppression de l\'artefact',
        variant: 'destructive',
      });
    }
  };

  const handleTransform = async (artifact: Artifact, targetType: string) => {
    toast({ 
      title: 'Transformation en cours...', 
      description: `Génération de ${targetType} à partir de "${artifact.title}"` 
    });
    // TODO: Implement AI transformation logic
  };

  const handleAddToProject = (artifact: Artifact) => {
    toast({ title: 'Fonctionnalité à venir', description: 'Ajout à un projet sera disponible prochainement' });
  };

  const handleContinueWith = (artifact: Artifact) => {
    toast({ title: 'Fonctionnalité à venir', description: 'Continuer avec un agent sera disponible prochainement' });
  };

  // Smart filtering and sorting
  const filteredAndSortedArtifacts = React.useMemo(() => {
    let result = artifacts.filter(artifact => {
      const matchesSearch = artifact.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || artifact.artifact_type === filterType;
      return matchesSearch && matchesType;
    });

    // Priority sort: key artifacts first, then context-related, then by sortBy
    result.sort((a, b) => {
      // Key artifacts first
      if (a.is_key && !b.is_key) return -1;
      if (!a.is_key && b.is_key) return 1;
      
      // Active context artifacts second
      if (activeContextId) {
        const aInContext = a.product_context_id === activeContextId;
        const bInContext = b.product_context_id === activeContextId;
        if (aInContext && !bInContext) return -1;
        if (!aInContext && bInContext) return 1;
      }

      // Then by selected sort
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.artifact_type.localeCompare(b.artifact_type);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [artifacts, searchTerm, filterType, sortBy, activeContextId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'canvas': return <Grid3X3 className="w-4 h-4" />;
      case 'story': return <FileText className="w-4 h-4" />;
      case 'impact_analysis': return <TrendingUp className="w-4 h-4" />;
      case 'epic': return <Layers className="w-4 h-4" />;
      case 'tech_spec': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const stats = {
    total: artifacts.length,
    canvas: artifacts.filter(a => a.artifact_type === 'canvas').length,
    story: artifacts.filter(a => a.artifact_type === 'story').length,
    impact_analysis: artifacts.filter(a => a.artifact_type === 'impact_analysis').length,
    epic: artifacts.filter(a => a.artifact_type === 'epic').length,
    tech_spec: artifacts.filter(a => a.artifact_type === 'tech_spec' as any).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Artefacts</CardTitle>
              <CardDescription>
                Gérez vos artefacts par projet ou consultez la liste complète
              </CardDescription>
            </div>
            <Button onClick={() => setShowGenerator(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un artefact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="all">
                <FileText className="h-4 w-4 mr-2" />
                Tous les artefacts
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FolderOpen className="h-4 w-4 mr-2" />
                Par projet
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {/* Clickable Stats */}
              <ArtifactStats 
                stats={stats} 
                activeFilter={filterType} 
                onFilterChange={setFilterType} 
              />

              {/* Search, Sort and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des artefacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Plus récents
                      </div>
                    </SelectItem>
                    <SelectItem value="name">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Par nom
                      </div>
                    </SelectItem>
                    <SelectItem value="type">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Par type
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active filter indicator */}
              {filterType !== 'all' && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Filtre: {filterType}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => setFilterType('all')}
                  >
                    Effacer
                  </Button>
                </div>
              )}

              {/* Artifacts Grid */}
              {filteredAndSortedArtifacts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun artefact trouvé</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchTerm || filterType !== 'all' 
                        ? 'Aucun artefact ne correspond à vos critères' 
                        : 'Créez votre premier artefact pour commencer'}
                    </p>
                    {!searchTerm && filterType === 'all' && (
                      <Button onClick={() => setShowGenerator(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer un artefact
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedArtifacts.map(artifact => (
                    <EnhancedArtifactCard
                      key={artifact.id}
                      artifact={artifact}
                      onDelete={handleDelete}
                      onTransform={handleTransform}
                      onAddToProject={handleAddToProject}
                      onContinueWith={handleContinueWith}
                      icon={getTypeIcon(artifact.artifact_type)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects">
              <ProjectArtifactsView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CanvasGenerator 
        open={showGenerator} 
        onClose={() => {
          setShowGenerator(false);
          loadArtifacts();
        }}
      />
    </div>
  );
};
