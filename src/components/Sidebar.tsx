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
  Shield
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
      label: 'Dashboard',
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
      label: 'Artifacts',
      icon: FileText,
      description: 'Gestion des livrables'
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Suivi & Performance'
    },
    {
      id: 'admin' as TabType,
      label: 'Admin Panel',
      icon: Shield,
      description: 'Gouvernance'
    }
  ];

  // NOVA CORE Actions (non-tab actions)
  const coreActions: any[] = [];

  // NOVA TOOLS Module - AI-accessible tools
  const toolsItems = [
    {
      label: 'Canvas Generator',
      icon: Grid3X3,
      description: 'Créer des canvas',
      isAction: true,
      onClick: onCreateCanvas
    },
    {
      id: 'instant-prd' as TabType,
      label: 'Instant PRD',
      icon: Sparkles,
      description: 'Générer un PRD en 15s',
      isAction: false
    },
    {
      id: 'meeting-minutes' as TabType,
      label: 'Comptes-rendus',
      icon: FileText,
      description: 'Transcription IA',
      isAction: false
    },
    {
      id: 'raci-generator' as TabType,
      label: 'Générateur RACI',
      icon: Users,
      description: 'Matrice responsabilités',
      isAction: false
    },
    {
      id: 'epic-to-stories' as TabType,
      label: 'Epic vers Stories',
      icon: Sparkles,
      description: 'Découpage stories IA',
      isAction: false
    }
  ];

  // NOVA WORKFLOWS Module
  const workflowItems = [
    {
      id: 'workflows' as TabType,
      label: 'All Workflows',
      icon: Workflow,
      description: 'Processus guidés IA'
    }
  ];

  // NOVA AGENT Module
  const agentItems = [
    {
      id: 'reality-mode' as TabType,
      label: 'Reality Mode',
      icon: Sparkles,
      description: 'Live squad simulation',
      disabled: !hasActiveChat,
      badge: hasActiveChat ? '✨' : undefined
    },
    {
      id: 'chat' as TabType,
      label: 'Multi-Agent Chat',
      icon: MessageCircle,
      description: 'Collaborate with AI squad',
      disabled: false,
      badge: hasActiveChat ? 'active' : undefined
    },
    {
      id: 'agents' as TabType,
      label: 'Agent Gallery',
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
              {toolsItems.map((item) => {
                const Icon = item.icon;
                const isActive = !item.isAction && activeTab === item.id;
                
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Button
                        variant="ghost"
                        onClick={() => (item as any).isAction ? (item as any).onClick?.() : onTabChange(item.id as TabType)}
                        className={`w-full justify-start h-11 px-3 ${getNavClass(isActive)}`}
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
        {renderModuleGroup('NOVA WORKFLOWS', 'workflows', workflowItems, Workflow)}
        
        {/* NOVA AGENT Module */}
        {renderModuleGroup('NOVA AGENT', 'agent', agentItems, Bot)}
      </SidebarContent>
    </Sidebar>
  );
};