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
  const coreActions = [
    {
      label: 'Product Contexts',
      icon: Database,
      description: 'Gérer vos contextes',
      onClick: onManageContexts
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
      id: 'chat' as TabType,
      label: 'Chat with Agent',
      icon: MessageCircle,
      description: 'Assistant IA',
      disabled: !hasActiveChat,
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
        
        {/* NOVA CORE Actions */}
        {expandedGroups.core && open && (
          <SidebarGroup className="-mt-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {coreActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <SidebarMenuItem key={action.label}>
                      <SidebarMenuButton asChild>
                        <Button
                          variant="ghost"
                          onClick={action.onClick}
                          className="w-full justify-start h-11 px-3 hover:bg-primary/10 hover:text-primary/90"
                        >
                          <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{action.description}</p>
                          </div>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* NOVA WORKFLOWS Module */}
        {renderModuleGroup('NOVA WORKFLOWS', 'workflows', workflowItems, Workflow)}
        
        {/* NOVA AGENT Module */}
        {renderModuleGroup('NOVA AGENT', 'agent', agentItems, Bot)}

        {/* Quick Actions */}
        {open && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="ghost"
                      onClick={onCreateCanvas}
                      className="w-full justify-start h-10 px-3 hover:bg-accent/50"
                    >
                      <Grid3X3 className="w-4 h-4 mr-3" />
                      <span className="text-sm">Canvas Generator</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};