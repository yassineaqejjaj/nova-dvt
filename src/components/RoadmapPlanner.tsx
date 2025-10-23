import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Target, Plus, Edit2, Trash2, MapPin, Save, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  quarter: string;
  status: 'planned' | 'in-progress' | 'completed';
  impact: 'high' | 'medium' | 'low';
  owner: string;
}

interface RoadmapPlannerProps {
  activeWorkflow?: { type: string; currentStep: number } | null;
  onStepComplete?: (nextStep: number, context: any) => void;
  workflowContext?: Record<string, any>;
}

export const RoadmapPlanner: React.FC<RoadmapPlannerProps> = ({
  activeWorkflow,
  onStepComplete,
  workflowContext
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    quarter: string;
    status: 'planned' | 'in-progress' | 'completed';
    impact: 'high' | 'medium' | 'low';
    owner: string;
  }>({
    title: '',
    description: '',
    quarter: 'Q1 2025',
    status: 'planned',
    impact: 'medium',
    owner: ''
  });

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

  // Load vision data from workflow context
  useEffect(() => {
    if (workflowContext?.visionData) {
      const { strategicThemes } = workflowContext.visionData;
      // Could pre-populate milestones based on themes if needed
      console.log('Vision context loaded:', strategicThemes);
    }
  }, [workflowContext]);

  const handleAddMilestone = () => {
    if (!formData.title || !formData.owner) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingMilestone) {
      setMilestones(milestones.map(m => 
        m.id === editingMilestone.id 
          ? { ...formData, id: editingMilestone.id }
          : m
      ));
      toast.success('Milestone updated!');
    } else {
      const newMilestone: Milestone = {
        ...formData,
        id: Date.now().toString()
      };
      setMilestones([...milestones, newMilestone]);
      toast.success('Milestone added to roadmap!');
    }

    setShowDialog(false);
    setEditingMilestone(null);
    setFormData({
      title: '',
      description: '',
      quarter: 'Q1 2025',
      status: 'planned',
      impact: 'medium',
      owner: ''
    });
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description,
      quarter: milestone.quarter,
      status: milestone.status,
      impact: milestone.impact,
      owner: milestone.owner
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
    toast.success('Milestone removed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const saveRoadmap = async (andContinue: boolean = false) => {
    if (milestones.length === 0) {
      toast.error("Ajoutez au moins un jalon à la roadmap");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const roadmapData = {
        milestones,
        quarters,
        visionContext: workflowContext?.visionData || null,
        createdAt: new Date().toISOString()
      };

      const { data: savedArtifact, error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'roadmap' as const,
        title: `Roadmap - ${new Date().toLocaleDateString('fr-FR')}`,
        content: roadmapData,
        metadata: { 
          type: 'strategic-roadmap',
          milestoneCount: milestones.length,
          generatedAt: new Date().toISOString(),
          workflowStep: activeWorkflow?.currentStep
        }
      } as any).select().single();

      if (error) throw error;
      toast.success("Roadmap sauvegardée!");

      // If in a workflow and continuing to next step
      if (andContinue && activeWorkflow && onStepComplete && savedArtifact) {
        const updatedContext = {
          ...workflowContext,
          [`step_${activeWorkflow.currentStep}`]: savedArtifact,
          roadmap_artifact: savedArtifact,
          roadmapData
        };
        onStepComplete(activeWorkflow.currentStep + 1, updatedContext);
      }
    } catch (error) {
      console.error('Error saving roadmap:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Roadmap</h2>
          <p className="text-muted-foreground">Plan and visualize your product milestones</p>
        </div>
        <div className="flex gap-2">
          {milestones.length > 0 && (
            <>
              <Button 
                onClick={() => saveRoadmap(false)} 
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Sauvegarder
              </Button>
              {activeWorkflow && onStepComplete && (
                <Button 
                  onClick={() => saveRoadmap(true)} 
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Étape suivante
                </Button>
              )}
            </>
          )}
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="grid gap-6">
        {quarters.map(quarter => {
          const quarterMilestones = milestones.filter(m => m.quarter === quarter);
          
          return (
            <Card key={quarter}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{quarter}</span>
                  <Badge variant="outline">{quarterMilestones.length} milestones</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quarterMilestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No milestones planned for this quarter
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quarterMilestones.map(milestone => (
                      <div
                        key={milestone.id}
                        className="flex items-start justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(milestone.status)}`} />
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <Badge variant={getImpactColor(milestone.impact)}>
                              {milestone.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {milestone.owner}
                            </span>
                            <span className="capitalize">{milestone.status.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(milestone)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(milestone.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Launch new feature"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the milestone..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quarter *</Label>
                <Select
                  value={formData.quarter}
                  onValueChange={(value) => setFormData({ ...formData, quarter: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Impact</Label>
                <Select
                  value={formData.impact}
                  onValueChange={(value: any) => setFormData({ ...formData, impact: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner *</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Team or person"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMilestone}>
              {editingMilestone ? 'Update' : 'Add'} Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
