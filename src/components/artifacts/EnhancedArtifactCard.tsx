import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Artifact } from '@/types';
import { 
  Copy, Download, Trash2, Eye, MoreVertical, 
  Users, Workflow, Clock, Star, FileText,
  ArrowRight, Share2, FolderPlus, Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EnhancedArtifactCardProps {
  artifact: Artifact & {
    squad_name?: string;
    product_context_name?: string;
    workflow_source?: string;
    status?: 'draft' | 'validated' | 'obsolete';
    is_key?: boolean;
    usage_count?: number;
  };
  onDelete: (id: string) => void;
  onTransform?: (artifact: Artifact, targetType: string) => void;
  onAddToProject?: (artifact: Artifact) => void;
  onContinueWith?: (artifact: Artifact) => void;
  icon: React.ReactNode;
}

export const EnhancedArtifactCard: React.FC<EnhancedArtifactCardProps> = ({ 
  artifact, 
  onDelete, 
  onTransform,
  onAddToProject,
  onContinueWith,
  icon 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatArtifactContent = (content: any, type: string): string => {
    if (!content) return 'No content available';

    switch (type) {
      case 'canvas':
        return Object.entries(content)
          .map(([key, value]) => {
            const title = key.replace(/_/g, ' ').toUpperCase();
            if (Array.isArray(value)) {
              return `${title}:\n${value.map((item: any) => `  • ${typeof item === 'object' ? JSON.stringify(item) : item}`).join('\n')}`;
            }
            return `${title}:\n${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`;
          })
          .join('\n\n');

      case 'story':
        return `TITLE: ${content.title || 'Untitled'}\n\n` +
          `AS A: ${content.as_a || 'N/A'}\n` +
          `I WANT: ${content.i_want || 'N/A'}\n` +
          `SO THAT: ${content.so_that || 'N/A'}\n\n` +
          `ACCEPTANCE CRITERIA:\n${Array.isArray(content.acceptance_criteria) 
            ? content.acceptance_criteria.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') 
            : content.acceptance_criteria || 'None'}`;

      case 'epic':
        return `EPIC: ${content.title || 'Untitled'}\n\n` +
          `DESCRIPTION:\n${content.description || 'No description'}\n\n` +
          `USER STORIES:\n${Array.isArray(content.user_stories) 
            ? content.user_stories.map((s: any, i: number) => `${i + 1}. ${typeof s === 'object' ? s.title : s}`).join('\n') 
            : 'None'}`;

      default:
        return JSON.stringify(content, null, 2);
    }
  };

  const handleCopy = () => {
    const content = formatArtifactContent(artifact.content, artifact.artifact_type);
    navigator.clipboard.writeText(content);
    toast({ title: 'Copié', description: 'Contenu copié dans le presse-papiers' });
  };

  const handleDownload = () => {
    const content = formatArtifactContent(artifact.content, artifact.artifact_type);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Téléchargé', description: 'Artefact téléchargé avec succès' });
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      canvas: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      story: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      epic: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      impact_analysis: 'bg-green-500/20 text-green-700 border-green-500/30',
      tech_spec: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
    };
    const labels: Record<string, string> = {
      canvas: 'Canvas',
      story: 'User Story',
      epic: 'Epic',
      impact_analysis: 'Analyse',
      tech_spec: 'Spéc Tech',
    };
    return (
      <Badge variant="outline" className={cn("text-xs", styles[type] || '')}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      draft: 'bg-amber-500/20 text-amber-700',
      validated: 'bg-green-500/20 text-green-700',
      obsolete: 'bg-muted text-muted-foreground line-through',
    };
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      validated: 'Validé',
      obsolete: 'Obsolète',
    };
    return (
      <Badge variant="outline" className={cn("text-[10px]", styles[status])}>
        {labels[status]}
      </Badge>
    );
  };

  const getTransformOptions = (type: string) => {
    const options: Record<string, { label: string; target: string }[]> = {
      canvas: [
        { label: 'Générer des Epics', target: 'epic' },
        { label: 'Créer des User Stories', target: 'story' },
      ],
      epic: [
        { label: 'Découper en Stories', target: 'story' },
        { label: 'Créer une Spéc Tech', target: 'tech_spec' },
      ],
      story: [
        { label: 'Analyser l\'impact', target: 'impact_analysis' },
      ],
    };
    return options[type] || [];
  };

  return (
    <>
      <Card className={cn(
        "hover:shadow-md transition-all group relative",
        artifact.is_key && "ring-2 ring-primary/30 bg-primary/5"
      )}>
        {/* Key indicator */}
        {artifact.is_key && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">
              <Star className="w-3 h-3 mr-1" />
              Clé
            </Badge>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-md bg-muted shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium line-clamp-1">
                  {artifact.title}
                </CardTitle>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(artifact.created_at), { addSuffix: true, locale: fr })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {getTypeBadge(artifact.artifact_type)}
              {getStatusBadge(artifact.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Context line */}
          {(artifact.squad_name || artifact.product_context_name || artifact.workflow_source) && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
              {artifact.squad_name && (
                <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                  <Users className="w-3 h-3" />
                  {artifact.squad_name}
                </span>
              )}
              {artifact.product_context_name && (
                <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                  <FileText className="w-3 h-3" />
                  {artifact.product_context_name}
                </span>
              )}
              {artifact.workflow_source && (
                <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                  <Workflow className="w-3 h-3" />
                  {artifact.workflow_source}
                </span>
              )}
            </div>
          )}

          {/* Usage signal */}
          {artifact.usage_count && artifact.usage_count > 0 && (
            <div className="text-[10px] text-muted-foreground">
              Utilisé dans {artifact.usage_count} décision{artifact.usage_count > 1 ? 's' : ''}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="w-3 h-3 mr-1.5" />
              Voir
            </Button>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCopy}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleDownload}>
                <Download className="w-3.5 h-3.5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {getTransformOptions(artifact.artifact_type).map((option) => (
                    <DropdownMenuItem 
                      key={option.target}
                      onClick={() => onTransform?.(artifact, option.target)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                  {getTransformOptions(artifact.artifact_type).length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={() => onAddToProject?.(artifact)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Ajouter à un projet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onContinueWith?.(artifact)}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continuer avec un agent
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(artifact.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog with Next Actions */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}
              <span>{artifact.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2">
              {getTypeBadge(artifact.artifact_type)}
              {getStatusBadge(artifact.status)}
              {artifact.squad_name && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {artifact.squad_name}
                </Badge>
              )}
              {artifact.product_context_name && (
                <Badge variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {artifact.product_context_name}
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                {formatArtifactContent(artifact.content, artifact.artifact_type)}
              </pre>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <div className="flex items-center gap-2 flex-1">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
            
            {/* Transform actions */}
            {getTransformOptions(artifact.artifact_type).length > 0 && (
              <div className="flex items-center gap-2">
                {getTransformOptions(artifact.artifact_type).map((option) => (
                  <Button 
                    key={option.target}
                    size="sm"
                    onClick={() => {
                      onTransform?.(artifact, option.target);
                      setShowDetails(false);
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
