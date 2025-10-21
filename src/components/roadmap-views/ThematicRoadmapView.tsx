import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

interface Initiative {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeline?: string;
  category: string;
  quarter?: string;
}

interface ThematicPillar {
  name: string;
  description: string;
  initiatives: Initiative[];
}

interface ThematicRoadmapViewProps {
  pillars: ThematicPillar[];
}

export const ThematicRoadmapView: React.FC<ThematicRoadmapViewProps> = ({ pillars }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {pillars.map((pillar, index) => (
        <Card key={index} className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>{pillar.name}</span>
            </CardTitle>
            <CardDescription>{pillar.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {pillar.initiatives.map((initiative, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold flex-1">{initiative.title}</h4>
                    <Badge variant={getPriorityColor(initiative.priority)} className="ml-2">
                      {initiative.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{initiative.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">{initiative.category}</Badge>
                    {initiative.timeline && <span className="text-muted-foreground">{initiative.timeline}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
