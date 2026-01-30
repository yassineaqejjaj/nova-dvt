import type { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RoleBadge, inferRoleFromSpecialty } from './RoleBadge';
import { StructuredMessage } from './StructuredMessage';
import { Agent, AgentRole, ResponseMode } from '@/types';
import { ThumbsUp, ThumbsDown, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
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
  responseMode?: ResponseMode;
}

// Bold, distinctive role colors with prominent borders
const ROLE_COLORS: Record<AgentRole, { 
  accent: string; 
  bg: string; 
  border: string; 
  ring: string;
  avatarRing: string;
}> = {
  ux: { 
    accent: 'text-pink-600 dark:text-pink-400', 
    bg: 'bg-pink-50 dark:bg-pink-950/40', 
    border: 'border-l-4 border-l-pink-500',
    ring: 'ring-pink-500/30',
    avatarRing: 'ring-pink-500',
  },
  product: { 
    accent: 'text-blue-600 dark:text-blue-400', 
    bg: 'bg-blue-50 dark:bg-blue-950/40', 
    border: 'border-l-4 border-l-blue-500',
    ring: 'ring-blue-500/30',
    avatarRing: 'ring-blue-500',
  },
  data: { 
    accent: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/40', 
    border: 'border-l-4 border-l-emerald-500',
    ring: 'ring-emerald-500/30',
    avatarRing: 'ring-emerald-500',
  },
  tech: { 
    accent: 'text-orange-600 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-950/40', 
    border: 'border-l-4 border-l-orange-500',
    ring: 'ring-orange-500/30',
    avatarRing: 'ring-orange-500',
  },
  business: { 
    accent: 'text-purple-600 dark:text-purple-400', 
    bg: 'bg-purple-50 dark:bg-purple-950/40', 
    border: 'border-l-4 border-l-purple-500',
    ring: 'ring-purple-500/30',
    avatarRing: 'ring-purple-500',
  },
  strategy: { 
    accent: 'text-amber-600 dark:text-amber-400', 
    bg: 'bg-amber-50 dark:bg-amber-950/40', 
    border: 'border-l-4 border-l-amber-500',
    ring: 'ring-amber-500/30',
    avatarRing: 'ring-amber-500',
  },
};

const REACTION_CONFIG = {
  agree: { icon: ThumbsUp, label: 'Accord', className: 'text-emerald-600 bg-emerald-500/10' },
  disagree: { icon: ThumbsDown, label: 'Nuance', className: 'text-red-500 bg-red-500/10' },
  risk: { icon: AlertTriangle, label: 'Risque', className: 'text-amber-600 bg-amber-500/10' },
  idea: { icon: Lightbulb, label: 'Idée', className: 'text-blue-600 bg-blue-500/10' },
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
  responseMode = 'structured',
}) => {
  const isUser = sender === 'user';
  const agent = sender as Agent;

  // User message - right aligned, primary color
  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group">
        <div className="flex flex-col items-end max-w-[75%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }

  const role = agent.role || inferRoleFromSpecialty(agent.specialty);
  const colors = role ? ROLE_COLORS[role] : ROLE_COLORS.product;

  // Conductor/Nova message - centered, distinct style
  if (isConductor) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted/60 backdrop-blur-sm border border-dashed border-border rounded-xl px-4 py-3 max-w-[85%]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Nova • Recentrage</span>
          </div>
          <StructuredMessage content={content} isCollapsible={false} responseMode={responseMode} />
        </div>
      </div>
    );
  }

  // Micro-reaction - compact inline style
  if (isReaction && reactionType) {
    const config = REACTION_CONFIG[reactionType];
    const Icon = config.icon;
    
    return (
      <div className="flex items-center gap-2 ml-12 py-1">
        <Avatar className="w-5 h-5">
          <AvatarImage src={agent.avatar} />
          <AvatarFallback className="text-[9px]">
            {agent.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1",
          config.className
        )}>
          <Icon className="w-3 h-3" />
          <span className="text-xs font-medium">{agent.name.split(' ')[0]}</span>
          <span className="text-xs opacity-80">·</span>
          <span className="text-xs">{content}</span>
        </div>
      </div>
    );
  }

  // Main agent message - distinctive card style with prominent colored borders
  return (
    <div className={cn(
      "flex gap-3 group rounded-lg p-2 -ml-2 transition-colors",
      isLeadResponse && colors.ring
    )}>
      {/* Avatar with role-colored ring */}
      <Avatar className={cn(
        "w-10 h-10 ring-2 ring-offset-2 ring-offset-background flex-shrink-0 shadow-sm",
        colors.avatarRing
      )}>
        <AvatarImage src={agent.avatar} />
        <AvatarFallback className={cn(
          "text-xs font-semibold",
          colors.bg,
          colors.accent
        )}>
          {agent.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 max-w-[85%]">
        {/* Header: Name + Role */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={cn("text-sm font-bold", colors.accent)}>
            {agent.name}
          </span>
          <RoleBadge specialty={agent.specialty} size="sm" />
          {isLeadResponse && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
              Lead
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {/* Content with prominent left border */}
        <div className={cn(
          "rounded-xl rounded-tl-sm p-3.5 shadow-sm",
          colors.bg,
          colors.border
        )}>
          <StructuredMessage 
            content={content} 
            isCollapsible={content.length > 200}
            responseMode={responseMode}
          />
        </div>
      </div>
    </div>
  );
};
