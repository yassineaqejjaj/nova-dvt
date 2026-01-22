import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserProfile, Squad, TabType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  MessageCircle, 
  Sparkles, 
  Users, 
  Bot,
  Lightbulb,
  Target,
  Calendar,
  Trophy,
  Zap,
  Star,
  ArrowRight,
  Clock
} from 'lucide-react';

interface ActionDashboardProps {
  user: UserProfile;
  squads: Squad[];
  onNavigate: (tab: TabType) => void;
  session?: {
    lastWorkflowType?: string;
    lastSquadId?: string;
    lastTab?: TabType;
    sessionData?: any;
  } | null;
}

interface RecentWork {
  type: 'chat' | 'process' | 'artifact';
  title: string;
  subtitle?: string;
  progress?: number;
  tabTarget: TabType;
  squadId?: string;
}

export const ActionDashboard: React.FC<ActionDashboardProps> = ({
  user,
  squads,
  onNavigate,
  session
}) => {
  const [recentWork, setRecentWork] = useState<RecentWork | null>(null);
  const [recentActivities, setRecentActivities] = useState<Array<{
    action: string;
    time: string;
  }>>([]);

  // Determine greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Load recent work from session
  useEffect(() => {
    if (session?.lastTab) {
      const workTypeMap: Record<string, RecentWork> = {
        'chat': {
          type: 'chat',
          title: 'Discussion avec la squad',
          subtitle: squads.find(s => s.id === session.lastSquadId)?.name || 'Squad active',
          tabTarget: 'chat',
          squadId: session.lastSquadId
        },
        'workflows': {
          type: 'process',
          title: 'Discovery en cours',
          subtitle: session.lastWorkflowType || 'Processus guidé',
          progress: 75,
          tabTarget: 'workflows'
        },
        'artifacts': {
          type: 'artifact',
          title: 'PRD en cours',
          subtitle: 'Dernier artefact',
          tabTarget: 'artifacts'
        }
      };
      setRecentWork(workTypeMap[session.lastTab] || null);
    }
  }, [session, squads]);

  // Load recent activities
  useEffect(() => {
    const loadActivities = async () => {
      // Static activities for now - could be loaded from DB
      setRecentActivities([
        { action: `Squad « ${squads[0]?.name || 'Équipe'} » créée`, time: 'il y a 2 heures' },
        { action: 'Agent Sarah Chen débloqué', time: 'hier' },
        { action: `Niveau ${user.level} atteint`, time: 'il y a 3 jours' }
      ]);
    };
    loadActivities();
  }, [user, squads]);

  // Calculate XP progress
  const xpToNextLevel = (Math.ceil(user.xp / 200) * 200) - user.xp;
  const progressToNextLevel = ((user.xp % 200) / 200) * 100;

  // Work starter cards
  const workCards = [
    {
      id: 'understand',
      title: 'Comprendre un besoin',
      subtitle: 'Clarifier une idée, un problème ou un retour terrain.',
      time: 'Environ 30 min',
      icon: Lightbulb,
      action: () => onNavigate('workflows')
    },
    {
      id: 'structure',
      title: 'Structurer une feature',
      subtitle: 'Passer d\'une idée à des user stories claires.',
      time: 'Environ 45 min',
      icon: Target,
      action: () => onNavigate('instant-prd')
    },
    {
      id: 'plan',
      title: 'Planifier',
      subtitle: 'Organiser un sprint ou une roadmap.',
      time: 'Environ 40–60 min',
      icon: Calendar,
      action: () => onNavigate('document-roadmap')
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      
      {/* 1. Functional Header - Compact */}
      <header className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">
          {getGreeting()}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          Prêt à travailler avec votre squad IA.
        </p>
        
        {/* Compact stats line */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-muted-foreground">Niveau {user.level}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{user.xp.toLocaleString()} XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-muted-foreground">{user.coins.toLocaleString()} coins</span>
          </div>
        </div>
      </header>

      {/* 2. Main CTA - Single dominant action */}
      <div className="text-center space-y-3">
        <Button 
          size="lg" 
          className="h-14 px-8 text-lg font-medium shadow-lg"
          onClick={() => onNavigate('chat')}
        >
          <Play className="w-5 h-5 mr-2" />
          Démarrer une session de travail
        </Button>
        <p className="text-sm text-muted-foreground">
          Chat multi-agents, mode réalité ou process guidé.
        </p>
      </div>

      {/* 3. Resume Work - Single card, Nova decides */}
      {recentWork && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Reprendre
          </h2>
          <Card className="border border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {recentWork.type === 'chat' && <MessageCircle className="w-5 h-5 text-primary" />}
                    {recentWork.type === 'process' && <Sparkles className="w-5 h-5 text-primary" />}
                    {recentWork.type === 'artifact' && <Target className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium">{recentWork.title}</p>
                    <p className="text-sm text-muted-foreground">{recentWork.subtitle}</p>
                    {recentWork.progress && (
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={recentWork.progress} className="h-1.5 w-24" />
                        <span className="text-xs text-muted-foreground">{recentWork.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate(recentWork.tabTarget)}
                >
                  Reprendre
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 4. Launch Work - 3 intention-based cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Lancer un travail
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.id}
                className="group cursor-pointer border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                onClick={card.action}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="p-2 w-fit rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{card.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{card.time}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. Secondary Management Actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('squads')}
          >
            <Users className="w-4 h-4 mr-2" />
            Créer une squad
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('agents')}
          >
            <Bot className="w-4 h-4 mr-2" />
            Gérer les agents
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('chat')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Démarrer un chat libre
          </Button>
        </div>
      </section>

      {/* 6. Recent Activity - Minimal, 3 items max */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Activité récente
          </h2>
          <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0">
            Voir toute l'activité
          </Button>
        </div>
        <div className="space-y-2">
          {recentActivities.slice(0, 3).map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">{activity.action}</span>
              <span className="text-xs text-muted-foreground/70">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Progression - Subtle, never dominant */}
      <section className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Progression</span>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Encore {xpToNextLevel} XP pour le niveau suivant.
            </p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">
              Série en cours : {user.streak} jour{user.streak !== 1 ? 's' : ''}
            </span>
            {user.streak === 0 && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Continuez à travailler pour la relancer.
              </p>
            )}
          </div>
        </div>
        <Progress value={progressToNextLevel} className="h-1.5 mt-3" />
      </section>

    </div>
  );
};
