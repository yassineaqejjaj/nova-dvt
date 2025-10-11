import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import type { MysteryBox } from '@/hooks/useGamification';

interface MysteryBoxCardProps {
  boxes: MysteryBox[];
}

export const MysteryBoxCard = ({ boxes }: MysteryBoxCardProps) => {
  const { user } = useAuth();
  const { openMysteryBox } = useGamification(user?.id);

  if (boxes.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Gift className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucune Mystery Box disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complétez des missions pour en débloquer!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Gift className="w-6 h-6 text-primary" />
        Mystery Boxes
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {boxes.map((box) => (
          <div
            key={box.id}
            className="relative p-6 rounded-lg border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/80 transition-all group"
          >
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Gift className="w-16 h-16 text-primary animate-bounce" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
              </div>

              <h3 className="font-bold text-lg mb-2 capitalize">{box.boxType} Box</h3>
              
              {box.expiresAt && (
                <p className="text-xs text-muted-foreground mb-4">
                  Expire dans {getTimeRemaining(box.expiresAt)}
                </p>
              )}

              <Button 
                className="w-full"
                onClick={() => openMysteryBox(box.id)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ouvrir
              </Button>
            </div>

            {/* Animated glow */}
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
        ))}
      </div>
    </Card>
  );
};

const getTimeRemaining = (expiresAt: string): string => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};
