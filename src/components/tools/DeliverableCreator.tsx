import React, { useState } from 'react';
import { 
  FileText, 
  GitBranch, 
  Target, 
  Users, 
  Calendar, 
  MessageSquare,
  Lightbulb,
  BarChart3,
  Route,
  ClipboardList,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ToolContext = 'discovery' | 'delivery' | 'postSprint' | 'all';

interface Tool {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  contexts: ToolContext[];
}

const TOOLS: Tool[] = [
  // Discovery & Strategy
  {
    id: 'canvas',
    label: 'Canvas Generator',
    description: 'Clarifier un problème et ses hypothèses.',
    icon: Lightbulb,
    contexts: ['discovery', 'all']
  },
  {
    id: 'user-research',
    label: 'Recherche Utilisateur',
    description: 'Structurer des retours et insights terrain.',
    icon: Users,
    contexts: ['discovery', 'all']
  },
  // Specs & Planning
  {
    id: 'prd',
    label: 'PRD',
    description: 'Transformer une idée en document produit clair.',
    icon: FileText,
    contexts: ['discovery', 'delivery', 'all']
  },
  {
    id: 'doc-roadmap',
    label: 'Doc → Roadmap',
    description: 'Passer d\'un document à une vision planifiée.',
    icon: Route,
    contexts: ['discovery', 'delivery', 'all']
  },
  {
    id: 'epic-stories',
    label: 'Epic → Stories',
    description: 'Découper une vision en tâches actionnables.',
    icon: Target,
    contexts: ['delivery', 'all']
  },
  {
    id: 'git-specs',
    label: 'Git → Specs',
    description: 'Générer des specs à partir du code.',
    icon: GitBranch,
    contexts: ['delivery', 'all']
  },
  // Team & Docs
  {
    id: 'raci',
    label: 'RACI',
    description: 'Clarifier qui fait quoi.',
    icon: ClipboardList,
    contexts: ['delivery', 'all']
  },
  {
    id: 'estimation',
    label: 'Estimation',
    description: 'Évaluer l\'effort avant de planifier.',
    icon: BarChart3,
    contexts: ['delivery', 'all']
  },
  {
    id: 'release-notes',
    label: 'Release Notes',
    description: 'Résumer ce qui a changé.',
    icon: Calendar,
    contexts: ['postSprint', 'all']
  },
  {
    id: 'meeting-notes',
    label: 'CR Réunion',
    description: 'Garder une trace claire des décisions.',
    icon: MessageSquare,
    contexts: ['postSprint', 'all']
  }
];

interface DeliverableCreatorProps {
  open: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  context?: ToolContext;
}

export const DeliverableCreator: React.FC<DeliverableCreatorProps> = ({
  open,
  onClose,
  onSelectTool,
  context = 'all'
}) => {
  const filteredTools = context === 'all' 
    ? TOOLS 
    : TOOLS.filter(tool => tool.contexts.includes(context) || tool.contexts.includes('all'));

  // Group tools by category
  const discoveryTools = filteredTools.filter(t => 
    ['canvas', 'user-research'].includes(t.id)
  );
  const specsTools = filteredTools.filter(t => 
    ['prd', 'doc-roadmap', 'epic-stories', 'git-specs'].includes(t.id)
  );
  const teamTools = filteredTools.filter(t => 
    ['raci', 'estimation', 'release-notes', 'meeting-notes'].includes(t.id)
  );

  const renderToolGroup = (title: string, tools: Tool[]) => {
    if (tools.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          {title}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                className={cn(
                  "flex flex-col items-start gap-1.5 p-3 rounded-lg border border-border/50",
                  "hover:bg-muted/50 hover:border-primary/30 transition-all text-left",
                  "group"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium">{tool.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Créer un livrable
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {renderToolGroup('Discovery & Strategy', discoveryTools)}
          {renderToolGroup('Specs & Planning', specsTools)}
          {renderToolGroup('Team & Docs', teamTools)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Compact button to trigger the dialog
interface DeliverableCreatorButtonProps {
  onClick: () => void;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export const DeliverableCreatorButton: React.FC<DeliverableCreatorButtonProps> = ({
  onClick,
  variant = 'default',
  className
}) => {
  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className={cn("gap-1.5", className)}
      >
        <FileText className="w-3.5 h-3.5" />
        Livrable
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors",
          className
        )}
      >
        <FileText className="w-3.5 h-3.5" />
        Créer un livrable
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <FileText className="w-4 h-4" />
      Créer un livrable
    </Button>
  );
};
