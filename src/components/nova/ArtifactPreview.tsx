import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Layers, Target, TestTube, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtifactPreviewProps {
  artifact: {
    id: string;
    title: string;
    artifact_type: string;
    content: any;
    created_at: string;
  };
  onView?: () => void;
  className?: string;
}

export const ArtifactPreview: React.FC<ArtifactPreviewProps> = ({ 
  artifact, 
  onView,
  className 
}) => {
  const getIcon = () => {
    switch (artifact.artifact_type) {
      case 'user_story': return <FileText className="h-4 w-4" />;
      case 'epic': return <Layers className="h-4 w-4" />;
      case 'canvas': return <Target className="h-4 w-4" />;
      case 'test_case': return <TestTube className="h-4 w-4" />;
      case 'roadmap': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (artifact.artifact_type) {
      case 'user_story': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'epic': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'canvas': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'test_case': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      case 'roadmap': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getContentPreview = () => {
    const content = artifact.content;
    
    if (artifact.artifact_type === 'user_story' && content.userStory) {
      return `En tant que ${content.userStory.userType}, je veux ${content.userStory.action}`;
    }
    
    if (artifact.artifact_type === 'epic' && content.description) {
      return content.description.substring(0, 100) + '...';
    }
    
    if (artifact.artifact_type === 'test_case' && content.testCases) {
      return `${content.testCases.length} test cases définis`;
    }
    
    return 'Voir les détails...';
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn("p-2 rounded-md", getTypeColor())}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                {artifact.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {new Date(artifact.created_at).toLocaleDateString('fr-FR')}
              </CardDescription>
            </div>
          </div>
          {onView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onView}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {getContentPreview()}
        </p>
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            {artifact.artifact_type.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
