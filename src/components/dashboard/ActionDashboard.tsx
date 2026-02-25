import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { UserProfile, Squad, TabType } from '@/types';
import { ImpactFeed } from '@/components/impact-analysis/ImpactFeed';
import { 
  Play, 
  MessageCircle, 
  Sparkles, 
  Users, 
  Bot,
  Lightbulb,
  Target,
  Calendar,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
  HelpCircle,
  Rocket,
  ChevronRight,
  Scan
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
  topic?: string;
  lastActivity?: string;
  output?: string;
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
  const [isFirstTimeUser] = useState(() => user.xp < 100);

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
          topic: 'Refonte parcours checkout',
          lastActivity: 'il y a 2h',
          output: 'User stories générées',
          tabTarget: 'chat',
          squadId: session.lastSquadId
        },
        'workflows': {
          type: 'process',
          title: 'Discovery en cours',
          subtitle: session.lastWorkflowType || 'Processus guidé',
          topic: 'Nouvelle fonctionnalité paiement',
          lastActivity: 'hier',
          output: 'Problem framing',
          progress: 75,
          tabTarget: 'workflows'
        },
        'artifacts': {
          type: 'artifact',
          title: 'PRD en cours',
          subtitle: 'Dernier artefact',
          topic: 'Système de notifications',
          lastActivity: 'il y a 3h',
          output: 'Document produit',
          tabTarget: 'artifacts'
        }
      };
      setRecentWork(workTypeMap[session.lastTab] || null);
    }
  }, [session, squads]);

  // Work cards with role hints and clear outputs
  const workCards = [
    {
      id: 'understand',
      title: 'Comprendre un besoin',
      subtitle: 'Transformer un feedback brut en problème clair',
      roles: ['PM', 'Design'],
      output: 'Problem framing, hypothèses',
      time: '~30 min',
      icon: Lightbulb,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      action: () => onNavigate('workflows')
    },
    {
      id: 'structure',
      title: 'Structurer une feature',
      subtitle: 'D\'une idée vers des stories prêtes à développer',
      roles: ['PM', 'Engineering'],
      output: 'Epics, stories, critères',
      time: '~45 min',
      icon: Target,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      action: () => onNavigate('instant-prd')
    },
    {
      id: 'plan',
      title: 'Planifier',
      subtitle: 'Aligner scope, timing et contraintes',
      roles: ['PM', 'Tech lead'],
      output: 'Roadmap ou sprint plan',
      time: '~40 min',
      icon: Calendar,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      action: () => onNavigate('document-roadmap')
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        
        {/* 1. Header with clear value proposition */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Transformez vos idées, feedbacks et contextes en décisions produit avec votre squad IA.
          </p>
        </header>

        {/* 2. First-time user guided entry */}
        {isFirstTimeUser && (
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/15">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Nouveau sur Nova ?</p>
                <p className="text-xs text-muted-foreground">
                  Découvrez comment travailler avec vos agents IA en 2 min
                </p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5">
                Commencer le guide
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 3. Main CTAs - Primary + Secondary */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button 
            size="lg" 
            className="w-full sm:w-auto h-12 px-6 text-base font-medium shadow-md hover:shadow-lg transition-all"
            onClick={() => onNavigate('chat')}
          >
            <Play className="w-4 h-4 mr-2" />
            Démarrer une session
          </Button>
          {isFirstTimeUser && (
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto h-12 px-6"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Voir comment ça marche
            </Button>
          )}
        </div>
        
        {/* CTA context */}
        <p className="text-xs text-muted-foreground text-center sm:text-left -mt-2">
          Discussion avec agents · Débat structuré · Parcours guidé
        </p>

        <Separator className="my-4" />

        {/* 4. Resume section with rich context */}
        {recentWork && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reprendre là où vous en étiez
            </h2>
            <Card className="border border-border hover:border-primary/40 transition-colors cursor-pointer group" onClick={() => onNavigate(recentWork.tabTarget)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    {recentWork.type === 'chat' && <MessageCircle className="w-4 h-4 text-primary" />}
                    {recentWork.type === 'process' && <Sparkles className="w-4 h-4 text-primary" />}
                    {recentWork.type === 'artifact' && <FileText className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{recentWork.title}</p>
                      <Badge variant="outline" className="text-xs h-5">
                        {recentWork.subtitle}
                      </Badge>
                    </div>
                    <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                      {recentWork.topic && (
                        <p><span className="font-medium text-foreground/70">Sujet :</span> {recentWork.topic}</p>
                      )}
                      <div className="flex items-center gap-3">
                        {recentWork.lastActivity && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recentWork.lastActivity}
                          </span>
                        )}
                        {recentWork.output && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {recentWork.output}
                          </span>
                        )}
                      </div>
                    </div>
                    {recentWork.progress && (
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={recentWork.progress} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium text-primary">{recentWork.progress}%</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Reprendre
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 5. Launch work cards with roles and outputs */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lancer un travail
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={card.id}
                  className="group cursor-pointer border-border/60 hover:border-border hover:shadow-sm transition-all"
                  onClick={card.action}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className={`p-2 w-fit rounded-lg ${card.bgColor}`}>
                      <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground/60">Pour :</span>
                        {card.roles.map((role, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] h-4 px-1.5">
                            {role}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <Target className="w-2.5 h-2.5" />
                          {card.output}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {card.time}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Impact Feed summary */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Impacts récents
            </h2>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onNavigate('impact-analysis' as TabType)}>
              <Scan className="w-3 h-3 mr-1" />
              Tout voir
            </Button>
          </div>
          <ImpactFeed compact onNavigateToRun={() => onNavigate('impact-analysis' as TabType)} />
        </section>

        {/* 6. Quick actions - minimal weight */}
        <section className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Actions rapides</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate('squads')}
            >
              <Users className="w-3 h-3 mr-1" />
              Créer une squad
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate('agents')}
            >
              <Bot className="w-3 h-3 mr-1" />
              Gérer agents
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate('reality-mode')}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Mode réalité
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};
