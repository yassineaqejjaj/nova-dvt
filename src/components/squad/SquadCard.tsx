import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Squad } from '@/types';
import { 
  Users, 
  MessageCircle, 
  Calendar,
  Trash2,
  Edit,
  CheckCircle,
  Zap,
  Clock
} from 'lucide-react';

interface SquadCardProps {
  squad: Squad;
  isActive: boolean;
  onSetActive: () => void;
  onManage: () => void;
  onChat: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SquadCard: React.FC<SquadCardProps> = ({
  squad,
  isActive,
  onSetActive,
  onManage,
  onChat,
  onEdit,
  onDelete,
}) => {
  // Calculate last activity based on creation date
  const getLastActivity = () => {
    const created = new Date(squad.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
  };

  if (isActive) {
    // Active squad gets premium treatment - larger, more prominent
    return (
      <Card className="relative transition-all border-2 border-primary bg-primary/5 shadow-lg col-span-full lg:col-span-2">
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground font-semibold">
            <Zap className="w-3 h-3 mr-1" />
            Squad active dans Nova
          </Badge>
        </div>
        
        <CardHeader className="pb-3 pt-12">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-foreground">{squad.name}</h3>
              {squad.purpose ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {squad.purpose}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">
                  Ajoutez une description pour clarifier le rôle de cette squad
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Agents preview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {squad.agents && squad.agents.length > 0 ? (
                  <div className="flex -space-x-2">
                    {squad.agents.slice(0, 5).map((agent) => (
                      <Avatar key={agent.id} className="w-10 h-10 border-2 border-background ring-2 ring-primary/20">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback className="text-xs bg-primary/10">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {squad.agents.length > 5 && (
                      <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium">+{squad.agents.length - 5}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Aucun agent</span>
                )}
                <span className="text-sm text-muted-foreground">
                  {squad.agents?.length || 0} agent{(squad.agents?.length || 0) > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{getLastActivity()}</span>
              </div>
            </div>
            
            <Separator />
            
            {/* Actions - primary action is prominent */}
            <div className="flex gap-3">
              <Button
                onClick={onChat}
                disabled={!squad.agents || squad.agents.length === 0}
                className="flex-1 font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Démarrer une session
              </Button>
              <Button variant="outline" size="sm" onClick={onManage}>
                Gérer les agents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inactive squad - more compact
  return (
    <Card className="relative transition-all hover:shadow-md hover:border-primary/50 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{squad.name}</h3>
            {squad.purpose && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {squad.purpose}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 w-7 p-0">
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Metadata row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{squad.agents?.length || 0} agents</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{getLastActivity()}</span>
            </div>
          </div>
          
          {/* Agent avatars */}
          {squad.agents && squad.agents.length > 0 && (
            <div className="flex -space-x-2">
              {squad.agents.slice(0, 4).map((agent) => (
                <Avatar key={agent.id} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={agent.avatar} />
                  <AvatarFallback className="text-xs">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {squad.agents.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{squad.agents.length - 4}</span>
                </div>
              )}
            </div>
          )}
          
          <Separator />
          
          {/* Actions - hierarchical */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onChat}
              disabled={!squad.agents || squad.agents.length === 0}
              className="flex-1"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Button>
            <Button variant="ghost" size="sm" onClick={onManage} className="text-muted-foreground">
              Gérer
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSetActive}
              className="text-muted-foreground"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Activer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
