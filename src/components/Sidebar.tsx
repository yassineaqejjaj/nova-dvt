import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calculator,
  Star
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
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    quickAccess: true,
    core: false,
    tools: false,
    workflows: false,
    agent: true,
  });

  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({
    discovery: false,
    planning: false,
    team: false,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleSegment = (segmentId: string) => {
    setExpandedSegments(prev => ({ ...prev, [segmentId]: !prev[segmentId] }));
  };

  // ACCÈS RAPIDE - Always visible
  const quickAccessItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble'
    },
    {
      id: 'chat' as TabType,
      label: 'Chat Multi-Agents',
      icon: MessageCircle,
      description: 'Collaboration IA',
      badge: hasActiveChat ? 'active' : undefined
    },
    {
      id: 'artifacts' as TabType,
      label: 'Artefacts',
      icon: FileText,
      description: 'Livrables'
    }
  ];

  // NOVA CORE - Simplified
  const coreItems = [
    {
      id: 'product-context' as TabType,
      label: 'Contexte Produit',
      icon: Database,
      description: 'Contexte global'
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytiques',
      icon: BarChart3,
      description: 'Performance'
    },
    {
      id: 'admin' as TabType,
      label: 'Admin',
      icon: Shield,
      description: 'Paramètres'
    }
  ];

  // NOVA CORE Actions (non-tab actions)
  const coreActions: any[] = [];

  // NOVA TOOLS Module - Optimized into 3 segments
  const toolsSegments = {
    discovery: {
      title: 'Discovery & Strategy',
      items: [
        {
          id: 'user-research' as TabType,
          label: 'Recherche Utilisateur',
          icon: Users,
          description: 'Personas & Market Research',
          isRoute: true,
          route: '/user-research'
        },
        {
          label: 'Canvas Generator',
          icon: Grid3X3,
          description: 'Frameworks stratégiques',
          isAction: true,
          onClick: onCreateCanvas
        }
      ]
    },
    planning: {
      title: 'Specs & Planning',
      items: [
        {
          id: 'instant-prd' as TabType,
          label: 'PRD',
          icon: Sparkles,
          description: 'Générateur PRD'
        },
        {
          id: 'document-roadmap' as TabType,
          label: 'Doc → Roadmap',
          icon: FileText,
          description: 'Convertir en roadmap'
        },
        {
          id: 'epic-to-stories' as TabType,
          label: 'Epic → Stories',
          icon: Sparkles,
          description: 'Découpage Auto'
        },
        {
          id: 'git-to-specs' as TabType,
          label: 'Git → Specs',
          icon: FileText,
          description: 'Analyse repo → docs'
        }
      ]
    },
    team: {
      title: 'Team & Docs',
      items: [
        {
          id: 'raci-generator' as TabType,
          label: 'RACI',
          icon: Users,
          description: 'Responsabilités'
        },
        {
          id: 'estimation-tool' as TabType,
          label: 'Estimation',
          icon: Calculator,
          description: 'Sizing'
        },
        {
          id: 'release-notes-generator' as TabType,
          label: 'Release Notes',
          icon: FileText,
          description: 'Notes version'
        },
        {
          id: 'meeting-minutes' as TabType,
          label: 'CR Réunion',
          icon: FileText,
          description: 'Transcription'
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
      disabled: false,
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
            className="w-full justify-start px-2 h-7 hover:bg-primary/5"
          >
            <ModuleIcon className="w-4 h-4 mr-2 text-primary" />
            {open && (
              <>
                <SidebarGroupLabel className="flex-1 text-left font-semibold text-primary">
                  {title}
                </SidebarGroupLabel>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
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
                        className={`w-full justify-start h-9 px-3 ${getNavClass(isActive, item.disabled)}`}
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
            className="w-full justify-start px-2 h-7 hover:bg-primary/5"
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
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(toolsSegments).map(([segmentKey, segment]) => {
                const isSegmentExpanded = expandedSegments[segmentKey];
                
                return (
                  <div key={segmentKey} className="mb-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleSegment(segmentKey)}
                      className="w-full justify-start px-3 py-2 h-7 hover:bg-muted/50"
                    >
                      {open && (
                        <>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 text-left">
                            {segment.title}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              isSegmentExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </>
                      )}
                      {!open && (
                        <div className="w-4 h-0.5 bg-muted-foreground/30 rounded" />
                      )}
                    </Button>
                    
                    {isSegmentExpanded && segment.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = !(item as any).isAction && !(item as any).isRoute && activeTab === item.id;
                      
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton asChild>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                if ((item as any).isAction) {
                                  (item as any).onClick?.();
                                } else if ((item as any).isRoute) {
                                  navigate((item as any).route);
                                } else {
                                  onTabChange(item.id as TabType);
                                }
                              }}
                              className={`w-full justify-start h-9 px-3 ${getNavClass(isActive)}`}
                            >
                              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              <div className={`flex-1 text-left transition-opacity duration-200 overflow-hidden ${!open ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                </div>
                              </div>
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                );
              })}
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
      <SidebarContent>
        {/* ACCÈS RAPIDE - Always visible */}
        {renderModuleGroup('ACCÈS RAPIDE', 'quickAccess', quickAccessItems, Star)}
        
        {/* NOVA CORE - Simplified */}
        {renderModuleGroup('NOVA CORE', 'core', coreItems, Database)}
        
        {/* NOVA TOOLS - Optimized segments */}
        {renderToolsGroup()}
        
        {/* NOVA PROCESS - Workflows */}
        {renderModuleGroup('NOVA PROCESS', 'workflows', workflowItems, Workflow)}
        
        {/* NOVA AGENT - Expanded by default */}
        {renderModuleGroup('NOVA AGENT', 'agent', agentItems, Bot)}
      </SidebarContent>
    </Sidebar>
  );
};