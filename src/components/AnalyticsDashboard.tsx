import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsEvent } from '@/types';
import {
  TrendingUp,
  Users,
  Zap,
  FileText,
  Grid3X3,
  MessageSquare,
  Loader2,
  Activity,
  Target,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
      // Load all events from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

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
    events.forEach((event) => {
      counts[event.event_type] = (counts[event.event_type] || 0) + 1;
    });
    return counts;
  };

  // Workflows Executed - Last 7 days by type
  const getWorkflowsByDay = () => {
    const last7Days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });

      const dayEvents = events.filter((e) => {
        const eventDate = new Date(e.created_at ?? '');
        return (
          eventDate.toDateString() === date.toDateString() && e.event_type.includes('workflow')
        );
      });

      last7Days.push({
        date: dateStr,
        'Feature Discovery': dayEvents.filter((e) => e.event_type === 'workflow_feature_discovery')
          .length,
        'Roadmap Planning': dayEvents.filter((e) => e.event_type === 'workflow_roadmap').length,
        'Sprint Planning': dayEvents.filter((e) => e.event_type === 'workflow_sprint').length,
        'Tech Spec': dayEvents.filter((e) => e.event_type === 'workflow_tech_spec').length,
      });
    }
    return last7Days;
  };

  // Success Rate - Workflow completion rate over time
  const getSuccessRate = () => {
    const last7Days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });

      const dayWorkflows = events.filter((e) => {
        const eventDate = new Date(e.created_at ?? '');
        return (
          eventDate.toDateString() === date.toDateString() && e.event_type.includes('workflow')
        );
      });

      const completed = dayWorkflows.filter((e) => e.event_data?.status === 'completed').length;
      const total = dayWorkflows.length;

      last7Days.push({
        date: dateStr,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }
    return last7Days;
  };

  // Average Latency
  const getAvgLatency = () => {
    const workflowEvents = events.filter(
      (e) => e.event_type.includes('workflow') && e.event_data?.latency
    );
    if (workflowEvents.length === 0) return 0;

    const totalLatency = workflowEvents.reduce((sum, e) => sum + (e.event_data?.latency || 0), 0);
    return Math.round(totalLatency / workflowEvents.length);
  };

  // Artifacts Created by type
  const getArtifactsByType = () => {
    const types = ['epic', 'story', 'canvas', 'impact_analysis'];
    const last7Days: any[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });

      const dayArtifacts = events.filter((e) => {
        const eventDate = new Date(e.created_at ?? '');
        return (
          eventDate.toDateString() === date.toDateString() && e.event_type.includes('artifact')
        );
      });

      const result: any = { date: dateStr };
      types.forEach((type) => {
        result[type] = dayArtifacts.filter((e) => e.event_data?.artifact_type === type).length;
      });

      last7Days.push(result);
    }
    return last7Days;
  };

  // Agent Conversations by role
  const getConversationsByRole = () => {
    const conversations = events.filter((e) => e.event_type === 'agent_conversation');

    const roleCount: Record<string, number> = {};
    conversations.forEach((e) => {
      const role = e.event_data?.role || 'Unknown';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    return Object.entries(roleCount).map(([name, value]) => ({
      name:
        name === 'PM'
          ? 'Product Manager'
          : name === 'Designer'
            ? 'Designer'
            : name === 'Dev'
              ? 'Developer'
              : name,
      value,
    }));
  };

  // Active Users (DAU/WAU/MAU)
  const getActiveUsers = () => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      DAU: events.filter((e) => new Date(e.created_at ?? '') >= dayAgo).length,
      WAU: events.filter((e) => new Date(e.created_at ?? '') >= weekAgo).length,
      MAU: events.filter((e) => new Date(e.created_at ?? '') >= monthAgo).length,
    };
  };

  // Module Heatmap
  const getModuleHeatmap = () => {
    const modules = ['Core', 'Workflows', 'Agent'];
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const heatmapData: any[] = [];
    modules.forEach((module) => {
      days.forEach((day) => {
        const moduleEvents = events.filter((e) => {
          const eventDate = new Date(e.created_at ?? '');
          const dayName = eventDate.toLocaleDateString('fr-FR', { weekday: 'short' });

          if (dayName !== day) return false;

          if (module === 'Core') {
            return e.event_type.includes('artifact') || e.event_type.includes('context');
          } else if (module === 'Workflows') {
            return e.event_type.includes('workflow');
          } else {
            return e.event_type.includes('agent') || e.event_type.includes('chat');
          }
        });

        heatmapData.push({
          module,
          day,
          value: moduleEvents.length,
        });
      });
    });

    return heatmapData;
  };

  const counts = getEventCounts();
  const workflowsByDay = getWorkflowsByDay();
  const successRate = getSuccessRate();
  const avgLatency = getAvgLatency();
  const artifactsByType = getArtifactsByType();
  const conversationsByRole = getConversationsByRole();
  const activeUsers = getActiveUsers();
  const moduleHeatmap = getModuleHeatmap();

  const COLORS = {
    primary: 'hsl(var(--primary))',
    blue: 'hsl(var(--agent-blue))',
    green: 'hsl(var(--agent-green))',
    purple: 'hsl(var(--agent-purple))',
    orange: 'hsl(var(--agent-orange))',
  };

  const PIE_COLORS = [COLORS.blue, COLORS.green, COLORS.purple, COLORS.orange];

  const stats = [
    {
      title: 'Workflows Exécutés',
      value: workflowsByDay.reduce(
        (sum, day) =>
          sum +
          day['Feature Discovery'] +
          day['Roadmap Planning'] +
          day['Sprint Planning'] +
          day['Tech Spec'],
        0
      ),
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'text-primary',
    },
    {
      title: 'Success Rate',
      value: `${successRate[successRate.length - 1]?.rate || 0}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-agent-green',
    },
    {
      title: 'Latence Moyenne',
      value: `${avgLatency}s`,
      icon: <Target className="w-4 h-4" />,
      color: avgLatency > 6 ? 'text-destructive' : 'text-agent-blue',
    },
    {
      title: 'Utilisateurs Actifs (MAU)',
      value: activeUsers.MAU,
      icon: <Users className="w-4 h-4" />,
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
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Analytics Basiques</h2>
        <p className="text-muted-foreground">Monitoring usage et performance plateforme</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows Executed */}
        <Card>
          <CardHeader>
            <CardTitle>Workflows Exécutés</CardTitle>
            <CardDescription>Nombre d'exécutions par type (7 derniers jours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workflowsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="Feature Discovery" stackId="a" fill={COLORS.blue} />
                <Bar dataKey="Roadmap Planning" stackId="a" fill={COLORS.green} />
                <Bar dataKey="Sprint Planning" stackId="a" fill={COLORS.purple} />
                <Bar dataKey="Tech Spec" stackId="a" fill={COLORS.orange} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
            <CardDescription>% workflows terminés vs abandonnés</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={successRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={COLORS.green}
                  strokeWidth={2}
                  dot={{ fill: COLORS.green }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Latency Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>Latence Moyenne IA</CardTitle>
            <CardDescription>Latence moyenne génération (target: 6s)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={avgLatency > 6 ? 'hsl(var(--destructive))' : COLORS.blue}
                  strokeWidth="20"
                  strokeDasharray={`${(Math.min(avgLatency, 12) / 12) * 502} 502`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="36"
                  fontWeight="bold"
                  fill="hsl(var(--foreground))"
                >
                  {avgLatency}s
                </text>
              </svg>
            </div>
            <Badge variant={avgLatency > 6 ? 'destructive' : 'secondary'} className="mt-4">
              {avgLatency > 6 ? 'Au-dessus de la cible' : 'Dans la cible'}
            </Badge>
          </CardContent>
        </Card>

        {/* Artifacts Created */}
        <Card>
          <CardHeader>
            <CardTitle>Artefacts Créés</CardTitle>
            <CardDescription>Nombre d'artefacts par type (7 derniers jours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={artifactsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="epic" stackId="a" fill={COLORS.blue} name="Epic" />
                <Bar dataKey="story" stackId="a" fill={COLORS.green} name="Story" />
                <Bar dataKey="canvas" stackId="a" fill={COLORS.purple} name="Canvas" />
                <Bar
                  dataKey="impact_analysis"
                  stackId="a"
                  fill={COLORS.orange}
                  name="Impact Analysis"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Conversations & Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations Nova Agent</CardTitle>
            <CardDescription>Répartition par rôle utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conversationsByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conversationsByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Actifs</CardTitle>
            <CardDescription>DAU / WAU / MAU</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[300px] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers.DAU}</p>
                </div>
                <Activity className="w-8 h-8 text-agent-blue" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weekly Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers.WAU}</p>
                </div>
                <Activity className="w-8 h-8 text-agent-green" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers.MAU}</p>
                </div>
                <Activity className="w-8 h-8 text-agent-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Module Heatmap</CardTitle>
          <CardDescription>Usage par module (Core / Workflows / Agent)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            <div className="col-span-1"></div>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {['Core', 'Workflows', 'Agent'].map((module) => (
              <React.Fragment key={module}>
                <div className="text-sm font-medium text-muted-foreground flex items-center">
                  {module}
                </div>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => {
                  const cell = moduleHeatmap.find((h) => h.module === module && h.day === day);
                  const value = cell?.value || 0;
                  const intensity = Math.min(value / 10, 1);

                  return (
                    <div
                      key={`${module}-${day}`}
                      className="aspect-square rounded border flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: `hsl(var(--primary) / ${intensity * 0.8})`,
                        color: intensity > 0.5 ? 'white' : 'hsl(var(--foreground))',
                      }}
                      title={`${module} - ${day}: ${value} activités`}
                    >
                      {value > 0 ? value : ''}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Moins</span>
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded border"
                style={{
                  backgroundColor: `hsl(var(--primary) / ${intensity * 0.8})`,
                }}
              />
            ))}
            <span className="text-xs text-muted-foreground">Plus</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
