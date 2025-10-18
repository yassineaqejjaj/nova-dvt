import React, { useEffect, useState } from 'react';
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
import { useInsights } from '@/hooks/useInsights';
import { usePinnedItems } from '@/hooks/usePinnedItems';
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
  const { insights, dismissInsight, generateInsights } = useInsights(user.id);
  const { pinnedItems, unpinItem } = usePinnedItems(user.id);

  useEffect(() => {
    // Generate insights on mount
    generateInsights();
  }, []);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 18) return '👋';
    return '🌙';
  };

  // Rotating features for Instant PRD
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const instantPRDFeatures = [
    {
      icon: '👥',
      title: '3 AI-Generated Personas',
      description: 'Complete with demographics, pain points, and motivations'
    },
    {
      icon: '📝',
      title: '12 Detailed User Stories',
      description: 'Structured with acceptance criteria and priority levels'
    },
    {
      icon: '🎨',
      title: 'Interactive Wireframes',
      description: 'Visual mockups generated from your description'
    },
    {
      icon: '🏗️',
      title: 'Technical Architecture',
      description: 'Complete tech stack recommendations and system design'
    },
    {
      icon: '📊',
      title: 'Success Metrics & KPIs',
      description: 'Measurable goals aligned with business objectives'
    },
    {
      icon: '🚀',
      title: 'Go-to-Market Strategy',
      description: 'Launch plan with phasing and rollout recommendations'
    }
  ];

  useEffect(() => {
    // Rotate features every 4 seconds
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % instantPRDFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold gradient-text animate-fade-in">
          {getGreeting()}, {user.name}! {getGreetingEmoji()}
        </h1>
          <p className="text-muted-foreground text-lg">
            Prêt à collaborer avec votre squad d’IA ? Voici votre aperçu de progression.
          </p>
        
        {/* Quick Stats Bar */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-agent-orange" />
            <span className="font-semibold">Level {user.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold">{user.xp.toLocaleString()} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">{user.coins.toLocaleString()} Coins</span>
          </div>
        </div>
      </div>

      {/* Instant PRD CTA - Hero Feature with Rotating Highlights */}
      <Card className="relative overflow-hidden border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <CardContent className="relative pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">Instant Product Requirements Document</h3>
                  <Badge variant="default" className="animate-pulse">
                    ✨ NOUVEAU
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Transformez une simple phrase en PRD complet avec personas, user stories, wireframes et plus en <span className="font-bold text-primary">15 secondes</span>
                </p>
                
                {/* Rotating Feature Highlight */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {instantPRDFeatures[currentFeatureIndex].icon}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-primary">
                        {instantPRDFeatures[currentFeatureIndex].title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {instantPRDFeatures[currentFeatureIndex].description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Indicator Dots */}
                <div className="flex gap-1.5 pt-1">
                  {instantPRDFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeatureIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentFeatureIndex 
                          ? 'w-6 bg-primary' 
                          : 'w-1.5 bg-primary/30 hover:bg-primary/50'
                      }`}
                      aria-label={`View feature ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <Button 
                size="lg" 
                className="group relative overflow-hidden px-8"
                onClick={() => onNavigate('instant-prd')}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Essayer maintenant
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <p className="text-xs text-center text-muted-foreground font-medium">
                2 semaines → 15 secondes ⚡
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level, XP & Coins */}
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-agent-orange" />
              <span>Progression & Récompenses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold">Niveau {user.level}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user.xp} XP
                  </Badge>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span>{user.coins}</span>
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progression vers le niveau {user.level + 1}</span>
                  <span>{xpToNextLevel} XP restants</span>
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
                <span className="text-sm text-muted-foreground">sur {allAgents.length}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate('agents')}
                className="w-full text-xs"
              >
                Voir la galerie
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
              <span>Squads actives</span>
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
                {squads.length > 0 ? 'Gérer les squads' : 'Créer une squad'}
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
              <span>Série quotidienne</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold">{user.streak}</span>
                <span className="text-sm text-muted-foreground">jours</span>
                <span className="text-lg">🔥</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Continuez à collaborer pour maintenir votre série !
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
            Insights instantanés
          </h2>
          <InsightsPanel insights={insights} onDismiss={dismissInsight} />
        </div>
      )}

      {/* Dynamic Stats Panel */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Votre univers Squad
        </h2>
        <DynamicStatsPanel userId={user.id} />
      </div>

      {/* Quick Deck */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          Raccourcis
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
            <span>Actions rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              onClick={() => onNavigate('squads')} 
              className="flex items-center space-x-2 h-12"
            >
              <Users className="w-4 h-4" />
              <span>Créer une nouvelle squad</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('agents')}
              className="flex items-center space-x-2 h-12"
            >
              <Star className="w-4 h-4" />
              <span>Débloquer de nouveaux agents</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('chat')}
              disabled={squads.length === 0}
              className="flex items-center space-x-2 h-12"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Démarrer le chat</span>
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
              <span>Activité récente</span>
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
              <span>Succès</span>
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