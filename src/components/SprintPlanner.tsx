import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, Zap, Plus, Edit2, Trash2, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Story {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'backlog' | 'todo' | 'in-progress' | 'done';
  assignee: string;
}

export const SprintPlanner: React.FC = () => {
  const [sprintName, setSprintName] = useState('Sprint 1');
  const [sprintCapacity, setSprintCapacity] = useState(40);
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      title: 'User Authentication',
      description: 'Implement JWT-based authentication',
      priority: 'high',
      points: 8,
      status: 'in-progress',
      assignee: 'Dev Team'
    },
    {
      id: '2',
      title: 'Dashboard UI',
      description: 'Create main dashboard interface',
      priority: 'high',
      points: 5,
      status: 'todo',
      assignee: 'Frontend'
    }
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    points: number;
    status: 'backlog' | 'todo' | 'in-progress' | 'done';
    assignee: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    points: 3,
    status: 'backlog',
    assignee: ''
  });

  const committedPoints = stories.filter(s => s.status !== 'backlog').reduce((sum, s) => sum + s.points, 0);
  const completedPoints = stories.filter(s => s.status === 'done').reduce((sum, s) => sum + s.points, 0);
  const capacityUsed = (committedPoints / sprintCapacity) * 100;

  const handleAddStory = () => {
    if (!formData.title || !formData.assignee) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingStory) {
      setStories(stories.map(s => 
        s.id === editingStory.id 
          ? { ...formData, id: editingStory.id }
          : s
      ));
      toast.success('Story updated!');
    } else {
      const newStory: Story = {
        ...formData,
        id: Date.now().toString()
      };
      setStories([...stories, newStory]);
      toast.success('Story added to sprint!');
    }

    setShowDialog(false);
    setEditingStory(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      points: 3,
      status: 'backlog',
      assignee: ''
    });
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setFormData(story);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setStories(stories.filter(s => s.id !== id));
    toast.success('Story removed');
  };

  const handleMoveStatus = (id: string, newStatus: Story['status']) => {
    setStories(stories.map(s => 
      s.id === id ? { ...s, status: newStatus } : s
    ));
    toast.success('Story status updated!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'todo': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const columns: { status: Story['status']; label: string }[] = [
    { status: 'backlog', label: 'Backlog' },
    { status: 'todo', label: 'To Do' },
    { status: 'in-progress', label: 'In Progress' },
    { status: 'done', label: 'Done' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sprint Planning</h2>
          <p className="text-muted-foreground">Plan and manage your sprint backlog</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Story
        </Button>
      </div>

      {/* Sprint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sprint Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sprintCapacity} pts</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Committed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{committedPoints} pts</div>
            <Progress value={capacityUsed} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPoints} pts</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              {Math.round((completedPoints / committedPoints) * 100) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnStories = stories.filter(s => s.status === column.status);
          const columnPoints = columnStories.reduce((sum, s) => sum + s.points, 0);

          return (
            <Card key={column.status}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(column.status)}`} />
                    <span>{column.label}</span>
                  </div>
                  <Badge variant="outline">{columnPoints} pts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnStories.map(story => (
                  <div
                    key={story.id}
                    className="p-3 bg-muted/50 rounded-lg space-y-2 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{story.title}</h4>
                      <Badge variant={getPriorityColor(story.priority)} className="text-xs">
                        {story.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {story.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        <span>{story.points} pts</span>
                        <span>•</span>
                        <Users className="w-3 h-3" />
                        <span>{story.assignee}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(story)}
                        className="h-7 text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      {column.status !== 'done' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const nextStatus = column.status === 'backlog' ? 'todo' 
                              : column.status === 'todo' ? 'in-progress' 
                              : 'done';
                            handleMoveStatus(story.id, nextStatus);
                          }}
                          className="h-7 text-xs flex-1"
                        >
                          →
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(story.id)}
                        className="h-7 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
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
              {editingStory ? 'Edit Story' : 'Add User Story'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Story Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="As a user, I want to..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Acceptance criteria and details..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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
                <Label>Story Points</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="13"
                />
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
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee *</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Team or person"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStory}>
              {editingStory ? 'Update' : 'Add'} Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
