import React from 'react';
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
  Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tool {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  example?: string;
}

interface ToolCategory {
  id: string;
  title: string;
  tools: Tool[];
}

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'discovery',
    title: 'Discovery & Strategy',
    tools: [
      {
        id: 'user-research',
        label: 'Recherche Utilisateur',
        description: 'Structurer des retours et insights terrain.',
        icon: Users,
        example: 'Synthétiser des interviews utilisateurs'
      },
      {
        id: 'canvas',
        label: 'Canvas Generator',
        description: 'Clarifier un problème et ses hypothèses.',
        icon: Lightbulb,
        example: 'Business Model Canvas, Lean Canvas'
      }
    ]
  },
  {
    id: 'specs',
    title: 'Specs & Planning',
    tools: [
      {
        id: 'prd',
        label: 'PRD',
        description: 'Transformer une idée en document produit clair.',
        icon: FileText,
        example: 'Générer un PRD complet en 5 min'
      },
      {
        id: 'doc-roadmap',
        label: 'Doc → Roadmap',
        description: 'Passer d\'un document à une vision planifiée.',
        icon: Route,
        example: 'Convertir un brief en roadmap visuelle'
      },
      {
        id: 'epic-stories',
        label: 'Epic → Stories',
        description: 'Découper une vision en tâches actionnables.',
        icon: Target,
        example: 'Générer des user stories INVEST'
      },
      {
        id: 'git-specs',
        label: 'Git → Specs',
        description: 'Générer des specs à partir du code.',
        icon: GitBranch,
        example: 'Documenter un repo automatiquement'
      }
    ]
  },
  {
    id: 'team',
    title: 'Team & Docs',
    tools: [
      {
        id: 'raci',
        label: 'RACI',
        description: 'Clarifier qui fait quoi.',
        icon: ClipboardList,
        example: 'Matrice de responsabilités projet'
      },
      {
        id: 'estimation',
        label: 'Estimation',
        description: 'Évaluer l\'effort avant de planifier.',
        icon: BarChart3,
        example: 'Chiffrage en story points'
      },
      {
        id: 'release-notes',
        label: 'Release Notes',
        description: 'Résumer ce qui a changé.',
        icon: Calendar,
        example: 'Notes de version automatiques'
      },
      {
        id: 'meeting-notes',
        label: 'CR Réunion',
        description: 'Garder une trace claire des décisions.',
        icon: MessageSquare,
        example: 'Compte-rendu structuré avec actions'
      }
    ]
  }
];

interface ToolboxProps {
  onSelectTool: (toolId: string) => void;
  className?: string;
}

export const Toolbox: React.FC<ToolboxProps> = ({ onSelectTool, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wrench className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Outils de production</h2>
          <p className="text-sm text-muted-foreground">
            Accédez directement aux outils pour créer des livrables.
          </p>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="space-y-6">
        {TOOL_CATEGORIES.map(category => (
          <div key={category.id} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {category.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.tools.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border border-border/50",
                      "hover:bg-muted/30 hover:border-primary/30 transition-all text-left",
                      "group"
                    )}
                  >
                    <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-medium text-sm">{tool.label}</div>
                      <p className="text-xs text-muted-foreground">
                        {tool.description}
                      </p>
                      {tool.example && (
                        <p className="text-xs text-muted-foreground/60 italic">
                          Ex: {tool.example}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
