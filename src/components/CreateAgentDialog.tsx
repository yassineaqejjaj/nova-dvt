import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { Agent } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  StepIndicator,
  StepRole,
  StepIdentity,
  StepBehavior,
  StepContext,
  StepGenerate,
  CreateAgentFormData,
  CreateAgentContext,
  AgentRole,
  DecisionStyle,
  ROLE_DEFINITIONS
} from '@/components/create-agent';

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onAgentCreated: (agent: Agent) => void;
  activeSquad?: { id: string; name: string } | null;
  activeContext?: { id: string; name: string } | null;
}

const STEPS = [
  { id: 1, label: 'Role' },
  { id: 2, label: 'Identity' },
  { id: 3, label: 'Behavior' },
  { id: 4, label: 'Context' },
  { id: 5, label: 'Generate' }
];

const initialFormData: CreateAgentFormData = {
  role: null,
  customRoleDescription: '',
  name: '',
  useCustomName: false,
  mission: '',
  decisionStyle: 'balanced',
  capabilities: []
};

export const CreateAgentDialog: React.FC<CreateAgentDialogProps> = ({
  open,
  onClose,
  onAgentCreated,
  activeSquad,
  activeContext
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateAgentFormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAgent, setGeneratedAgent] = useState<Agent | null>(null);

  const context: CreateAgentContext = {
    squadId: activeSquad?.id || null,
    squadName: activeSquad?.name || null,
    contextId: activeContext?.id || null,
    contextName: activeContext?.name || null
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setFormData(initialFormData);
      setGeneratedAgent(null);
    }
  }, [open]);

  // Update name when role changes (if not using custom name)
  useEffect(() => {
    if (!formData.useCustomName && formData.role) {
      const roleDefinition = ROLE_DEFINITIONS.find(r => r.id === formData.role);
      if (roleDefinition) {
        setFormData(prev => ({
          ...prev,
          name: `${roleDefinition.name} Agent`
        }));
      }
    }
  }, [formData.role, formData.useCustomName]);

  const handleRoleSelect = (role: AgentRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      capabilities: [],
      mission: ''
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.role !== null && (formData.role !== 'custom' || formData.customRoleDescription.trim() !== '');
      case 2:
        return formData.name.trim() !== '' && formData.mission.trim() !== '';
      case 3:
        return formData.capabilities.length > 0;
      case 4:
        return true;
      case 5:
        return generatedAgent !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateAgent = async () => {
    setIsGenerating(true);
    setGeneratedAgent(null);

    try {
      const roleDefinition = ROLE_DEFINITIONS.find(r => r.id === formData.role);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          prompt: `Generate a professional backstory and tags for an AI agent with these specifications:

Role: ${roleDefinition?.name || formData.customRoleDescription}
Name: ${formData.name}
Primary Mission: ${formData.mission}
Decision Style: ${formData.decisionStyle}
Capabilities: ${formData.capabilities.join(', ')}
${context.contextName ? `Product Context: ${context.contextName}` : ''}

Create a compelling, concise backstory (2-3 sentences, 150-200 characters) that:
- Reflects the agent's expertise and decision style
- Sounds professional and authentic
- Matches the mission and capabilities

Also generate 4 professional tags that represent key skills.

Respond ONLY with valid JSON:
{
  "backstory": "Professional background description...",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`,
          messages: []
        }
      });

      if (error) throw error;

      let generatedData;
      try {
        const responseText = data.response || data.generatedText || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        generatedData = {
          backstory: `Expert in ${formData.mission.toLowerCase()}. Brings a ${formData.decisionStyle} approach to problem-solving with deep expertise in ${formData.capabilities.slice(0, 2).join(' and ')}.`,
          tags: formData.capabilities.slice(0, 4)
        };
      }

      const newAgent: Agent = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        specialty: formData.mission,
        avatar: `/api/placeholder/64/64?text=${formData.name.split(' ').map(n => n[0]).join('')}`,
        backstory: generatedData.backstory,
        capabilities: formData.capabilities,
        tags: generatedData.tags || formData.capabilities.slice(0, 4),
        xpRequired: 0,
        familyColor: roleDefinition?.familyColor || 'blue',
        personality: formData.decisionStyle
      };

      setGeneratedAgent(newAgent);
    } catch (error) {
      console.error('Error generating agent:', error);
      toast.error('Failed to generate agent. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    if (generatedAgent) {
      onAgentCreated(generatedAgent);
      toast.success(`${generatedAgent.name} has been created successfully!`);
      onClose();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepRole
            selectedRole={formData.role}
            customRoleDescription={formData.customRoleDescription}
            onRoleSelect={handleRoleSelect}
            onCustomDescriptionChange={(desc) => setFormData(prev => ({ ...prev, customRoleDescription: desc }))}
          />
        );
      case 2:
        return (
          <StepIdentity
            role={formData.role!}
            name={formData.name}
            useCustomName={formData.useCustomName}
            mission={formData.mission}
            onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
            onUseCustomNameChange={(use) => setFormData(prev => ({ ...prev, useCustomName: use }))}
            onMissionChange={(mission) => setFormData(prev => ({ ...prev, mission }))}
          />
        );
      case 3:
        return (
          <StepBehavior
            role={formData.role!}
            decisionStyle={formData.decisionStyle}
            capabilities={formData.capabilities}
            onDecisionStyleChange={(style) => setFormData(prev => ({ ...prev, decisionStyle: style }))}
            onCapabilitiesChange={(caps) => setFormData(prev => ({ ...prev, capabilities: caps }))}
          />
        );
      case 4:
        return (
          <StepContext
            role={formData.role!}
            name={formData.name}
            mission={formData.mission}
            context={context}
          />
        );
      case 5:
        return (
          <StepGenerate
            formData={formData}
            isGenerating={isGenerating}
            generatedAgent={generatedAgent}
            onGenerate={generateAgent}
            onRegenerate={generateAgent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Design a Custom Agent</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Define the role this agent will play in your squad.
          </p>
        </DialogHeader>

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="min-h-[350px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isGenerating}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isGenerating}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : generatedAgent ? (
              <Button onClick={handleFinish}>
                Add to Squad
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
