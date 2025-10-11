import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, Zap, Flame, Star, Gift, Target } from 'lucide-react';
import { DailyMissionsCard } from './DailyMissionsCard';
import { StreakTracker } from './StreakTracker';
import { BadgeCollection } from './BadgeCollection';
import { NovaCoinsShop } from './NovaCoinsShop';
import { MysteryBoxCard } from './MysteryBoxCard';

export const GamificationDashboard = () => {
  const { user } = useAuth();
  const { stats, missions, badges, mysteryBoxes, loading } = useGamification(user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune donnée de gamification disponible</p>
      </div>
    );
  }

  const xpForNextLevel = getXpForLevel(stats.level + 1);
  const xpForCurrentLevel = getXpForLevel(stats.level);
  const xpProgress = ((stats.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-primary" />
              Product Mastery Journey
            </h1>
            <p className="text-muted-foreground mt-1">Niveau {stats.level} • {stats.xp.toLocaleString()} XP Total</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <Flame className="w-6 h-6" />
                {stats.currentStreak}
              </div>
              <p className="text-xs text-muted-foreground">Jours</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-2xl font-bold text-amber-500">
                <Star className="w-6 h-6" />
                {stats.coins}
              </div>
              <p className="text-xs text-muted-foreground">Coins</p>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Niveau {stats.level}</span>
            <span className="text-muted-foreground">
              {stats.xp - xpForCurrentLevel} / {xpForNextLevel - xpForCurrentLevel} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            Prochain niveau: {xpForNextLevel - stats.xp} XP restants
          </p>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{missions.filter(m => m.completed).length}/{missions.length}</p>
              <p className="text-sm text-muted-foreground">Missions Today</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-secondary/10">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{badges.length}</p>
              <p className="text-sm text-muted-foreground">Badges Unlocked</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Gift className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mysteryBoxes.length}</p>
              <p className="text-sm text-muted-foreground">Mystery Boxes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DailyMissionsCard missions={missions} />
          <MysteryBoxCard boxes={mysteryBoxes} />
        </div>

        <div className="space-y-6">
          <StreakTracker 
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            freezesAvailable={stats.streakFreezesAvailable}
          />
          <NovaCoinsShop coins={stats.coins} />
        </div>
      </div>

      {/* Badges */}
      <BadgeCollection badges={badges} />
    </div>
  );
};

const getXpForLevel = (level: number): number => {
  const levels = [0, 200, 500, 1000, 1500, 3000, 5000, 6000, 10000, 15000, 20000, 30000, 40000, 60000, 80000, 100000, 150000];
  return levels[level - 1] || 0;
};
