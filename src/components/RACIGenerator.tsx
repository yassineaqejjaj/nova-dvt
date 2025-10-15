import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  X, 
  Loader2, 
  Download, 
  Share2,
  Users,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  UserCheck
} from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  responsible: string[];
  accountable: string[];
  consulted: string[];
  informed: string[];
}

export const RACIGenerator: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newStakeholderName, setNewStakeholderName] = useState('');
  const [newStakeholderRole, setNewStakeholderRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  const addStakeholder = () => {
    if (!newStakeholderName.trim()) {
      toast.error('Please enter a stakeholder name');
      return;
    }

    const newStakeholder: Stakeholder = {
      id: Date.now().toString(),
      name: newStakeholderName.trim(),
      role: newStakeholderRole.trim() || 'Team Member'
    };

    setStakeholders([...stakeholders, newStakeholder]);
    setNewStakeholderName('');
    setNewStakeholderRole('');
    toast.success(`Added ${newStakeholder.name}`);
  };

  const removeStakeholder = (id: string) => {
    setStakeholders(stakeholders.filter(s => s.id !== id));
  };

  const generateRACIMatrix = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (stakeholders.length === 0) {
      toast.error('Please add at least one stakeholder');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-raci', {
        body: {
          projectName,
          projectDescription,
          stakeholders: stakeholders.map(s => ({ name: s.name, role: s.role }))
        }
      });

      if (error) throw error;

      // Format tasks with RACI assignments
      const generatedTasks: Task[] = data.tasks.map((task: any) => ({
        id: Date.now().toString() + Math.random(),
        name: task.name,
        description: task.description || '',
        responsible: task.responsible || [],
        accountable: task.accountable || [],
        consulted: task.consulted || [],
        informed: task.informed || []
      }));

      setTasks(generatedTasks);
      setShowMatrix(true);
      toast.success('RACI matrix generated successfully!');

    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate RACI matrix');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateTaskAssignment = (
    taskId: string,
    stakeholder: string,
    role: 'responsible' | 'accountable' | 'consulted' | 'informed',
    add: boolean
  ) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;

      const updatedTask = { ...task };
      if (add) {
        updatedTask[role] = [...updatedTask[role], stakeholder];
      } else {
        updatedTask[role] = updatedTask[role].filter(s => s !== stakeholder);
      }
      return updatedTask;
    }));
  };

  const exportMatrix = () => {
    const csvContent = [
      ['Task', ...stakeholders.map(s => s.name)],
      ...tasks.map(task => [
        task.name,
        ...stakeholders.map(stakeholder => {
          const roles = [];
          if (task.responsible.includes(stakeholder.name)) roles.push('R');
          if (task.accountable.includes(stakeholder.name)) roles.push('A');
          if (task.consulted.includes(stakeholder.name)) roles.push('C');
          if (task.informed.includes(stakeholder.name)) roles.push('I');
          return roles.join(',');
        })
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_RACI_Matrix.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Matrix exported successfully!');
  };

  const saveMatrix = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('artifacts')
        .insert([{
          user_id: user.id,
          artifact_type: 'canvas' as const,
          title: `RACI Matrix: ${projectName}`,
          content: {
            type: 'raci_matrix',
            projectName,
            projectDescription,
            stakeholders,
            tasks
          } as any
        }]);

      if (error) throw error;
      toast.success('RACI matrix saved to artifacts!');

    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save matrix');
    }
  };

  const getRoleIcon = (role: 'R' | 'A' | 'C' | 'I') => {
    switch (role) {
      case 'R': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'A': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'C': return <MessageCircle className="w-4 h-4 text-yellow-500" />;
      case 'I': return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Smart RACI Generator</h1>
        <p className="text-muted-foreground">
          Automatically generate a RACI matrix for your project with AI-powered role assignments
        </p>
      </div>

      {!showMatrix ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Describe your project to help AI understand the context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="E.g., Mobile App Redesign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Project Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe the project scope, goals, and key deliverables..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stakeholders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Stakeholders
              </CardTitle>
              <CardDescription>
                Add team members and stakeholders who will be involved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Name"
                    value={newStakeholderName}
                    onChange={(e) => setNewStakeholderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStakeholder()}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Role (optional)"
                    value={newStakeholderRole}
                    onChange={(e) => setNewStakeholderRole(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStakeholder()}
                  />
                </div>
                <Button onClick={addStakeholder}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {stakeholders.map((stakeholder) => (
                  <div
                    key={stakeholder.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{stakeholder.name}</p>
                      <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStakeholder(stakeholder.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {stakeholders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No stakeholders added yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={generateRACIMatrix}
                  disabled={isGenerating || !projectName || stakeholders.length === 0}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating RACI Matrix...
                    </>
                  ) : (
                    <>
                      Generate Smart RACI Matrix
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Matrix Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{projectName}</CardTitle>
                  <CardDescription>{projectDescription}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportMatrix}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveMatrix}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMatrix(false)}
                  >
                    Edit Project
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* RACI Legend */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  {getRoleIcon('R')}
                  <span className="text-sm"><strong>R</strong> - Responsible</span>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleIcon('A')}
                  <span className="text-sm"><strong>A</strong> - Accountable</span>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleIcon('C')}
                  <span className="text-sm"><strong>C</strong> - Consulted</span>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleIcon('I')}
                  <span className="text-sm"><strong>I</strong> - Informed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RACI Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-semibold min-w-[200px]">
                    Task / Activity
                  </th>
                  {stakeholders.map((stakeholder) => (
                    <th key={stakeholder.id} className="border p-3 text-center min-w-[120px]">
                      <div>
                        <p className="font-semibold">{stakeholder.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {stakeholder.role}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-muted/50">
                    <td className="border p-3">
                      <p className="font-medium">{task.name}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </td>
                    {stakeholders.map((stakeholder) => {
                      const roles = [];
                      if (task.responsible.includes(stakeholder.name)) roles.push('R');
                      if (task.accountable.includes(stakeholder.name)) roles.push('A');
                      if (task.consulted.includes(stakeholder.name)) roles.push('C');
                      if (task.informed.includes(stakeholder.name)) roles.push('I');

                      return (
                        <td key={stakeholder.id} className="border p-3 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {roles.map(role => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
