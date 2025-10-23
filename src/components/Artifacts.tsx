import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArtifactCard } from './ArtifactCard';
import { supabase } from '@/integrations/supabase/client';
import { Artifact } from '@/types';
import { Search, Filter, FileText, Grid3X3, TrendingUp, Loader2, Download, FolderOpen, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CanvasGenerator } from './CanvasGenerator';
import { ProjectArtifactsView } from './ProjectArtifactsView';

interface ArtifactsProps {
  userId: string;
}

export const Artifacts: React.FC<ArtifactsProps> = ({ userId }) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    loadArtifacts();
  }, [userId]);

  const loadArtifacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtifacts(data || []);
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

  const handleExportAll = () => {
    const exportData = artifacts.map(artifact => ({
      title: artifact.title,
      type: artifact.artifact_type,
      content: artifact.content,
      created: artifact.created_at,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifacts-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Succès',
      description: 'Tous les artefacts exportés',
    });
  };

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || artifact.artifact_type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'canvas': return <Grid3X3 className="w-4 h-4" />;
      case 'story': return <FileText className="w-4 h-4" />;
      case 'impact_analysis': return <TrendingUp className="w-4 h-4" />;
      case 'epic': return <FileText className="w-4 h-4" />;
      case 'tech_spec': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const stats = {
    total: artifacts.length,
    canvas: artifacts.filter(a => a.artifact_type === 'canvas').length,
    story: artifacts.filter(a => a.artifact_type === 'story').length,
    impact_analysis: artifacts.filter(a => a.artifact_type === 'impact_analysis').length,
    epic: artifacts.filter(a => a.artifact_type === 'epic').length,
    tech_spec: artifacts.filter(a => a.artifact_type === 'tech_spec').length,
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
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Canvas</CardTitle>
                    <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.canvas}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Stories</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.story}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Epics</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.epic}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Spécs</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.tech_spec}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Analyses</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.impact_analysis}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
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
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    Tous
                  </Button>
                  <Button
                    variant={filterType === 'canvas' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('canvas')}
                  >
                    Canvas
                  </Button>
                  <Button
                    variant={filterType === 'story' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('story')}
                  >
                    Stories
                  </Button>
                  <Button
                    variant={filterType === 'epic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('epic')}
                  >
                    Epics
                  </Button>
                </div>
              </div>

              {/* Artifacts Grid */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredArtifacts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun artefact trouvé</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Créez votre premier artefact pour commencer
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArtifacts.map(artifact => (
                    <ArtifactCard
                      key={artifact.id}
                      artifact={artifact}
                      onDelete={handleDelete}
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