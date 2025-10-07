import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Flag, FileText, Trash2, Edit, Plus } from 'lucide-react';

interface FeatureFlag {
  id: string;
  feature_name: string;
  status: 'enabled' | 'disabled' | 'beta';
  description: string | null;
}

interface Artifact {
  id: string;
  title: string;
  artifact_type: string;
  created_at: string;
  user_id: string;
}

export const AdminPanel: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteArtifactId, setDeleteArtifactId] = useState<string | null>(null);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [flagsResponse, artifactsResponse] = await Promise.all([
        supabase.from('feature_flags').select('*').order('feature_name'),
        supabase.from('artifacts').select('*').order('created_at', { ascending: false }),
      ]);

      if (flagsResponse.error) throw flagsResponse.error;
      if (artifactsResponse.error) throw artifactsResponse.error;

      setFeatureFlags(flagsResponse.data || []);
      setArtifacts(artifactsResponse.data || []);
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeature = async (flagId: string, newStatus: 'enabled' | 'disabled') => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ status: newStatus })
        .eq('id', flagId);

      if (error) throw error;

      setFeatureFlags((prev) =>
        prev.map((flag) => (flag.id === flagId ? { ...flag, status: newStatus } : flag))
      );

      toast.success(`Feature ${newStatus === 'enabled' ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Error toggling feature:', error);
      toast.error('Failed to update feature flag', {
        description: error.message,
      });
    }
  };

  const handleDeleteArtifact = async () => {
    if (!deleteArtifactId) return;

    try {
      const { error } = await supabase.from('artifacts').delete().eq('id', deleteArtifactId);

      if (error) throw error;

      setArtifacts((prev) => prev.filter((a) => a.id !== deleteArtifactId));
      toast.success('Artifact deleted successfully');
      setDeleteArtifactId(null);
    } catch (error: any) {
      console.error('Error deleting artifact:', error);
      toast.error('Failed to delete artifact', {
        description: error.message,
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'default';
      case 'disabled':
        return 'secondary';
      case 'beta':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <span>Admin Panel</span>
          </h2>
          <p className="text-muted-foreground mt-1">Manage features and content</p>
        </div>
      </div>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="features">
            <Flag className="w-4 h-4 mr-2" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="artifacts">
            <FileText className="w-4 h-4 mr-2" />
            Artifacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable features across the application</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {featureFlags.map((flag) => (
                      <div
                        key={flag.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{flag.feature_name}</h4>
                            <Badge variant={getStatusBadgeVariant(flag.status)}>
                              {flag.status}
                            </Badge>
                          </div>
                          {flag.description && (
                            <p className="text-sm text-muted-foreground">{flag.description}</p>
                          )}
                        </div>
                        <Switch
                          checked={flag.status === 'enabled'}
                          onCheckedChange={(checked) =>
                            handleToggleFeature(flag.id, checked ? 'enabled' : 'disabled')
                          }
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Artifacts</CardTitle>
              <CardDescription>View and manage all user-generated artifacts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : artifacts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No artifacts found</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{artifact.title}</h4>
                            <Badge variant="outline">{artifact.artifact_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(artifact.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteArtifactId(artifact.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteArtifactId} onOpenChange={() => setDeleteArtifactId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artifact?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the artifact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArtifact}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};