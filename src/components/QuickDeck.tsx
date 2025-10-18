import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, X, FileText, Users, Zap, Layout, Sparkles, Target, TrendingUp, Calendar } from 'lucide-react';
import { PinnedItem } from '@/hooks/usePinnedItems';

interface QuickDeckProps {
  pinnedItems: PinnedItem[];
  onUnpin: (id: string) => void;
  onItemClick: (item: PinnedItem) => void;
  onNavigate?: (tab: string) => void;
}

interface QuickWorkflow {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
}

export const QuickDeck: React.FC<QuickDeckProps> = ({ pinnedItems, onUnpin, onItemClick, onNavigate }) => {
  // Popular workflows to show
  const quickWorkflows: QuickWorkflow[] = [
    {
      id: 'smart-discovery',
      name: 'Smart Discovery Canvas',
      description: 'Idée → Feature validée en 30 min',
      icon: <Sparkles className="h-4 w-4" />,
      estimatedTime: '30 min'
    },
    {
      id: 'feature-discovery',
      name: 'Feature Discovery',
      description: 'Epic structuré avec User Stories',
      icon: <Target className="h-4 w-4" />,
      estimatedTime: '45 min'
    },
    {
      id: 'roadmap-planning',
      name: 'Roadmap Planning',
      description: 'Planification stratégique trimestrielle',
      icon: <TrendingUp className="h-4 w-4" />,
      estimatedTime: '60 min'
    },
    {
      id: 'sprint-planning',
      name: 'Sprint Planning',
      description: 'Organisation du prochain sprint',
      icon: <Calendar className="h-4 w-4" />,
      estimatedTime: '40 min'
    }
  ];

  const handleWorkflowClick = (workflowId: string) => {
    if (onNavigate) {
      onNavigate('workflows');
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'workflow':
        return Zap;
      case 'agent':
        return Users;
      case 'artifact':
        return FileText;
      case 'squad':
        return Users;
      default:
        return Layout;
    }
  };

  return (
    <div className="space-y-4">
      {/* Pinned Items Section */}
      {pinnedItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Éléments épinglés</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Vos éléments favoris pour un accès rapide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedItems.map((item) => {
                const Icon = getItemIcon(item.itemType);
                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow relative group"
                    onClick={() => onItemClick(item)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Icon className="h-4 w-4 text-primary" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnpin(item.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm font-medium truncate">
                        {item.itemData?.name || item.itemData?.title || item.itemId}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {item.itemType}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Workflows Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Process rapides</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Lancez un workflow populaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickWorkflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
                onClick={() => handleWorkflowClick(workflow.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="text-primary">{workflow.icon}</div>
                    <Badge variant="outline" className="text-xs">
                      {workflow.estimatedTime}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm font-medium mb-1">{workflow.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {workflow.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
