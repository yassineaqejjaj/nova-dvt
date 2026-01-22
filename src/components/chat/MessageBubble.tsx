import { useState, type FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleBadge, inferRoleFromSpecialty } from './RoleBadge';
import { StanceLine } from './StanceLine';
import { StructuredMessage } from './StructuredMessage';
import { Agent, AgentRole } from '@/types';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  id: string;
  content: string;
  sender: 'user' | Agent;
  timestamp: Date;
  stance?: string;
  isReaction?: boolean;
  reactionType?: 'agree' | 'disagree' | 'risk' | 'idea';
  isLeadResponse?: boolean;
  isConductor?: boolean;
}

// Role-based accent colors for visual identity
const ROLE_ACCENT_COLORS: Record<AgentRole, {
  ring: string;
  bar: string;
  bg: string;
  subtitle: string;
}> = {
  ux: {
    ring: 'ring-pink-400 dark:ring-pink-500',
    bar: 'border-l-pink-400',
    bg: 'bg-pink-50/50 dark:bg-pink-950/20',
    subtitle: 'Optimise clarté et flow',
  },
  product: {
    ring: 'ring-blue-400 dark:ring-blue-500',
    bar: 'border-l-blue-400',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    subtitle: 'Équilibre vision et réalité',
  },
  data: {
    ring: 'ring-emerald-400 dark:ring-emerald-500',
    bar: 'border-l-emerald-400',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    subtitle: 'Mesure et valide l\'impact',
  },
  tech: {
    ring: 'ring-orange-400 dark:ring-orange-500',
    bar: 'border-l-orange-400',
    bg: 'bg-orange-50/50 dark:bg-orange-950/20',
    subtitle: 'Alerte sur les risques tech',
  },
  business: {
    ring: 'ring-purple-400 dark:ring-purple-500',
    bar: 'border-l-purple-400',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    subtitle: 'Protège la cohérence business',
  },
  strategy: {
    ring: 'ring-amber-400 dark:ring-amber-500',
    bar: 'border-l-amber-400',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    subtitle: 'Garde le cap stratégique',
  },
};

const REACTION_ICONS = {
  agree: { icon: ThumbsUp, className: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  disagree: { icon: ThumbsDown, className: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  risk: { icon: AlertTriangle, className: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  idea: { icon: Lightbulb, className: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
};

export const MessageBubble: FC<MessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  stance,
  isReaction = false,
  reactionType,
  isLeadResponse = false,
  isConductor = false,
}) => {
  const isUser = sender === 'user';
  const agent = sender as Agent;

  if (isUser) {
    return (
      <div className="flex space-x-3 justify-end mb-4">
        <div className="max-w-[80%] rounded-lg p-3 bg-primary text-primary-foreground ml-12">
          <p className="text-sm leading-relaxed">{content}</p>
          <span className="text-xs opacity-50 mt-2 block">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <Avatar className="w-8 h-8">
          <AvatarFallback>Moi</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  const role = agent.role || inferRoleFromSpecialty(agent.specialty);
  const accentColors = role ? ROLE_ACCENT_COLORS[role] : ROLE_ACCENT_COLORS.product;
  const ReactionIcon = reactionType ? REACTION_ICONS[reactionType] : null;

  // Conductor has a special style
  if (isConductor) {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-muted/80 border border-dashed border-muted-foreground/30 rounded-lg px-4 py-3 max-w-[85%]">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs bg-background">
              🎯 Recentrage
            </Badge>
          </div>
          <StructuredMessage content={content} isCollapsible={false} />
        </div>
      </div>
    );
  }

  // Micro-reactions are compact
  if (isReaction && ReactionIcon) {
    return (
      <div className="flex items-start space-x-2 ml-12 py-1.5 mb-2">
        <Avatar className={cn("w-6 h-6 ring-1", accentColors.ring)}>
          <AvatarImage src={agent.avatar} />
          <AvatarFallback className="text-xs">
            {agent.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5",
          ReactionIcon.bg
        )}>
          <ReactionIcon.icon className={cn("w-3.5 h-3.5", ReactionIcon.className)} />
          <span className="text-xs font-medium">{agent.name}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs">{content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-3 justify-start mb-5">
      <Avatar className={cn(
        "w-10 h-10 ring-2 ring-offset-2 ring-offset-background",
        accentColors.ring,
        isLeadResponse && "ring-[3px]"
      )}>
        <AvatarImage src={agent.avatar} />
        <AvatarFallback>
          {agent.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "max-w-[80%] rounded-lg p-3.5 border-l-4",
        accentColors.bar,
        accentColors.bg
      )}>
        {/* Agent identity header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{agent.name}</span>
              <RoleBadge role={role} specialty={agent.specialty} />
              {isLeadResponse && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary/80">
                  Lead
                </Badge>
              )}
            </div>
            {/* Role subtitle - personality signal */}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {accentColors.subtitle}
            </p>
          </div>
        </div>
        
        {/* Stance line */}
        <StanceLine stance={stance} role={role} specialty={agent.specialty} />
        
        {/* Structured message content */}
        <div className="mt-2">
          <StructuredMessage 
            content={content} 
            isCollapsible={content.length > 300}
            maxPreviewLines={5}
          />
        </div>
        
        {/* Timestamp - lower contrast */}
        <span className="text-[10px] text-muted-foreground/60 mt-2.5 block">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
