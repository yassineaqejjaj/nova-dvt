import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Shield, TrendingUp } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
}

export const StreakTracker = ({ currentStreak, longestStreak, freezesAvailable }: StreakTrackerProps) => {
  const { user } = useAuth();
  const { buyStreakFreeze } = useGamification(user?.id);

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = new Date().getDay();

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <Flame className="w-8 h-8 text-primary" />
          <h2 className="text-4xl font-bold text-primary">{currentStreak}</h2>
          <Flame className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Jours de suite</p>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => {
          const isActive = index < today;
          const isToday = index === today - 1;
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="text-xs font-medium">{day}</span>
              {isActive && <Flame className="w-3 h-3 mt-1" />}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Record personnel
          </span>
          <span className="font-medium">{longestStreak} jours</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Streak Freezes
          </span>
          <span className="font-medium">{freezesAvailable} disponibles</span>
        </div>
      </div>

      {/* Buy Freeze */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={buyStreakFreeze}
      >
        <Shield className="w-4 h-4 mr-2" />
        Acheter Streak Freeze (50 coins)
      </Button>

      {/* Milestones */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-xs font-medium mb-3">Prochains paliers</p>
        <div className="space-y-2 text-xs">
          {getNextMilestones(currentStreak).map((milestone, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-muted-foreground">{milestone.days} jours</span>
              <span className="font-medium">{milestone.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const getNextMilestones = (currentStreak: number) => {
  const milestones = [
    { days: 7, reward: 'Badge "Dedicated"' },
    { days: 14, reward: '+10% XP boost' },
    { days: 30, reward: 'Mystery Box' },
    { days: 60, reward: 'AI Pro Mode' },
    { days: 100, reward: 'Badge "Centurion"' },
    { days: 365, reward: 'Badge "Legend"' }
  ];

  return milestones.filter(m => m.days > currentStreak).slice(0, 3);
};
