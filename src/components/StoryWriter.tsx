import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Copy, CheckCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoryWriterProps {
  open: boolean;
  onClose: () => void;
}

interface UserStory {
  title: string;
  userType: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: string;
}

export const StoryWriter: React.FC<StoryWriterProps> = ({ open, onClose }) => {
  const [featureDescription, setFeatureDescription] = useState('');
  const [userType, setUserType] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<UserStory | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!featureDescription.trim()) {
      toast.error('Please describe the feature you want to create a story for');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('canvas-generator', {
        body: {
          template: 'user-story',
          projectContext: context,
          formData: {
            featureDescription,
            userType: userType || 'user',
          },
          documents: []
        }
      });

      if (error) throw error;

      const story: UserStory = {
        title: data.content.title || `${featureDescription.slice(0, 50)}...`,
        userType: data.content.userType || userType || 'user',
        action: data.content.action || featureDescription,
        benefit: data.content.benefit || 'to improve their experience',
        acceptanceCriteria: data.content.acceptanceCriteria || [
          'Feature is implemented according to specification',
          'All edge cases are handled',
          'Tests are passing'
        ],
        priority: data.content.priority || 'medium',
        estimatedEffort: data.content.estimatedEffort || 'TBD'
      };

      setGeneratedStory(story);
      toast.success('User story generated successfully!');
    } catch (error) {
      console.error('Error generating user story:', error);
      toast.error('Failed to generate user story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedStory) return;

    const storyText = `
# ${generatedStory.title}

**As a** ${generatedStory.userType}  
**I want to** ${generatedStory.action}  
**So that** ${generatedStory.benefit}

## Acceptance Criteria
${generatedStory.acceptanceCriteria.map((criterion, i) => `${i + 1}. ${criterion}`).join('\n')}

**Priority:** ${generatedStory.priority.toUpperCase()}  
**Estimated Effort:** ${generatedStory.estimatedEffort}
    `.trim();

    navigator.clipboard.writeText(storyText);
    setCopied(true);
    toast.success('User story copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!generatedStory) return;

    const storyText = `
# ${generatedStory.title}

**As a** ${generatedStory.userType}  
**I want to** ${generatedStory.action}  
**So that** ${generatedStory.benefit}

## Acceptance Criteria
${generatedStory.acceptanceCriteria.map((criterion, i) => `${i + 1}. ${criterion}`).join('\n')}

**Priority:** ${generatedStory.priority.toUpperCase()}  
**Estimated Effort:** ${generatedStory.estimatedEffort}
    `.trim();

    const blob = new Blob([storyText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-story-${generatedStory.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('User story exported!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>AI Story Writer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!generatedStory ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feature">Feature Description *</Label>
                    <Textarea
                      id="feature"
                      placeholder="Describe the feature you want to create a user story for..."
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">User Type</Label>
                    <Input
                      id="userType"
                      placeholder="e.g., Product Manager, End User, Admin"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context">Additional Context (Optional)</Label>
                    <Textarea
                      id="context"
                      placeholder="Any additional context, constraints, or requirements..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating || !featureDescription.trim()}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Story
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{generatedStory.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(generatedStory.priority)}>
                        {generatedStory.priority}
                      </Badge>
                      <Badge variant="outline">{generatedStory.estimatedEffort}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-muted-foreground">As a</span>
                      <span className="font-medium">{generatedStory.userType}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-muted-foreground">I want to</span>
                      <span className="font-medium">{generatedStory.action}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-muted-foreground">So that</span>
                      <span className="font-medium">{generatedStory.benefit}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Acceptance Criteria</h4>
                    <ul className="space-y-2">
                      {generatedStory.acceptanceCriteria.map((criterion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setGeneratedStory(null)}>
                  Generate Another
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
