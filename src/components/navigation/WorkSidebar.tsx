import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImpactNotificationBadge } from '@/components/impact-analysis/ImpactNotificationBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabType } from '@/types';
import { 
  MessageCircle,
  Sparkles,
  FileText,
  Database,
  Workflow,
  BarChart3,
  Home,
  Bot,
  Shield,
  ChevronDown,
  Wrench,
  Hammer,
  Target,
  GitBranch,
  Rocket,
  Scan
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

interface WorkSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  squadCount: number;
  hasActiveChat: boolean;
  onCreateCanvas: () => void;
  onManageContexts: () => void;
  onOpenToolbox?: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  description: string;
  icon: any;
  badge?: string;
  disabled?: boolean;
  isRoute?: boolean;
  route?: string;
  hasImpactBadge?: boolean;
}

interface NavSection {
  id: string;
  title: string;
  icon: any;
  items: NavItem[];
  defaultExpanded?: boolean;
}

export const WorkSidebar: React.FC<WorkSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  squadCount,
  hasActiveChat,
  onCreateCanvas,
  onManageContexts,
  onOpenToolbox
}) => {
  const navigate = useNavigate();
  const { open, setOpen } = useSidebar();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    home: true,
    work: true,
    build: true,
    structure: false,
    monitor: false,
    config: false
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Navigation sections - Home first, then work contexts
  const navSections: NavSection[] = [
    {
      id: 'home',
      title: 'Accueil',
      icon: Home,
      defaultExpanded: true,
      items: [
        {
          id: 'dashboard' as TabType,
          label: 'Accueil',
          description: 'Démarrer et reprendre',
          icon: Home
        }
      ]
    },
    {
      id: 'work',
      title: 'Travail en cours',
      icon: Sparkles,
      defaultExpanded: true,
      items: [
        {
          id: 'chat' as TabType,
          label: 'Chat Multi-Agents',
          description: 'Discuter et décider avec votre squad',
          icon: MessageCircle,
          badge: hasActiveChat ? 'active' : undefined
        },
        {
          id: 'reality-mode' as TabType,
          label: 'Mode Réalité',
          description: 'Débattre et trancher sur des sujets concrets',
          icon: Sparkles
        },
        {
          id: 'artifacts' as TabType,
          label: 'Artefacts',
          description: 'Retrouver vos livrables',
          icon: FileText
        }
      ]
    },
    {
      id: 'build',
      title: 'Produire',
      icon: Hammer,
      defaultExpanded: true,
      items: [
        {
          id: 'mission-activation' as TabType,
          label: 'Activation Mission',
          description: 'Onboarding guidé en mission',
          icon: Rocket
        },
        {
          id: 'impact-analysis' as TabType,
          label: 'Analyse d\'Impact',
          description: 'Détecter les conséquences d\'un changement',
          icon: Scan,
          hasImpactBadge: true
        },
        {
          id: 'instant-prd' as TabType,
          label: 'Créer un document produit',
          description: 'Idée → document clair',
          icon: FileText
        },
        {
          id: 'epic-to-stories' as TabType,
          label: 'Découper une feature',
          description: 'Feature → tâches',
          icon: Target
        },
        {
          id: 'git-to-specs' as TabType,
          label: 'Générer des specs',
          description: 'Code → specs techniques',
          icon: GitBranch
        },
        {
          id: 'toolbox' as TabType,
          label: 'Voir tous les outils',
          description: 'Tous les outils Nova',
          icon: Wrench
        }
      ]
    },
    {
      id: 'structure',
      title: 'Structurer',
      icon: Database,
      items: [
        {
          id: 'product-context' as TabType,
          label: 'Contextes Produit',
          description: 'Donner le cadre métier et produit',
          icon: Database
        },
        {
          id: 'workflows' as TabType,
          label: 'Process',
          description: 'Suivre des parcours guidés',
          icon: Workflow
        },
        {
          id: 'squads' as TabType,
          label: 'Squads',
          description: 'Gérer les équipes IA',
          icon: Bot,
          badge: squadCount > 0 ? squadCount.toString() : undefined
        }
      ]
    },
    {
      id: 'monitor',
      title: 'Piloter',
      icon: BarChart3,
      items: [
        {
          id: 'analytics' as TabType,
          label: 'Analytics',
          description: 'Suivre l\'activité et l\'impact',
          icon: BarChart3
        }
      ]
    },
    {
      id: 'config',
      title: 'Configuration',
      icon: Shield,
      items: [
        {
          id: 'agents' as TabType,
          label: 'Galerie d\'agents',
          description: 'Découvrir et gérer les agents',
          icon: Bot
        },
        {
          id: 'admin' as TabType,
          label: 'Admin',
          description: 'Paramètres et accès',
          icon: Shield
        }
      ]
    }
  ];
  const getNavClass = (isActive: boolean, disabled?: boolean) => {
    if (disabled) return 'opacity-50 cursor-not-allowed';
    return isActive 
      ? 'bg-primary/10 text-primary border-l-2 border-primary' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';
  };

  const handleMouseEnter = () => {
    if (!open) setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const handleItemClick = (item: NavItem) => {
    if (item.disabled) return;
    if (item.isRoute && item.route) {
      navigate(item.route);
    } else {
      onTabChange(item.id);
    }
  };

  return (
    <Sidebar 
      className={`transition-all duration-300 ease-in-out border-r border-border/50 ${
        open ? 'w-64' : 'w-14'
      }`}
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="pt-2">
        {navSections.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.id];

          return (
            <SidebarGroup key={section.id} className="py-1">
              {/* Section Header */}
              <Button
                variant="ghost"
                onClick={() => toggleSection(section.id)}
                className="w-full justify-start px-3 h-8 hover:bg-transparent group"
              >
                <SectionIcon className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                {open && (
                  <>
                    <SidebarGroupLabel className="flex-1 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                      {section.title}
                    </SidebarGroupLabel>
                    <ChevronDown
                      className={`w-3 h-3 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                )}
              </Button>

              {/* Section Items */}
              {isExpanded && open && (
                <SidebarGroupContent className="mt-1">
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton asChild>
                            <Button
                              variant="ghost"
                              onClick={() => handleItemClick(item)}
                              disabled={item.disabled}
                              className={`w-full justify-start h-auto py-2.5 px-3 ${getNavClass(isActive, item.disabled)}`}
                            >
                              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{item.label}</span>
                                  {item.hasImpactBadge && (
                                    <ImpactNotificationBadge />
                                  )}
                                  {item.badge && (
                                    <Badge 
                                      variant={item.badge === 'active' ? 'default' : 'secondary'} 
                                      className="text-xs px-1.5 py-0 h-4"
                                    >
                                      {item.badge === 'active' ? (
                                        <Sparkles className="w-2.5 h-2.5" />
                                      ) : (
                                        item.badge
                                      )}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}

              {/* Collapsed state - just icons */}
              {!open && (
                <SidebarGroupContent className="mt-1">
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton asChild>
                            <Button
                              variant="ghost"
                              onClick={() => handleItemClick(item)}
                              disabled={item.disabled}
                              className={`w-full justify-center h-9 px-2 ${getNavClass(isActive, item.disabled)}`}
                              title={item.label}
                            >
                              <Icon className="w-4 h-4" />
                              {item.badge && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
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
        })}
      </SidebarContent>
    </Sidebar>
  );
};
