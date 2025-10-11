import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Agent } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Sparkles, MessageCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface AgentPersonalityCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent;
  userId: string;
}

const personalityTypes = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Well-rounded approach with equal focus on all aspects',
    icon: Brain,
  },
  {
    id: 'analytical',
    name: 'Analytical',
    description: 'Data-driven insights with detailed analysis',
    icon: TrendingUp,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Innovative solutions with out-of-the-box thinking',
    icon: Sparkles,
  },
  {
    id: 'socratic',
    name: 'Socratic',
    description: 'Guiding through questions to help you discover answers',
    icon: MessageCircle,
  },
];

export const AgentPersonalityCustomizer: React.FC<AgentPersonalityCustomizerProps> = ({
  open,
  onOpenChange,
  agent,
  userId,
}) => {
  const [selectedPersonality, setSelectedPersonality] = useState('balanced');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadPersonality();
    }
  }, [open, userId, agent.id]);

  const loadPersonality = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_personalities')
        .select('personality_type')
        .eq('user_id', userId)
        .eq('agent_id', agent.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSelectedPersonality(data.personality_type);
    } catch (error) {
      console.error('Error loading personality:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('agent_personalities').upsert({
        user_id: userId,
        agent_id: agent.id,
        personality_type: selectedPersonality,
        custom_traits: {},
        visual_style: {},
      });

      if (error) throw error;

      toast.success('Agent personality updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving personality:', error);
      toast.error('Failed to update agent personality');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize {agent.name}'s Personality</DialogTitle>
          <DialogDescription>
            Choose how {agent.name} interacts with you and approaches problems
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedPersonality} onValueChange={setSelectedPersonality}>
          <div className="space-y-3">
            {personalityTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    selectedPersonality === type.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPersonality(type.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <div className="flex-1">
                        <Label
                          htmlFor={type.id}
                          className="flex items-center gap-2 cursor-pointer text-base font-medium"
                        >
                          <Icon className="h-4 w-4" />
                          {type.name}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RadioGroup>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Personality'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
