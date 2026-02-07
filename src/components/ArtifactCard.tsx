import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Artifact } from '@/types';
import { Copy, Download, Trash2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ArtifactCardProps {
  artifact: Artifact;
  onDelete: (id: string) => void;
  icon: React.ReactNode;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onDelete, icon }) => {
  const [showDetails, setShowDetails] = useState(false);

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
            : content.acceptance_criteria || 'None'}\n\n` +
          `TECHNICAL NOTES:\n${content.technical_notes || 'None'}`;

      case 'epic':
        return `EPIC: ${content.title || 'Untitled'}\n\n` +
          `DESCRIPTION:\n${content.description || 'No description'}\n\n` +
          `GOALS:\n${Array.isArray(content.goals) 
            ? content.goals.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n') 
            : content.goals || 'None'}\n\n` +
          `USER STORIES:\n${Array.isArray(content.user_stories) 
            ? content.user_stories.map((s: any, i: number) => `${i + 1}. ${typeof s === 'object' ? s.title || JSON.stringify(s) : s}`).join('\n') 
            : content.user_stories || 'None'}`;

      case 'impact_analysis':
        return `IMPACT ANALYSIS\n\n` +
          `EFFORT: ${content.effort || 'N/A'}\n` +
          `IMPACT: ${content.impact || 'N/A'}\n` +
          `PRIORITY: ${content.priority || 'N/A'}\n\n` +
          `ANALYSIS:\n${content.analysis || 'No analysis available'}\n\n` +
          `RISKS:\n${Array.isArray(content.risks) 
            ? content.risks.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n') 
            : content.risks || 'None'}\n\n` +
          `DEPENDENCIES:\n${Array.isArray(content.dependencies) 
            ? content.dependencies.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n') 
            : content.dependencies || 'None'}`;

      case 'tech_spec':
        return `TECHNICAL SPECIFICATION\n\n` +
          `TITLE: ${content.title || 'Untitled'}\n\n` +
          `OVERVIEW:\n${content.overview || 'No overview'}\n\n` +
          `ARCHITECTURE:\n${content.architecture || 'No architecture details'}\n\n` +
          `TECHNOLOGIES:\n${Array.isArray(content.technologies) 
            ? content.technologies.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') 
            : content.technologies || 'None'}\n\n` +
          `API ENDPOINTS:\n${Array.isArray(content.api_endpoints) 
            ? content.api_endpoints.map((e: any, i: number) => `${i + 1}. ${typeof e === 'object' ? `${e.method} ${e.path}` : e}`).join('\n') 
            : content.api_endpoints || 'None'}`;

      default:
        return JSON.stringify(content, null, 2);
    }
  };

  const handleCopy = () => {
    const content = formatArtifactContent(artifact.content, artifact.artifact_type);
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Artifact content copied to clipboard',
    });
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
    toast({
      title: 'Downloaded',
      description: 'Artifact downloaded successfully',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'canvas':
        return <Badge variant="default" className="bg-agent-purple">Canvas</Badge>;
      case 'story':
        return <Badge variant="default" className="bg-agent-blue">User Story</Badge>;
      case 'epic':
        return <Badge variant="default" className="bg-agent-orange">Epic</Badge>;
      case 'impact_analysis':
        return <Badge variant="default" className="bg-agent-green">Impact Analysis</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {icon}
              <div>
                <CardTitle className="text-lg line-clamp-1">{artifact.title}</CardTitle>
                <CardDescription className="text-xs">
                  {formatDate(artifact.created_at)}
                </CardDescription>
              </div>
            </div>
            {getTypeBadge(artifact.artifact_type)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(artifact.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {icon}
              <span>{artifact.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeBadge(artifact.artifact_type)}
                <span className="text-sm text-muted-foreground">
                  Created {formatDate(artifact.created_at)}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-muted/50">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                {formatArtifactContent(artifact.content, artifact.artifact_type)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};