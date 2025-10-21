import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, Lightbulb } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface NowNextLaterViewProps {
  now: RoadmapItem[];
  next: RoadmapItem[];
  later: RoadmapItem[];
}

export const NowNextLaterView: React.FC<NowNextLaterViewProps> = ({ now, next, later }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const renderItems = (items: RoadmapItem[]) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun item dans cette phase
        </p>
      ) : (
        items.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors space-y-2"
          >
            <div className="flex items-start justify-between">
              <h4 className="font-semibold flex-1">{item.title}</h4>
              <Badge variant={getPriorityColor(item.priority)} className="ml-2">
                {item.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            {item.category && (
              <Badge variant="outline" className="text-xs">{item.category}</Badge>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-2 border-destructive/50">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Clock className="w-5 h-5" />
            <span>NOW</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">En cours • 0-3 mois</p>
        </CardHeader>
        <CardContent className="pt-6">
          {renderItems(now)}
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/50">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <ArrowRight className="w-5 h-5" />
            <span>NEXT</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">À venir • 3-6 mois</p>
        </CardHeader>
        <CardContent className="pt-6">
          {renderItems(next)}
        </CardContent>
      </Card>

      <Card className="border-2 border-muted-foreground/30">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>LATER</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Futur • 6+ mois</p>
        </CardHeader>
        <CardContent className="pt-6">
          {renderItems(later)}
        </CardContent>
      </Card>
    </div>
  );
};
