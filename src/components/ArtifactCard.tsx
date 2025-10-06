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

  const handleCopy = () => {
    const content = JSON.stringify(artifact.content, null, 2);
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Artifact content copied to clipboard',
    });
  };

  const handleDownload = () => {
    const content = JSON.stringify(artifact.content, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '_')}.json`;
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
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(artifact.content, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};