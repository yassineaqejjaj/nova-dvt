import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentRole, DecisionStyle, ROLE_DEFINITIONS, DECISION_STYLES } from './types';

interface StepBehaviorProps {
  role: AgentRole;
  decisionStyle: DecisionStyle;
  capabilities: string[];
  onDecisionStyleChange: (style: DecisionStyle) => void;
  onCapabilitiesChange: (capabilities: string[]) => void;
}

export const StepBehavior: React.FC<StepBehaviorProps> = ({
  role,
  decisionStyle,
  capabilities,
  onDecisionStyleChange,
  onCapabilitiesChange
}) => {
  const [newCapability, setNewCapability] = React.useState('');
  const roleDefinition = ROLE_DEFINITIONS.find(r => r.id === role);
  const selectedStyle = DECISION_STYLES.find(s => s.id === decisionStyle);

  const handleAddCapability = () => {
    if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
      onCapabilitiesChange([...capabilities, newCapability.trim()]);
      setNewCapability('');
    }
  };

  const handleRemoveCapability = (cap: string) => {
    onCapabilitiesChange(capabilities.filter(c => c !== cap));
  };

  const handleSuggestedCapability = (cap: string) => {
    if (!capabilities.includes(cap)) {
      onCapabilitiesChange([...capabilities, cap]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Configure behavior</h3>
        <p className="text-sm text-muted-foreground">
          Define how this agent thinks and what it can do.
        </p>
      </div>

      {/* Decision Style */}
      <div className="space-y-3">
        <Label>Decision Style</Label>
        <p className="text-sm text-muted-foreground -mt-1">
          How should this agent approach problems and discussions?
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {DECISION_STYLES.map((style) => (
            <Card
              key={style.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                decisionStyle === style.id && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => onDecisionStyleChange(style.id)}
            >
              <CardContent className="p-3">
                <h4 className="font-medium text-sm">{style.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {style.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedStyle && (
          <div className="p-3 rounded-lg bg-muted/50 border flex items-start gap-2">
            <Brain className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {selectedStyle.behaviorHint}
            </p>
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Capabilities</Label>
          <span className="text-xs text-muted-foreground">
            {capabilities.length}/5 selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground -mt-1">
          What can this agent do? Select or add up to 5 capabilities.
        </p>

        {/* Suggested capabilities */}
        {roleDefinition && roleDefinition.suggestedCapabilities.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Suggested for {roleDefinition.name}:</span>
            <div className="flex flex-wrap gap-2">
              {roleDefinition.suggestedCapabilities.map((cap) => {
                const isSelected = capabilities.includes(cap);
                return (
                  <Badge
                    key={cap}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      !isSelected && "hover:bg-primary/10",
                      isSelected && "opacity-70"
                    )}
                    onClick={() => !isSelected && capabilities.length < 5 && handleSuggestedCapability(cap)}
                  >
                    {cap}
                    {isSelected && <X className="w-3 h-3 ml-1" onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCapability(cap);
                    }} />}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom capability input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a custom capability..."
            value={newCapability}
            onChange={(e) => setNewCapability(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCapability()}
            disabled={capabilities.length >= 5}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCapability}
            disabled={capabilities.length >= 5 || !newCapability.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected capabilities */}
        {capabilities.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30 border">
            {capabilities.map((cap) => (
              <Badge key={cap} variant="secondary" className="flex items-center gap-1">
                {cap}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveCapability(cap)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
