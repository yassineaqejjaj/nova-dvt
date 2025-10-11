import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import type { Badge as BadgeType } from '@/hooks/useGamification';

interface BadgeCollectionProps {
  badges: BadgeType[];
}

export const BadgeCollection = ({ badges }: BadgeCollectionProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/10 text-gray-500';
      case 'rare': return 'bg-blue-500/10 text-blue-500';
      case 'epic': return 'bg-purple-500/10 text-purple-500';
      case 'legendary': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Collection de Badges
        </h2>
        <Badge variant="secondary">{badges.length} débloqués</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="group relative aspect-square rounded-lg border bg-card p-3 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-2">{badge.badgeIcon}</div>
              <p className="text-xs font-medium line-clamp-2">{badge.badgeName}</p>
              <Badge className={`${getRarityColor(badge.rarity)} mt-2`} variant="secondary">
                {badge.rarity}
              </Badge>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              <p className="font-medium text-sm mb-1">{badge.badgeName}</p>
              <p className="text-xs text-muted-foreground mb-2">{badge.badgeDescription}</p>
              <p className="text-xs text-muted-foreground">
                Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ))}

        {badges.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun badge débloqué</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complétez des missions pour gagner des badges!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
