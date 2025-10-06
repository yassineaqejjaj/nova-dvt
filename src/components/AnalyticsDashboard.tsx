import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsEvent } from '@/types';
import { TrendingUp, Users, Zap, FileText, Grid3X3, MessageSquare, Loader2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  userId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventCounts = () => {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      counts[event.event_type] = (counts[event.event_type] || 0) + 1;
    });
    return counts;
  };

  const getLast7Days = () => {
    const days: Record<string, number> = {};
    const last7Days = events.filter(e => {
      const eventDate = new Date(e.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate >= weekAgo;
    });

    last7Days.forEach(event => {
      const date = new Date(event.created_at).toLocaleDateString();
      days[date] = (days[date] || 0) + 1;
    });

    return days;
  };

  const counts = getEventCounts();
  const dailyActivity = getLast7Days();

  const stats = [
    {
      title: 'Total Activities',
      value: events.length,
      icon: <Zap className="w-4 h-4" />,
      color: 'text-primary',
    },
    {
      title: 'Artifacts Created',
      value: (counts.canvas_generated || 0) + (counts.story_generated || 0) + (counts.impact_analysis_generated || 0),
      icon: <FileText className="w-4 h-4" />,
      color: 'text-agent-blue',
    },
    {
      title: 'Workspaces',
      value: counts.workspace_created || 0,
      icon: <Users className="w-4 h-4" />,
      color: 'text-agent-green',
    },
    {
      title: 'Chat Messages',
      value: counts.message_sent || 0,
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'text-agent-purple',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Track your productivity and usage patterns
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days Activity</CardTitle>
              <CardDescription>Daily activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(dailyActivity).map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between p-2 border-b last:border-0">
                    <span className="text-sm font-medium">{date}</span>
                    <Badge variant="outline">{count} activities</Badge>
                  </div>
                ))}
                {Object.keys(dailyActivity).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No activity in the last 7 days</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>All-time activity by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(counts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 border-b last:border-0">
                      <span className="text-sm font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest 20 activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Insights</CardTitle>
              <CardDescription>Patterns and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Most Active Feature</h4>
                <p className="text-sm text-muted-foreground">
                  {Object.entries(counts).length > 0
                    ? `You've used ${Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0].replace(/_/g, ' ')} the most`
                    : 'Start using Squad Mate to see insights'}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Productivity Trend</h4>
                <p className="text-sm text-muted-foreground">
                  {Object.keys(dailyActivity).length > 0
                    ? `You've been active for ${Object.keys(dailyActivity).length} days in the last week`
                    : 'No recent activity to analyze'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};