import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, X, TrendingUp, Target, Zap } from 'lucide-react';
import { Insight } from '@/hooks/useInsights';

interface InsightsPanelProps {
  insights: Insight[];
  onDismiss: (id: string) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, onDismiss }) => {
  if (insights.length === 0) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'diversity':
        return Target;
      case 'efficiency':
        return Zap;
      case 'trend':
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  return (
    <div className="space-y-3">
      {insights.map((insight) => {
        const Icon = getInsightIcon(insight.insightType);
        return (
          <Card key={insight.id} className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-semibold">{insight.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onDismiss(insight.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">{insight.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
