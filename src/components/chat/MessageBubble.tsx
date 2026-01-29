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

// Modern, subtle role colors
const ROLE_COLORS: Record<AgentRole, { accent: string; bg: string }> = {
  ux: { accent: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10' },
  product: { accent: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  data: { accent: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  tech: { accent: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
  business: { accent: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  strategy: { accent: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
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

  // Main agent message - modern card style
  return (
    <div className="flex gap-3 group">
      <Avatar className={cn(
        "w-9 h-9 ring-2 ring-offset-2 ring-offset-background flex-shrink-0",
        isLeadResponse ? "ring-primary" : "ring-muted"
      )}>
        <AvatarImage src={agent.avatar} />
        <AvatarFallback className="text-xs font-medium">
          {agent.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 max-w-[85%]">
        {/* Header: Name + Role */}
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-sm font-semibold", colors.accent)}>
            {agent.name}
          </span>
          <RoleBadge specialty={agent.specialty} size="sm" />
          {isLeadResponse && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              Lead
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {/* Content */}
        <div className={cn(
          "rounded-2xl rounded-tl-md p-3.5",
          colors.bg
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
