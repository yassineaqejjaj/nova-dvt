import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, X, FileText, Users, Zap, Layout } from 'lucide-react';
import { PinnedItem } from '@/hooks/usePinnedItems';

interface QuickDeckProps {
  pinnedItems: PinnedItem[];
  onUnpin: (id: string) => void;
  onItemClick: (item: PinnedItem) => void;
}

export const QuickDeck: React.FC<QuickDeckProps> = ({ pinnedItems, onUnpin, onItemClick }) => {
  if (pinnedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Quick Deck</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Pin your favorite workflows and agents for quick access
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Quick Deck</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Your pinned items for quick access
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
  );
};
