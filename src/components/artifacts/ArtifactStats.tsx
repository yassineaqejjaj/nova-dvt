import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Grid3X3, TrendingUp, Layers, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtifactStatsProps {
  stats: {
    total: number;
    canvas: number;
    story: number;
    epic: number;
    impact_analysis: number;
    tech_spec: number;
  };
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const ArtifactStats: React.FC<ArtifactStatsProps> = ({
  stats,
  activeFilter,
  onFilterChange,
}) => {
  const statItems = [
    { key: 'all', label: 'Total', value: stats.total, icon: FileText, color: 'text-foreground' },
    { key: 'canvas', label: 'Canvas', value: stats.canvas, icon: Grid3X3, color: 'text-purple-600' },
    { key: 'story', label: 'Stories', value: stats.story, icon: FileText, color: 'text-blue-600' },
    { key: 'epic', label: 'Epics', value: stats.epic, icon: Layers, color: 'text-orange-600' },
    { key: 'tech_spec', label: 'Spécs', value: stats.tech_spec, icon: Code, color: 'text-cyan-600' },
    { key: 'impact_analysis', label: 'Analyses', value: stats.impact_analysis, icon: TrendingUp, color: 'text-green-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.key;
        
        return (
          <Card
            key={item.key}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isActive && "ring-2 ring-primary bg-primary/5"
            )}
            onClick={() => onFilterChange(item.key)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={cn("text-2xl font-bold", item.color)}>
                    {item.value}
                  </p>
                </div>
                <Icon className={cn("w-5 h-5", item.color, "opacity-50")} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
