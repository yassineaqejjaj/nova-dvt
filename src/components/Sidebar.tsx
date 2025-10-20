import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabType } from '@/types';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  MessageCircle,
  Grid3X3,
  Sparkles,
  Workflow,
  FileText,
  BarChart3,
  Settings,
  Database,
  Bot,
  ChevronDown,
  Shield,
  Calculator
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface SidebarNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  squadCount: number;
  hasActiveChat: boolean;
  onCreateCanvas: () => void;
  onManageContexts: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ 
  activeTab, 
  onTabChange, 
  squadCount,
  hasActiveChat,
  onCreateCanvas,
  onManageContexts
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    core: true,
    tools: true,
    workflows: true,
    agent: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // NOVA CORE Module
  const coreItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble'
    },
    {
      id: 'product-context' as TabType,
      label: 'Contexte Produit',
      icon: Database,
      description: 'Gestion du contexte global'
    },
    {
      id: 'artifacts' as TabType,
      label: 'Artefacts',
      icon: FileText,
      description: 'Gestion des livrables'
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytiques',
      icon: BarChart3,
      description: 'Suivi & Performance'
    },
    {
      id: 'admin' as TabType,
      label: 'Panneau Admin',
      icon: Shield,
      description: 'Gouvernance'
    }
  ];

  // NOVA CORE Actions (non-tab actions)
  const coreActions: any[] = [];

  // NOVA TOOLS Module - organized by segments
  const toolsSegments = {
    discovery: {
      title: 'Découverte & Recherche',
      items: [
        {
          id: 'user-persona-builder' as TabType,
          label: 'User Personas',
          icon: Users,
          description: 'Builder de personas'
        }
      ]
    },
    planning: {
      title: 'Planification Stratégique',
      items: [
        {
          label: 'Canvas Generator',
          icon: Grid3X3,
          description: 'Frameworks stratégiques',
          isAction: true,
          onClick: onCreateCanvas
        },
        {
          id: 'document-roadmap' as TabType,
          label: 'Document vers Roadmap',
          icon: FileText,
          description: 'Roadmap depuis document'
        }
      ]
    },
    specifications: {
      title: 'Spécifications & Définition',
      items: [
        {
          id: 'instant-prd' as TabType,
          label: 'PRD instantané',
          icon: Sparkles,
          description: 'Générer un PRD en 15s'
        },
        {
          id: 'epic-to-stories' as TabType,
          label: 'Epic vers Stories',
          icon: Sparkles,
          description: 'Découpage stories IA'
        }
      ]
    },
    team: {
      title: 'Gestion d\'Équipe',
      items: [
        {
          id: 'raci-generator' as TabType,
          label: 'Générateur RACI',
          icon: Users,
          description: 'Matrice responsabilités'
        }
      ]
    },
    metrics: {
      title: 'Estimation & Métriques',
      items: [
        {
          id: 'estimation-tool' as TabType,
          label: 'Estimation & Sizing',
          icon: Calculator,
          description: 'Estimations rapides'
        }
      ]
    },
    documentation: {
      title: 'Documentation',
      items: [
        {
          id: 'release-notes-generator' as TabType,
          label: 'Release Notes',
          icon: FileText,
          description: 'Générateur de notes'
        },
        {
          id: 'meeting-minutes' as TabType,
          label: 'Comptes-rendus',
          icon: FileText,
          description: 'Transcription IA'
        }
      ]
    }
  };

  // NOVA WORKFLOWS Module
  const workflowItems = [
    {
      id: 'workflows' as TabType,
      label: 'Tous les Process',
      icon: Workflow,
      description: 'Processus guidés IA'
    }
  ];

  // NOVA AGENT Module
  const agentItems = [
    {
      id: 'reality-mode' as TabType,
      label: 'Mode Réalité',
      icon: Sparkles,
      description: 'Simulation live de squad',
      disabled: !hasActiveChat,
      badge: hasActiveChat ? '✨' : undefined
    },
    {
      id: 'chat' as TabType,
      label: 'Chat Multi-Agents',
      icon: MessageCircle,
      description: 'Collaborer avec une squad IA',
      disabled: false,
      badge: hasActiveChat ? 'active' : undefined
    },
    {
      id: 'agents' as TabType,
      label: 'Galerie d\'Agents',
      icon: Users,
      description: 'Multi-rôle adaptatif'
    },
    {
      id: 'squads' as TabType,
      label: 'Squads',
      icon: UserPlus,
      description: 'Collaboration',
      badge: squadCount > 0 ? squadCount.toString() : undefined
    }
  ];

  const getNavClass = (isActive: boolean, disabled?: boolean) => {
    if (disabled) return 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground';
    return isActive 
      ? 'bg-primary/20 text-primary border-r-2 border-primary' 
      : 'hover:bg-primary/10 hover:text-primary/90';
  };

  const { open, setOpen } = useSidebar();

  const handleMouseEnter = () => {
    if (!open) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const renderModuleGroup = (
    title: string,
    groupId: string,
    items: Array<{
      id: TabType;
      label: string;
      icon: any;
      description: string;
      disabled?: boolean;
      badge?: string;
    }>,
    moduleIcon: any
  ) => {
    const ModuleIcon = moduleIcon;
    const isExpanded = expandedGroups[groupId];

    return (
      <SidebarGroup key={groupId}>
        <div className="mb-2">
          <Button
            variant="ghost"
            onClick={() => toggleGroup(groupId)}
            className="w-full justify-start px-2 h-8 hover:bg-primary/5"
          >
            <ModuleIcon className="w-4 h-4 mr-2 text-primary" />
            {open && (
              <>
                <SidebarGroupLabel className="flex-1 text-left font-semibold text-primary">
                  {title}
                </SidebarGroupLabel>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                />
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <Button
                        variant="ghost"
                        onClick={() => !item.disabled && onTabChange(item.id)}
                        disabled={item.disabled}
                        className={`w-full justify-start h-11 px-3 ${getNavClass(isActive, item.disabled)}`}
                      >
                        <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                        <div className={`flex-1 text-left transition-opacity duration-200 overflow-hidden ${!open ? 'opacity-0 w-0' : 'opacity-100'}`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                            {item.badge && (
                              <Badge 
                                variant={item.badge === 'active' ? 'default' : 'secondary'} 
                                className="text-xs px-1.5 py-0.5"
                              >
                                {item.badge === 'active' ? (
                                  <Sparkles className="w-3 h-3" />
                                ) : (
                                  item.badge
                                )}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</p>
                        </div>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
    );
  };

  const renderToolsGroup = () => {
    const isExpanded = expandedGroups.tools;
    
    return (
      <SidebarGroup key="tools">
        <div className="mb-2">
          <Button
            variant="ghost"
            onClick={() => toggleGroup('tools')}
            className="w-full justify-start px-2 h-8 hover:bg-primary/5"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            {open && (
              <>
                <SidebarGroupLabel className="flex-1 text-left font-semibold text-primary">
                  NOVA TOOLS
                </SidebarGroupLabel>
                <Badge variant="secondary" className="text-xs">AI</Badge>
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                />
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(toolsSegments).map(([segmentKey, segment]) => (
                <div key={segmentKey} className="mb-4">
                  {open && (
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {segment.title}
                    </div>
                  )}
                  {segment.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = !(item as any).isAction && activeTab === item.id;
                    
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          <Button
                            variant="ghost"
                            onClick={() => (item as any).isAction ? (item as any).onClick?.() : onTabChange(item.id as TabType)}
                            className={`w-full justify-start h-10 px-3 ${getNavClass(isActive)}`}
                          >
                            <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                            <div className={`flex-1 text-left transition-opacity duration-200 overflow-hidden ${!open ? 'opacity-0 w-0' : 'opacity-100'}`}>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</p>
                            </div>
                          </Button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
    );
  };

  return (
    <Sidebar 
      className={`transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-14'
      }`}
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="overflow-hidden">
        {/* NOVA CORE Module */}
        {renderModuleGroup('NOVA CORE', 'core', coreItems, Database)}
        
        
        {/* NOVA TOOLS Module - AI-accessible */}
        {renderToolsGroup()}
        
        {/* NOVA WORKFLOWS Module */}
        {renderModuleGroup('NOVA PROCESS', 'workflows', workflowItems, Workflow)}
        
        {/* NOVA AGENT Module */}
        {renderModuleGroup('NOVA AGENT', 'agent', agentItems, Bot)}
      </SidebarContent>
    </Sidebar>
  );
};