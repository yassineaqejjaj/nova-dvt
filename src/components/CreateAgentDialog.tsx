import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Plus } from 'lucide-react';
import { Agent } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onAgentCreated: (agent: Agent) => void;
}

const familyColors: Array<Agent['familyColor']> = ['blue', 'green', 'purple', 'orange'];

export const CreateAgentDialog: React.FC<CreateAgentDialogProps> = ({
  open,
  onClose,
  onAgentCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    familyColor: 'blue' as Agent['familyColor'],
    personality: 'balanced' as Agent['personality'],
    capabilities: [] as string[],
    currentCapability: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const personalityTypes = [
    { id: 'balanced', name: 'Équilibré', description: 'Balance parfaite entre analyse et créativité' },
    { id: 'analytical', name: 'Analytique', description: 'Centré sur les données et la logique' },
    { id: 'creative', name: 'Créatif', description: 'Pensée divergente et solutions innovantes' },
    { id: 'socratic', name: 'Socratique', description: 'Pose des questions pour approfondir' }
  ];

  const handleAddCapability = () => {
    if (formData.currentCapability.trim() && !formData.capabilities.includes(formData.currentCapability.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, prev.currentCapability.trim()],
        currentCapability: ''
      }));
    }
  };

  const handleRemoveCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  const generateAgent = async () => {
    if (!formData.name || !formData.specialty || formData.capabilities.length === 0) {
      toast.error('Please fill in name, specialty, and at least one capability');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          prompt: `Generate a professional backstory and additional tags for an AI agent with the following details:
          
Name: ${formData.name}
Specialty: ${formData.specialty}
Capabilities: ${formData.capabilities.join(', ')}

Please respond with a JSON object containing:
- backstory: A compelling 2-3 sentence professional background (150-200 characters)
- tags: An array of 4 relevant professional tags

Example format:
{
  "backstory": "Senior product manager with 8+ years at tech giants. Expert in user-centered design and agile methodologies.",
  "tags": ["Product Management", "Strategy", "User Research", "Agile"]
}`,
          messages: []
        }
      });

      if (error) throw error;

      let generatedData;
      try {
        // Extract JSON from the response
        const responseText = data.response || data.generatedText || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Fallback to basic generation
        generatedData = {
          backstory: `Experienced ${formData.specialty.toLowerCase()} with expertise in ${formData.capabilities.slice(0, 2).join(' and ').toLowerCase()}. Passionate about delivering high-quality results and innovative solutions.`,
          tags: formData.capabilities.slice(0, 4)
        };
      }

      const newAgent: Agent = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        specialty: formData.specialty,
        avatar: `/api/placeholder/64/64?text=${formData.name.split(' ').map(n => n[0]).join('')}`,
        backstory: generatedData.backstory,
        capabilities: formData.capabilities,
        tags: generatedData.tags || formData.capabilities.slice(0, 4),
        xpRequired: 0,
        familyColor: formData.familyColor,
        personality: formData.personality
      };

      onAgentCreated(newAgent);
      toast.success(`${formData.name} has been created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        specialty: '',
        familyColor: 'blue',
        personality: 'balanced',
        capabilities: [],
        currentCapability: ''
      });
      onClose();
    } catch (error) {
      console.error('Error generating agent:', error);
      toast.error('Failed to generate agent. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Create Custom Agent</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Sarah Chen"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                placeholder="e.g., Product Strategy"
                value={formData.specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="family">Family Color</Label>
              <Select value={formData.familyColor} onValueChange={(value: Agent['familyColor']) => 
                setFormData(prev => ({ ...prev, familyColor: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue (Product Management)</SelectItem>
                  <SelectItem value="green">Green (Design)</SelectItem>
                  <SelectItem value="purple">Purple (Development)</SelectItem>
                  <SelectItem value="orange">Orange (Marketing & Growth)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personnalité</Label>
              <Select value={formData.personality} onValueChange={(value: Agent['personality']) => 
                setFormData(prev => ({ ...prev, personality: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {personalityTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {personalityTypes.find(t => t.id === formData.personality)?.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Capabilities</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a capability..."
                value={formData.currentCapability}
                onChange={(e) => setFormData(prev => ({ ...prev, currentCapability: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCapability()}
              />
              <Button type="button" onClick={handleAddCapability} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary" className="flex items-center space-x-1">
                    <span>{capability}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveCapability(capability)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={generateAgent} 
              disabled={isGenerating || !formData.name || !formData.specialty || formData.capabilities.length === 0}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Agent</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};