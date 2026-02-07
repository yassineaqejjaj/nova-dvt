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
import { Shield, Flag, FileText, Trash2, Edit, Plus, Gift, Loader2 } from 'lucide-react';

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
  const [isDeploying, setIsDeploying] = useState(false);
  const [boxType, setBoxType] = useState<'common' | 'rare' | 'epic' | 'legendary'>('epic');
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [campaignName, setCampaignName] = useState('');
  const [deploymentReport, setDeploymentReport] = useState<any>(null);

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
      setArtifacts((artifactsResponse.data || []) as unknown as Artifact[]);
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

  const handleDeployMysteryBox = async () => {
    setIsDeploying(true);
    setDeploymentReport(null);

    try {
      const { data, error } = await supabase.functions.invoke('deploy-mystery-box', {
        body: {
          box_type: boxType,
          expires_in_hours: expiresInHours,
          campaign_name: campaignName || undefined,
        },
      });

      if (error) throw error;

      setDeploymentReport(data);
      toast.success('Mystery boxes deployed!', {
        description: `${data.deployment.boxes_deployed} boxes deployed to users`,
      });
    } catch (error: any) {
      console.error('Error deploying mystery boxes:', error);
      toast.error('Failed to deploy mystery boxes', {
        description: error.message,
      });
    } finally {
      setIsDeploying(false);
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">
            <Flag className="w-4 h-4 mr-2" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="artifacts">
            <FileText className="w-4 h-4 mr-2" />
            Artifacts
          </TabsTrigger>
          <TabsTrigger value="gamification">
            <Gift className="w-4 h-4 mr-2" />
            Mystery Boxes
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

        <TabsContent value="gamification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Mystery Boxes</CardTitle>
              <CardDescription>Send mystery boxes to all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="boxType">Box Type</Label>
                  <select
                    id="boxType"
                    className="w-full p-2 border rounded-md bg-background"
                    value={boxType}
                    onChange={(e) => setBoxType(e.target.value as any)}
                  >
                    <option value="common">Common (Standard rewards)</option>
                    <option value="rare">Rare (Better rewards)</option>
                    <option value="epic">Epic (Great rewards)</option>
                    <option value="legendary">Legendary (Best rewards)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Expires In (hours)</Label>
                  <Input
                    id="expiresIn"
                    type="number"
                    min="1"
                    max="168"
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long users have to open the box (1-168 hours)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name (Optional)</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g., Launch Week Special"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleDeployMysteryBox}
                  disabled={isDeploying}
                  className="w-full"
                  size="lg"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Deploy to All Users
                    </>
                  )}
                </Button>
              </div>

              {deploymentReport && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Deployment Report</h4>
                  <div className="space-y-2 text-sm">
                    {deploymentReport.campaign_name && (
                      <p>
                        <span className="text-muted-foreground">Campaign:</span>{' '}
                        <span className="font-medium">{deploymentReport.campaign_name}</span>
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Box Type:</span>{' '}
                      <Badge variant="outline">{deploymentReport.box_type}</Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total Users:</span>{' '}
                      <span className="font-medium">{deploymentReport.deployment.total_users}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Successfully Deployed:</span>{' '}
                      <span className="font-medium text-green-600">
                        {deploymentReport.deployment.boxes_deployed}
                      </span>
                    </p>
                    {deploymentReport.deployment.errors > 0 && (
                      <p>
                        <span className="text-muted-foreground">Errors:</span>{' '}
                        <span className="font-medium text-destructive">
                          {deploymentReport.deployment.errors}
                        </span>
                      </p>
                    )}
                    {deploymentReport.expires_at && (
                      <p>
                        <span className="text-muted-foreground">Expires:</span>{' '}
                        <span className="font-medium">
                          {new Date(deploymentReport.expires_at).toLocaleString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
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
