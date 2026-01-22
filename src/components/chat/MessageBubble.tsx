import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormattedText } from '@/components/ui/formatted-text';
import { RoleBadge, inferRoleFromSpecialty } from './RoleBadge';
import { StanceLine } from './StanceLine';
import { Agent, AgentRole } from '@/types';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, AlertTriangle, Lightbulb } from 'lucide-react';

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

const ROLE_BUBBLE_STYLES: Record<AgentRole, string> = {
  ux: 'border-l-4 border-l-pink-400 bg-pink-50/50 dark:bg-pink-950/20',
  product: 'border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20',
  data: 'border-l-4 border-l-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
  tech: 'border-l-4 border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/20',
  business: 'border-l-4 border-l-purple-400 bg-purple-50/50 dark:bg-purple-950/20',
  strategy: 'border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
};

const REACTION_ICONS = {
  agree: { icon: ThumbsUp, className: 'text-green-600' },
  disagree: { icon: ThumbsDown, className: 'text-red-600' },
  risk: { icon: AlertTriangle, className: 'text-amber-600' },
  idea: { icon: Lightbulb, className: 'text-blue-600' },
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  stance,
  isReaction = false,
  reactionType,
  isLeadResponse = false,
  isConductor = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUser = sender === 'user';
  const agent = sender as Agent;

  // Truncate long messages in short mode
  const shouldTruncate = !isUser && content.length > 300 && !isExpanded;
  const displayContent = shouldTruncate ? content.slice(0, 280) + '...' : content;

  if (isUser) {
    return (
      <div className="flex space-x-3 justify-end">
        <div className="max-w-[80%] rounded-lg p-3 bg-primary text-primary-foreground ml-12">
          <FormattedText content={content} className="text-sm" />
          <span className="text-xs opacity-70 mt-1 block">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <Avatar className="w-8 h-8">
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  const role = agent.role || inferRoleFromSpecialty(agent.specialty);
  const bubbleStyle = role ? ROLE_BUBBLE_STYLES[role] : 'bg-muted';
  const ReactionIcon = reactionType ? REACTION_ICONS[reactionType] : null;

  // Conductor has a special style
  if (isConductor) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted/80 border border-dashed border-muted-foreground/30 rounded-lg px-4 py-2 max-w-[90%]">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-background">
              🎯 Conducteur
            </Badge>
          </div>
          <FormattedText content={content} className="text-sm text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Micro-reactions are compact
  if (isReaction && ReactionIcon) {
    return (
      <div className="flex items-start space-x-2 ml-12 py-1">
        <Avatar className="w-6 h-6">
          <AvatarImage src={agent.avatar} />
          <AvatarFallback className="text-xs">
            {agent.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
          <ReactionIcon.icon className={`w-4 h-4 ${ReactionIcon.className}`} />
          <span className="text-xs font-medium">{agent.name}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <FormattedText content={content} className="text-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-3 justify-start">
      <Avatar className={isLeadResponse ? "w-10 h-10 ring-2 ring-primary/50" : "w-10 h-10"}>
        <AvatarImage src={agent.avatar} />
        <AvatarFallback>
          {agent.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[80%] rounded-lg p-3 ${bubbleStyle}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">{agent.name}</span>
          <RoleBadge role={role} specialty={agent.specialty} />
          {isLeadResponse && (
            <Badge variant="default" className="text-xs px-1.5 py-0 bg-primary/80">
              Lead
            </Badge>
          )}
        </div>
        
        <StanceLine stance={stance} role={role} specialty={agent.specialty} />
        
        <FormattedText content={displayContent} className="text-sm" />
        
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>Réduire <ChevronUp className="w-3 h-3 ml-1" /></>
            ) : (
              <>Voir plus <ChevronDown className="w-3 h-3 ml-1" /></>
            )}
          </Button>
        )}
        
        <span className="text-xs opacity-70 mt-1 block">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
