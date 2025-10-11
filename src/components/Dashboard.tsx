import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile, Squad, TabType } from '@/types';
import { allAgents } from '@/data/mockData';
import { 
  Trophy, 
  Zap, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Star,
  Target,
  Calendar,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSessionMemory } from '@/hooks/useSessionMemory';
import { useInsights } from '@/hooks/useInsights';
import { usePinnedItems } from '@/hooks/usePinnedItems';
import { ContinueFlow } from './ContinueFlow';
import { InsightsPanel } from './InsightsPanel';
import { QuickDeck } from './QuickDeck';
import { DynamicStatsPanel } from './DynamicStatsPanel';

interface DashboardProps {
  user: UserProfile;
  squads: Squad[];
  onNavigate: (tab: TabType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  squads,
  onNavigate
}) => {
  const { session, updateSession } = useSessionMemory(user.id);
  const { insights, dismissInsight, generateInsights } = useInsights(user.id);
  const { pinnedItems, unpinItem } = usePinnedItems(user.id);

  useEffect(() => {
    // Generate insights on mount
    generateInsights();
  }, []);

  const handleContinueFlow = (tab: TabType, squadId?: string) => {
    onNavigate(tab as any);
  };

  const handlePinnedItemClick = (item: any) => {
    switch (item.itemType) {
      case 'squad':
        onNavigate('squads' as any);
        break;
      case 'agent':
        onNavigate('agents' as any);
        break;
      case 'artifact':
        onNavigate('artifacts' as any);
        break;
      default:
        onNavigate('dashboard' as any);
    }
  };
  const progressToNextLevel = ((user.xp % 200) / 200) * 100;
  const nextLevelXP = Math.ceil(user.xp / 200) * 200;
  const xpToNextLevel = nextLevelXP - user.xp;
  
  const unlockedAgentsCount = allAgents.filter(agent => 
    user.unlockedAgents.includes(agent.id) || user.xp >= agent.xpRequired
  ).length;

  const recentActivities = [
    { action: 'Created squad "Product Launch Team"', time: '2 hours ago', icon: Users },
    { action: 'Unlocked Sarah Chen (Product Strategy)', time: '1 day ago', icon: Star },
    { action: 'Completed 5 conversations streak', time: '2 days ago', icon: MessageCircle },
    { action: 'Reached Level 5', time: '3 days ago', icon: Trophy }
  ];

  return (
    <div className="space-y-6">
      {/* Continue Flow Card */}
      {session && (
        <ContinueFlow
          session={session}
          userName={user.name}
          onContinue={handleContinueFlow}
        />
      )}

      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to collaborate with your AI squad? Here's your progress overview.
        </p>
      </div>

      {/* Instant PRD CTA - Hero Feature */}
      <Card className="relative overflow-hidden border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <CardContent className="relative pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">Instant PRD</h3>
                  <Badge variant="default" className="animate-pulse">
                    ✨ NEW
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Transformez une simple phrase en PRD complet avec personas, user stories, wireframes et plus en <span className="font-bold text-primary">15 secondes</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">📝 12 User Stories</Badge>
                  <Badge variant="secondary" className="text-xs">👥 3 Personas + Images</Badge>
                  <Badge variant="secondary" className="text-xs">🎨 Wireframes</Badge>
                  <Badge variant="secondary" className="text-xs">🏗️ Architecture</Badge>
                  <Badge variant="secondary" className="text-xs">📊 KPIs</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="group relative overflow-hidden"
                onClick={() => window.location.href = '/instant-prd'}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Essayer Maintenant
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                2 semaines → 15 secondes ⚡
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level & XP */}
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-agent-orange" />
              <span>Level & Experience</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold">Level {user.level}</span>
                <Badge variant="secondary" className="text-xs">
                  {user.xp} XP
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to Level {user.level + 1}</span>
                  <span>{xpToNextLevel} XP needed</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unlocked Agents */}
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="w-4 h-4 text-agent-blue" />
              <span>Unlocked Agents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold">{unlockedAgentsCount}</span>
                <span className="text-sm text-muted-foreground">of {allAgents.length}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate('agents')}
                className="w-full text-xs"
              >
                Browse Gallery
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Squads */}
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Target className="w-4 h-4 text-agent-green" />
              <span>Active Squads</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold">{squads.length}</span>
                <span className="text-sm text-muted-foreground">squads</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate('squads')}
                className="w-full text-xs"
              >
                {squads.length > 0 ? 'Manage Squads' : 'Create Squad'}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Daily Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold">{user.streak}</span>
                <span className="text-sm text-muted-foreground">days</span>
                <span className="text-lg">🔥</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep collaborating to maintain your streak!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Panel */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Instant Insights
          </h2>
          <InsightsPanel insights={insights} onDismiss={dismissInsight} />
        </div>
      )}

      {/* Dynamic Stats Panel */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Your Squad Universe
        </h2>
        <DynamicStatsPanel userId={user.id} />
      </div>

      {/* Quick Deck */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          Quick Deck
        </h2>
        <QuickDeck
          pinnedItems={pinnedItems}
          onUnpin={unpinItem}
          onItemClick={handlePinnedItemClick}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              onClick={() => onNavigate('squads')} 
              className="flex items-center space-x-2 h-12"
            >
              <Users className="w-4 h-4" />
              <span>Create New Squad</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('agents')}
              className="flex items-center space-x-2 h-12"
            >
              <Star className="w-4 h-4" />
              <span>Unlock New Agents</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('chat')}
              disabled={squads.length === 0}
              className="flex items-center space-x-2 h-12"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start Chatting</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-agent-green" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-agent-orange" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.badges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Unlocked
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};