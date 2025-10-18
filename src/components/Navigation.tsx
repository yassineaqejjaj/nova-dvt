import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabType } from '@/types';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  MessageCircle,
  Sparkles 
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  squadCount: number;
  hasActiveChat: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  squadCount,
  hasActiveChat 
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble & Progression'
    },
    {
      id: 'agents' as TabType,
      label: 'Galerie d\'Agents',
      icon: Users,
      description: 'Parcourir & Débloquer les Agents'
    },
    {
      id: 'squads' as TabType,
      label: 'Créateur de Squad',
      icon: UserPlus,
      description: 'Créer des équipes IA',
      badge: squadCount > 0 ? squadCount.toString() : undefined
    },
    {
      id: 'chat' as TabType,
      label: 'Interface de chat',
      icon: MessageCircle,
      description: 'Collaborer avec les Agents',
      disabled: !hasActiveChat,
      badge: hasActiveChat ? 'active' : undefined
    }
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center space-x-2 px-4 py-6 rounded-none border-b-2 transition-all duration-200 hover-scale
                  ${isActive 
                    ? 'border-primary bg-primary/20 text-primary shadow-sm' 
                    : 'border-transparent hover:border-primary/60 hover:bg-primary/10 hover:text-primary/90 hover:shadow-sm'
                  }
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-transparent hover:text-muted-foreground' : ''}
                `}
              >
                <Icon className="w-4 h-4" />
                <div className="hidden sm:block text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{tab.label}</span>
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
                  <p className="text-xs text-muted-foreground">{tab.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};