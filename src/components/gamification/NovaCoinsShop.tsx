import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Shield, Zap, Sparkles } from 'lucide-react';

interface NovaCoinsShopProps {
  coins: number;
}

export const NovaCoinsShop = ({ coins }: NovaCoinsShopProps) => {
  const shopItems = [
    {
      id: 'streak-freeze',
      name: 'Streak Freeze',
      description: 'Skip a day without breaking your streak',
      cost: 50,
      icon: Shield,
      color: 'text-blue-500'
    },
    {
      id: 'xp-boost',
      name: '2x XP Boost',
      description: '24h of double XP',
      cost: 150,
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      id: 'mystery-box',
      name: 'Mystery Box',
      description: 'Random rewards',
      cost: 100,
      icon: Sparkles,
      color: 'text-purple-500'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Nova Shop</h2>
        <div className="flex items-center gap-1 text-lg font-bold text-amber-500">
          <Star className="w-5 h-5" />
          {coins}
        </div>
      </div>

      <div className="space-y-3">
        {shopItems.map((item) => {
          const Icon = item.icon;
          const canAfford = coins >= item.cost;

          return (
            <div
              key={item.id}
              className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="sm"
                disabled={!canAfford}
                variant={canAfford ? "default" : "secondary"}
              >
                <Star className="w-4 h-4 mr-2" />
                {item.cost} coins
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Gagnez des coins en complétant des missions quotidiennes
        </p>
      </div>
    </Card>
  );
};
