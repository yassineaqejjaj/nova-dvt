import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface RoadmapItem {
  quarter?: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  timeline?: string;
}

interface ChronologicalRoadmapViewProps {
  items: RoadmapItem[];
  quarters: string[];
}

export const ChronologicalRoadmapView: React.FC<ChronologicalRoadmapViewProps> = ({ items, quarters }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid gap-6">
      {quarters.map(quarter => {
        const quarterItems = items.filter(item => item.quarter === quarter);
        
        return (
          <Card key={quarter}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{quarter}</span>
                <Badge variant="outline">{quarterItems.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quarterItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun item pour cette période
                </p>
              ) : (
                <div className="space-y-3">
                  {quarterItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          {item.category && (
                            <Badge variant="outline">{item.category}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
