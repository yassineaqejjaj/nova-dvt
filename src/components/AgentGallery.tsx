import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentCard } from './AgentCard';
import { CreateAgentDialog } from './CreateAgentDialog';
import { Agent, UserProfile } from '@/types';
import { allAgents } from '@/data/mockData';
import { 
  Search, 
  Filter, 
  Users, 
  Palette, 
  Code, 
  TrendingUp,
  X,
  Plus
} from 'lucide-react';

interface AgentGalleryProps {
  user: UserProfile;
  currentSquadAgents: Agent[];
  onAddToSquad: (agent: Agent) => void;
  onViewAgentDetails: (agent: Agent) => void;
  onAgentCreated: (agent: Agent) => void;
  customAgents: Agent[];
}

const familyCategories = [
  { id: 'all', label: 'All Agents', icon: Users, color: 'default' },
  { id: 'blue', label: 'Product Management', icon: Users, color: 'agent-blue' },
  { id: 'green', label: 'Design & Workflow', icon: Palette, color: 'agent-green' },
  { id: 'purple', label: 'Development', icon: Code, color: 'agent-purple' },
  { id: 'orange', label: 'Growth & Analytics', icon: TrendingUp, color: 'agent-orange' }
];

export const AgentGallery: React.FC<AgentGalleryProps> = ({
  user,
  currentSquadAgents,
  onAddToSquad,
  onViewAgentDetails,
  onAgentCreated,
  customAgents
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);

  const allAvailableAgents = [...allAgents, ...customAgents];

  const filteredAgents = useMemo(() => {
    return allAvailableAgents.filter(agent => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase())) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || agent.familyColor === selectedCategory;

      // Unlocked filter
      const isUnlocked = user.unlockedAgents.includes(agent.id) || user.xp >= agent.xpRequired;
      const matchesUnlocked = !showUnlockedOnly || isUnlocked;

      return matchesSearch && matchesCategory && matchesUnlocked;
    });
  }, [searchTerm, selectedCategory, showUnlockedOnly, user.unlockedAgents, user.xp, allAvailableAgents]);

  const unlockedCount = allAvailableAgents.filter(agent => 
    user.unlockedAgents.includes(agent.id) || user.xp >= agent.xpRequired
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Agent Gallery</h2>
          <p className="text-muted-foreground">
            Discover and unlock specialized AI agents for your squads
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowCreateAgent(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </Button>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{unlockedCount}/{allAvailableAgents.length} Unlocked</span>
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search agents by name, specialty, or capabilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {familyCategories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center space-x-2
                  ${isActive && category.color !== 'default' ? getFamilyButtonClass(category.color) : ''}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.id === 'all' 
                    ? allAvailableAgents.length 
                    : allAvailableAgents.filter(a => a.familyColor === category.id).length
                  }
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showUnlockedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Unlocked Only</span>
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
        
        {filteredAgents.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setShowUnlockedOnly(false);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isUnlocked={user.unlockedAgents.includes(agent.id)}
            isInSquad={currentSquadAgents.some(a => a.id === agent.id)}
            userXP={user.xp}
            onAddToSquad={onAddToSquad}
            onViewDetails={onViewAgentDetails}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No agents found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Create Agent Dialog */}
      <CreateAgentDialog
        open={showCreateAgent}
        onClose={() => setShowCreateAgent(false)}
        onAgentCreated={onAgentCreated}
      />
    </div>
  );
};

function getFamilyButtonClass(color: string): string {
  switch (color) {
    case 'agent-blue': return 'bg-agent-blue hover:bg-agent-blue-light text-white';
    case 'agent-green': return 'bg-agent-green hover:bg-agent-green-light text-white';
    case 'agent-purple': return 'bg-agent-purple hover:bg-agent-purple-light text-white';
    case 'agent-orange': return 'bg-agent-orange hover:bg-agent-orange-light text-white';
    default: return '';
  }
}