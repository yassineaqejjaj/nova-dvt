import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Zap, Star } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import type { DailyMission } from '@/hooks/useGamification';

interface DailyMissionsCardProps {
  missions: DailyMission[];
}

export const DailyMissionsCard = ({ missions }: DailyMissionsCardProps) => {
  const { user } = useAuth();
  const { completeMission } = useGamification(user?.id);

  const completedCount = missions.filter(m => m.completed).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Missions Quotidiennes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} / {missions.length} complétées
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Reset dans</p>
          <p className="text-sm font-medium">{getTimeUntilMidnight()}</p>
        </div>
      </div>

      <div className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`p-4 rounded-lg border transition-all ${
              mission.completed 
                ? 'bg-muted/50 border-muted' 
                : 'bg-card border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {mission.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium ${mission.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {mission.title}
                  </h3>
                  <Badge className={getDifficultyColor(mission.difficulty)} variant="secondary">
                    {mission.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mission.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <Zap className="w-3 h-3" />
                    {mission.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3" />
                    {mission.coinsReward} coins
                  </span>
                </div>
              </div>

              {!mission.completed && (
                <Button 
                  size="sm" 
                  onClick={() => completeMission(mission.id)}
                  className="flex-shrink-0"
                >
                  Compléter
                </Button>
              )}
            </div>
          </div>
        ))}

        {missions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune mission disponible pour aujourd'hui</p>
            <p className="text-sm mt-2">Revenez demain pour de nouvelles missions!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const getTimeUntilMidnight = (): string => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};
