import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Rocket, CheckCircle2, Circle, Users, FileText, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface LaunchTask {
  id: string;
  task: string;
  category: 'planning' | 'development' | 'marketing' | 'sales';
  completed: boolean;
  owner: string;
}

export const ProductLaunch: React.FC = () => {
  const [launchName, setLaunchName] = useState('Product Launch Checklist');
  const [tasks, setTasks] = useState<LaunchTask[]>([
    { id: '1', task: 'Define target audience and personas', category: 'planning', completed: true, owner: 'PM Team' },
    { id: '2', task: 'Create product positioning document', category: 'planning', completed: true, owner: 'PM Team' },
    { id: '3', task: 'Finalize MVP feature set', category: 'development', completed: false, owner: 'Engineering' },
    { id: '4', task: 'QA testing and bug fixes', category: 'development', completed: false, owner: 'QA Team' },
    { id: '5', task: 'Create launch announcement', category: 'marketing', completed: false, owner: 'Marketing' },
    { id: '6', task: 'Prepare press release', category: 'marketing', completed: false, owner: 'Marketing' },
    { id: '7', task: 'Setup social media campaigns', category: 'marketing', completed: false, owner: 'Marketing' },
    { id: '8', task: 'Train sales team', category: 'sales', completed: false, owner: 'Sales' },
    { id: '9', task: 'Prepare demo materials', category: 'sales', completed: false, owner: 'Sales' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [newCategory, setNewCategory] = useState<LaunchTask['category']>('planning');
  const [newOwner, setNewOwner] = useState('');

  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercentage = (completedTasks / tasks.length) * 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planning': return <FileText className="w-4 h-4" />;
      case 'development': return <Circle className="w-4 h-4" />;
      case 'marketing': return <Megaphone className="w-4 h-4" />;
      case 'sales': return <Users className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'planning': return 'bg-blue-500';
      case 'development': return 'bg-purple-500';
      case 'marketing': return 'bg-pink-500';
      case 'sales': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    toast.success('Task updated!');
  };

  const handleAddTask = () => {
    if (!newTask || !newOwner) {
      toast.error('Please fill in task and owner');
      return;
    }

    const task: LaunchTask = {
      id: Date.now().toString(),
      task: newTask,
      category: newCategory,
      completed: false,
      owner: newOwner
    };

    setTasks([...tasks, task]);
    setNewTask('');
    setNewOwner('');
    toast.success('Task added to launch checklist!');
  };

  const categories = [
    { value: 'planning', label: 'Planning', color: 'blue' },
    { value: 'development', label: 'Development', color: 'purple' },
    { value: 'marketing', label: 'Marketing', color: 'pink' },
    { value: 'sales', label: 'Sales', color: 'green' }
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Launch Planning</h2>
          <p className="text-muted-foreground">Comprehensive checklist for successful product launches</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Rocket className="w-4 h-4 mr-2" />
          {completedTasks} / {tasks.length} Complete
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Progress</CardTitle>
          <CardDescription>Track your launch preparation across all teams</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{launchName}</span>
              <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4">
            {categories.map(cat => {
              const categoryTasks = tasks.filter(t => t.category === cat.value);
              const completed = categoryTasks.filter(t => t.completed).length;
              return (
                <div key={cat.value} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(cat.value)}`} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {completed} / {categoryTasks.length}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Category */}
      <div className="grid gap-4">
        {categories.map(category => {
          const categoryTasks = tasks.filter(t => t.category === category.value);
          
          return (
            <Card key={category.value}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(category.value)}
                  <span>{category.label}</span>
                  <Badge variant="outline">
                    {categoryTasks.filter(t => t.completed).length} / {categoryTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner: {task.owner}
                        </p>
                      </div>
                      {task.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Task */}
      <Card>
        <CardHeader>
          <CardTitle>Add Launch Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter task description..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as LaunchTask['category'])}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Input
              placeholder="Owner"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
