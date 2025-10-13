import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, Search, Filter, Sparkles, Award, Share2 } from 'lucide-react';
import type { Badge as BadgeType } from '@/hooks/useGamification';
import { 
  badgeDefinitions, 
  categoryLabels, 
  categoryIcons, 
  type BadgeCategory,
  type BadgeRarity 
} from '@/data/badgeDefinitions';

interface BadgeCollectionProps {
  badges: BadgeType[];
}

export const BadgeCollection = ({ badges }: BadgeCollectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all');

  const handleShareOnLinkedIn = (badgeDef: typeof badgeDefinitions[0], earnedDate: string) => {
    const appUrl = window.location.origin;
    const badgeUrl = `${appUrl}/#badge-${badgeDef.id}`;
    const text = `I just earned the "${badgeDef.name}" badge! ${badgeDef.description}`;
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(badgeUrl)}&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  // Map earned badges by ID for quick lookup
  const earnedBadgesMap = useMemo(() => {
    const map = new Map<string, BadgeType>();
    badges.forEach(badge => {
      map.set(badge.badgeId, badge);
    });
    return map;
  }, [badges]);

  // Filter badges
  const filteredBadges = useMemo(() => {
    return badgeDefinitions.filter(badge => {
      const matchesSearch = searchTerm === '' || 
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
      const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;

      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [searchTerm, selectedCategory, selectedRarity]);

  // Calculate stats
  const totalBadges = badgeDefinitions.length;
  const earnedCount = badges.length;
  const completionRate = Math.round((earnedCount / totalBadges) * 100);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'rare': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'epic': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'legendary': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-lg shadow-amber-500/20 animate-pulse';
      case 'epic': return 'shadow-lg shadow-purple-500/20';
      case 'rare': return 'shadow-md shadow-blue-500/10';
      default: return '';
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Badge Collection
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base">
              {earnedCount}/{totalBadges}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {completionRate}% Complete
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as BadgeCategory | 'all')}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="gap-1">
              <Filter className="w-3 h-3" />
              All
            </TabsTrigger>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="gap-1 whitespace-nowrap">
                <span>{categoryIcons[key as BadgeCategory]}</span>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Rarity Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedRarity === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRarity('all')}
          >
            All Rarities
          </Button>
          {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
            <Button
              key={rarity}
              variant={selectedRarity === rarity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRarity(rarity)}
              className={selectedRarity === rarity ? getRarityColor(rarity) : ''}
            >
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredBadges.map((badgeDef) => {
          const earnedBadge = earnedBadgesMap.get(badgeDef.id);
          const isEarned = !!earnedBadge;

          return (
            <div
              key={badgeDef.id}
              className={`
                group relative aspect-square rounded-lg border p-3 transition-all duration-300 cursor-pointer
                ${isEarned 
                  ? `bg-card hover:border-primary/50 hover:scale-105 ${getRarityGlow(badgeDef.rarity)}` 
                  : 'bg-muted/30 border-dashed grayscale opacity-60 hover:opacity-80'
                }
              `}
            >
              {/* Lock Overlay for Unearned */}
              {!isEarned && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              {/* Badge Content */}
              <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                <div className={`text-4xl mb-2 transition-transform duration-300 ${isEarned ? 'group-hover:scale-110' : ''}`}>
                  {badgeDef.icon}
                </div>
                <p className="text-xs font-medium line-clamp-2 mb-1">{badgeDef.name}</p>
                <Badge 
                  className={`${getRarityColor(badgeDef.rarity)} text-xs`} 
                  variant="secondary"
                >
                  {badgeDef.rarity}
                </Badge>

                {/* Sparkles for legendary */}
                {isEarned && badgeDef.rarity === 'legendary' && (
                  <Sparkles className="absolute top-1 right-1 w-3 h-3 text-amber-500 animate-pulse" />
                )}

                {/* Share Button for Earned Badges */}
                {isEarned && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareOnLinkedIn(badgeDef, earnedBadge.unlockedAt);
                    }}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{badgeDef.name}</p>
                  {isEarned && <Award className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{badgeDef.description}</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Requirement:</span> {badgeDef.requirement}
                  </p>
                  {badgeDef.xpReward && (
                    <p className="text-xs text-primary">
                      <span className="font-medium">Reward:</span> {badgeDef.xpReward} XP
                      {badgeDef.coinsReward && ` + ${badgeDef.coinsReward} Coins`}
                    </p>
                  )}
                  {isEarned && earnedBadge && (
                    <p className="text-xs text-muted-foreground pt-1 border-t">
                      Unlocked: {new Date(earnedBadge.unlockedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No badges found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-muted-foreground text-center">
          🔒 Locked badges can be unlocked by completing their requirements
        </p>
      </div>
    </Card>
  );
};
