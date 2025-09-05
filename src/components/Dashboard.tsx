import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile, Squad } from '@/types';
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
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  squads: Squad[];
  onNavigate: (tab: 'agents' | 'squads' | 'chat') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  squads,
  onNavigate
}) => {
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
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to collaborate with your AI squad? Here's your progress overview.
        </p>
      </div>

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