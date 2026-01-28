import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AgentIntentEntries, 
  getIntentAgentIds, 
  RecommendedAgents,
  AgentDetailDialog,
  AgentCardCompact
} from './agents';
import { CreateAgentDialog } from './CreateAgentDialog';
import { Agent, UserProfile, Squad } from '@/types';
import { allAgents } from '@/data/mockData';
import { 
  Search, 
  Filter, 
  Users, 
  Palette, 
  Code, 
  TrendingUp,
  X,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AgentGalleryProps {
  user: UserProfile;
  currentSquadAgents: Agent[];
  currentSquad?: Squad | null;
  contextName?: string;
  onAddToSquad: (agent: Agent) => void;
  onViewAgentDetails: (agent: Agent) => void;
  onAgentCreated: (agent: Agent) => void;
  onNavigateToSquad?: () => void;
  customAgents: Agent[];
}

const familyCategories = [
  { id: 'all', label: 'Tous', icon: Users, color: 'default' },
  { id: 'blue', label: 'Product', icon: Users, color: 'agent-blue' },
  { id: 'green', label: 'Design', icon: Palette, color: 'agent-green' },
  { id: 'purple', label: 'Tech', icon: Code, color: 'agent-purple' },
  { id: 'orange', label: 'Growth', icon: TrendingUp, color: 'agent-orange' }
];

export const AgentGallery: React.FC<AgentGalleryProps> = ({
  user,
  currentSquadAgents,
  currentSquad,
  contextName,
  onAddToSquad,
  onViewAgentDetails,
  onAgentCreated,
  onNavigateToSquad,
  customAgents
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const allAvailableAgents = [...allAgents, ...customAgents];

  // Get intent-filtered agent IDs
  const intentAgentIds = getIntentAgentIds(selectedIntent);

  const filteredAgents = useMemo(() => {
    return allAvailableAgents.filter(agent => {
      // Intent filter (if selected)
      if (selectedIntent && intentAgentIds.length > 0) {
        if (!intentAgentIds.includes(agent.id)) return false;
      }

      // Search filter
      const matchesSearch = searchTerm === '' || 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || agent.familyColor === selectedCategory;

      // Unlocked filter
      const isUnlocked = user.unlockedAgents.includes(agent.id) || user.xp >= agent.xpRequired;
      const matchesUnlocked = !showUnlockedOnly || isUnlocked;

      return matchesSearch && matchesCategory && matchesUnlocked;
    });
  }, [searchTerm, selectedCategory, showUnlockedOnly, user.unlockedAgents, user.xp, allAvailableAgents, selectedIntent, intentAgentIds]);

  const unlockedCount = allAvailableAgents.filter(agent => 
    user.unlockedAgents.includes(agent.id) || user.xp >= agent.xpRequired
  ).length;

  const handleViewDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDetailDialog(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowUnlockedOnly(false);
    setSelectedIntent(null);
  };

  // Build current squad object if not provided
  const effectiveSquad = currentSquad || (currentSquadAgents.length > 0 ? {
    id: 'current',
    name: 'Squad actuelle',
    purpose: '',
    agents: currentSquadAgents,
    createdAt: new Date()
  } as Squad : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Galerie d'Agents</h2>
          <p className="text-muted-foreground">
            Composez votre squad IA pour chaque type de travail
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowCreateAgent(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Agent</span>
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{unlockedCount}/{allAvailableAgents.length}</span>
          </Badge>
        </div>
      </div>

      {/* Intent-Based Entries */}
      <AgentIntentEntries
        selectedIntent={selectedIntent}
        onSelectIntent={setSelectedIntent}
      />

      {/* Recommended Agents (only show if no intent selected) */}
      {!selectedIntent && (
        <RecommendedAgents
          agents={allAvailableAgents.filter(a => 
            user.unlockedAgents.includes(a.id) || user.xp >= a.xpRequired
          )}
          currentSquad={effectiveSquad}
          contextName={contextName}
          onAddToSquad={onAddToSquad}
          onViewDetails={handleViewDetails}
        />
      )}

      <Separator />

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom ou capacité..."
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
                  flex items-center gap-1
                  ${isActive && category.color !== 'default' ? getFamilyButtonClass(category.color) : ''}
                `}
              >
                <Icon className="w-3 h-3" />
                <span>{category.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Advanced Filters (collapsible) */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Filter className="w-3 h-3 mr-1" />
              Filtres avancés
              {showAdvancedFilters ? (
                <ChevronUp className="w-3 h-3 ml-1" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-1" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant={showUnlockedOnly ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
              >
                Débloqués uniquement
                {showUnlockedOnly && <X className="w-3 h-3 ml-1" />}
              </Badge>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
          {selectedIntent && ' pour cette intention'}
          {searchTerm && ` pour "${searchTerm}"`}
        </p>
        
        {(searchTerm || selectedCategory !== 'all' || showUnlockedOnly || selectedIntent) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Effacer les filtres
          </Button>
        )}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <AgentCardCompact
            key={agent.id}
            agent={agent}
            isUnlocked={user.unlockedAgents.includes(agent.id) || user.xp >= agent.xpRequired}
            isInSquad={currentSquadAgents.some(a => a.id === agent.id)}
            squadName={effectiveSquad?.name}
            userXP={user.xp}
            onAddToSquad={onAddToSquad}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun agent trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Essayez d'ajuster vos critères de recherche
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Effacer les filtres
          </Button>
        </div>
      )}

      {/* Agent Detail Dialog */}
      <AgentDetailDialog
        agent={selectedAgent}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        isUnlocked={selectedAgent ? (user.unlockedAgents.includes(selectedAgent.id) || user.xp >= selectedAgent.xpRequired) : false}
        isInSquad={selectedAgent ? currentSquadAgents.some(a => a.id === selectedAgent.id) : false}
        currentSquad={effectiveSquad}
        userXP={user.xp}
        onAddToSquad={onAddToSquad}
        onNavigateToSquad={onNavigateToSquad}
      />

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
    case 'agent-blue': return 'bg-agent-blue hover:bg-agent-blue/90 text-white';
    case 'agent-green': return 'bg-agent-green hover:bg-agent-green/90 text-white';
    case 'agent-purple': return 'bg-agent-purple hover:bg-agent-purple/90 text-white';
    case 'agent-orange': return 'bg-agent-orange hover:bg-agent-orange/90 text-white';
    default: return '';
  }
}
