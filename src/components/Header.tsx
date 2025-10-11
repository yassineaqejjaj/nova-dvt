import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/types';
import { Trophy, Zap, User, Star } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenProfile }) => {
  const progressToNextLevel = ((user.xp % 200) / 200) * 100;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <img src="/lovable-uploads/devoteam-logo.png" alt="Devoteam" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">NextGEN AI Agents</h1>
            <p className="text-xs text-muted-foreground">Powered by Devoteam</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Stats Display */}
          <div className="hidden sm:flex items-center space-x-3 bg-muted/50 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-agent-orange" />
              <span className="text-sm font-medium">Level {user.level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{user.xp} XP</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-agent-orange" />
              <span className="text-sm font-medium">{user.coins}</span>
            </div>
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all duration-300"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>

          {/* Streak Badge */}
          <Badge variant="secondary" className="hidden sm:flex items-center space-x-1">
            <span>🔥</span>
            <span>{user.streak} day streak</span>
          </Badge>

          {/* User Profile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenProfile}
            className="flex items-center space-x-2 hover:bg-muted/50"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar_url || ''} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
};