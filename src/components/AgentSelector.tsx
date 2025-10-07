import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Agent } from '@/types';
import { allAgents } from '@/data/mockData';
import { Search, Plus, Check } from 'lucide-react';

interface AgentSelectorProps {
  open: boolean;
  onClose: () => void;
  currentAgents: Agent[];
  onAddAgent: (agent: Agent) => void;
  userXP: number;
  unlockedAgents: string[];
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  open,
  onClose,
  currentAgents,
  onAddAgent,
  userXP,
  unlockedAgents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  const currentAgentIds = currentAgents.map(a => a.id);
  
  const filteredAgents = allAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFamily = selectedFamily === 'all' || agent.familyColor === selectedFamily;
    const notInSquad = !currentAgentIds.includes(agent.id);
    
    return matchesSearch && matchesFamily && notInSquad;
  });

  const isAgentUnlocked = (agent: Agent) => {
    return unlockedAgents.includes(agent.id) || userXP >= agent.xpRequired;
  };

  const families = [
    { id: 'all', name: 'All', color: 'gray' },
    { id: 'blue', name: 'Product', color: 'blue' },
    { id: 'green', name: 'Design', color: 'green' },
    { id: 'purple', name: 'Engineering', color: 'purple' },
    { id: 'orange', name: 'Marketing', color: 'orange' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Agents to Squad</DialogTitle>
          <DialogDescription>
            Select agents to add to your squad (max 5 agents per squad)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {families.map((family) => (
              <Button
                key={family.id}
                variant={selectedFamily === family.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFamily(family.id)}
                className="flex-shrink-0"
              >
                {family.name}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
              {filteredAgents.map((agent) => {
                const unlocked = isAgentUnlocked(agent);
                
                return (
                  <div
                    key={agent.id}
                    className={`p-4 rounded-lg border transition-all ${
                      unlocked
                        ? 'hover:bg-muted/30 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm truncate">{agent.name}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs bg-agent-${agent.familyColor}/10`}
                          >
                            {agent.specialty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {agent.backstory}
                        </p>
                        {!unlocked && (
                          <Badge variant="secondary" className="text-xs">
                            {agent.xpRequired} XP required
                          </Badge>
                        )}
                        {unlocked && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              onAddAgent(agent);
                              onClose();
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Squad
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredAgents.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No agents found matching your criteria
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};