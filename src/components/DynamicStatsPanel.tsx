import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Users, Zap, Target } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface StatsPanelProps {
  userId: string;
  timeRange?: '7d' | '30d' | '90d';
}

export const DynamicStatsPanel: React.FC<StatsPanelProps> = ({ userId, timeRange = '7d' }) => {
  // Mock data - in real implementation, this would come from analytics
  const topAgents = [
    { name: 'Sarah Chen', role: 'Product Manager', interactions: 24, trend: 'up' },
    { name: 'Alex Kim', role: 'Designer', interactions: 18, trend: 'up' },
    { name: 'David Chang', role: 'Développeur', interactions: 15, trend: 'stable' },
  ];

  const ongoingWorkflows = [
    { name: 'Découverte de fonctionnalités', progress: 75, daysActive: 3 },
    { name: 'Planification de sprint', progress: 40, daysActive: 1 },
    { name: 'Planification de roadmap', progress: 90, daysActive: 7 },
  ];

  const performanceTrend = [
    { day: 'Mon', value: 12 },
    { day: 'Tue', value: 19 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 25 },
    { day: 'Fri', value: 22 },
    { day: 'Sat', value: 18 },
    { day: 'Sun', value: 20 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Top Agents This Week */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Top Agents cette semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {topAgents.map((agent, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{agent.interactions}</span>
                    {agent.trend === 'up' && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Ongoing Workflows */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Process en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {ongoingWorkflows.map((workflow, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{workflow.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {workflow.daysActive}d active
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${workflow.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{workflow.progress}% complete</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Tendances de performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={performanceTrend}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">24</p>
                <p className="text-xs text-muted-foreground">Interactions</p>
              </div>
              <div>
                <p className="text-lg font-bold">3</p>
                <p className="text-xs text-muted-foreground">Squads actives</p>
              </div>
              <div>
                <p className="text-lg font-bold">+18%</p>
                <p className="text-xs text-muted-foreground">Croissance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
