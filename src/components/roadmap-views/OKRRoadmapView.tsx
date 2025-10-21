import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp } from 'lucide-react';

interface Initiative {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  timeline?: string;
  quarter?: string;
}

interface OKRItem {
  objective: string;
  keyResults: string[];
  initiatives: Initiative[];
  status: 'not-started' | 'in-progress' | 'completed';
}

interface OKRRoadmapViewProps {
  okrs: OKRItem[];
}

export const OKRRoadmapView: React.FC<OKRRoadmapViewProps> = ({ okrs }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'completed': return 100;
      case 'in-progress': return 50;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {okrs.map((okr, index) => (
        <Card key={index} className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center space-x-2 flex-1">
                  <Target className="w-5 h-5" />
                  <span>{okr.objective}</span>
                </CardTitle>
                <Badge variant={getStatusColor(okr.status)}>
                  {okr.status === 'not-started' && 'Non commencé'}
                  {okr.status === 'in-progress' && 'En cours'}
                  {okr.status === 'completed' && 'Terminé'}
                </Badge>
              </div>
              <Progress value={getStatusProgress(okr.status)} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Key Results */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Résultats Clés
              </h4>
              <div className="space-y-2">
                {okr.keyResults.map((kr, krIndex) => (
                  <div
                    key={krIndex}
                    className="flex items-start p-3 bg-primary/5 rounded-lg"
                  >
                    <span className="text-sm font-medium text-primary mr-2">
                      KR{krIndex + 1}:
                    </span>
                    <span className="text-sm">{kr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Initiatives */}
            <div className="space-y-3">
              <h4 className="font-semibold">Initiatives</h4>
              <div className="space-y-3">
                {okr.initiatives.map((initiative, initIndex) => (
                  <div
                    key={initIndex}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h5 className="font-semibold flex-1">{initiative.title}</h5>
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
