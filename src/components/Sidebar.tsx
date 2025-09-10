import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabType } from '@/types';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  MessageCircle,
  Grid3X3,
  Plus,
  Sparkles 
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
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ 
  activeTab, 
  onTabChange, 
  squadCount,
  hasActiveChat,
  onCreateCanvas
}) => {

  const mainTabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Progress'
    },
    {
      id: 'agents' as TabType,
      label: 'Agent Gallery',
      icon: Users,
      description: 'Browse & Unlock Agents'
    },
    {
      id: 'squads' as TabType,
      label: 'Squad Builder',
      icon: UserPlus,
      description: 'Create AI Teams',
      badge: squadCount > 0 ? squadCount.toString() : undefined
    },
    {
      id: 'chat' as TabType,
      label: 'Chat Interface',
      icon: MessageCircle,
      description: 'Collaborate with Agents',
      disabled: !hasActiveChat,
      badge: hasActiveChat ? 'active' : undefined
    }
  ];

  const creativeTools = [
    {
      id: 'canvas-generator',
      label: 'Canvas Generator',
      icon: Grid3X3,
      description: 'PM Framework Templates',
      onClick: onCreateCanvas
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
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton asChild>
                      <Button
                        variant="ghost"
                        onClick={() => onTabChange(tab.id)}
                        disabled={tab.disabled}
                        className={`w-full justify-start h-12 px-3 ${getNavClass(isActive, tab.disabled)}`}
                      >
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div className={`flex-1 text-left transition-opacity duration-200 overflow-hidden ${!open ? 'opacity-0 w-0' : 'opacity-100'}`}>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium whitespace-nowrap">{tab.label}</span>
                            {tab.badge && (
                              <Badge 
                                variant={tab.badge === 'active' ? 'default' : 'secondary'} 
                                className="text-xs px-1.5 py-0.5"
                              >
                                {tab.badge === 'active' ? (
                                  <Sparkles className="w-3 h-3" />
                                ) : (
                                  tab.badge
                                )}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{tab.description}</p>
                        </div>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Creative Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Creative Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creativeTools.map((tool) => {
                const Icon = tool.icon;
                
                return (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton asChild>
                      <Button
                        variant="ghost"
                        onClick={tool.onClick}
                        className="w-full justify-start h-12 px-3 hover:bg-accent/50 hover:text-accent-foreground"
                      >
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div className={`flex-1 text-left transition-opacity duration-200 overflow-hidden ${!open ? 'opacity-0 w-0' : 'opacity-100'}`}>
                          <span className="font-medium whitespace-nowrap">{tool.label}</span>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{tool.description}</p>
                        </div>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};