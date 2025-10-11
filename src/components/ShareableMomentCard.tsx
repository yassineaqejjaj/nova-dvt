import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Trophy, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ShareableMomentCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  momentType: 'level_up' | 'agent_unlock' | 'workflow_complete';
  title: string;
  description: string;
  shareData?: any;
}

export const ShareableMomentCard: React.FC<ShareableMomentCardProps> = ({
  open,
  onOpenChange,
  momentType,
  title,
  description,
  shareData,
}) => {
  const getMomentIcon = () => {
    switch (momentType) {
      case 'level_up':
        return Trophy;
      case 'agent_unlock':
        return Star;
      case 'workflow_complete':
        return Zap;
      default:
        return Star;
    }
  };

  const Icon = getMomentIcon();

  const handleShare = (platform: 'linkedin' | 'twitter' | 'internal') => {
    const text = `🚀 ${title} - ${description}`;
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'internal':
        // Copy to clipboard for internal sharing
        navigator.clipboard.writeText(text);
        break;
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would generate an image
    console.log('Download moment card');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🎉 Congratulations!</DialogTitle>
          <DialogDescription>
            Share your achievement with the world
          </DialogDescription>
        </DialogHeader>

        {/* Visual Card Preview */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/20">
                <Icon className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              {shareData?.stats && (
                <div className="flex gap-4 text-sm">
                  {Object.entries(shareData.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="font-bold text-lg">{value as string}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Share Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={() => handleShare('linkedin')} variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share on LinkedIn
          </Button>
          <Button onClick={() => handleShare('twitter')} variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share on Twitter
          </Button>
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
