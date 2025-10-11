import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArtifactCard } from './ArtifactCard';
import { supabase } from '@/integrations/supabase/client';
import { Artifact } from '@/types';
import { Search, Filter, FileText, Grid3X3, TrendingUp, Loader2, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ArtifactsProps {
  userId: string;
}

export const Artifacts: React.FC<ArtifactsProps> = ({ userId }) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

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
        title: 'Error',
        description: 'Failed to load artifacts',
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
        title: 'Success',
        description: 'Artifact deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete artifact',
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
      title: 'Success',
      description: 'All artifacts exported',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Artifacts</h2>
          <p className="text-muted-foreground">
            All your generated canvases, stories, and analyses in one place
          </p>
        </div>
        <Button onClick={handleExportAll} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artifacts</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canvases</CardTitle>
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.canvas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Stories</CardTitle>
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
            <CardTitle className="text-sm font-medium">Tech Specs</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tech_spec}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Analyses</CardTitle>
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
            placeholder="Search artifacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filterType} onValueChange={setFilterType} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="canvas">Canvases</TabsTrigger>
            <TabsTrigger value="story">Stories</TabsTrigger>
            <TabsTrigger value="epic">Epics</TabsTrigger>
            <TabsTrigger value="tech_spec">Tech Specs</TabsTrigger>
            <TabsTrigger value="impact_analysis">Analyses</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Artifacts Grid */}
      {filteredArtifacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No artifacts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start creating canvases, user stories, and impact analyses with your AI agents
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
    </div>
  );
};