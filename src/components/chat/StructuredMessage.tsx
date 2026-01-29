import { useState, type FC } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/formatted-text';
import { ResponseMode } from '@/types';

interface StructuredMessageProps {
  content: string;
  isCollapsible?: boolean;
  responseMode?: ResponseMode;
}

// Get collapse threshold based on response mode
const getCollapseThreshold = (mode: ResponseMode): number => {
  switch (mode) {
    case 'short':
      return 150; // Very short - collapse quickly
    case 'structured':
      return 400; // Medium - collapse at 400 chars
    case 'detailed':
      return 800; // Long - allow more content before collapse
    default:
      return 400;
  }
};

// Get preview content for collapsed state
const getPreviewContent = (content: string, mode: ResponseMode): string => {
  const threshold = getCollapseThreshold(mode);
  
  if (mode === 'short') {
    // For short mode: show first sentence or first 150 chars
    const firstSentence = content.match(/^[^.!?\n]+[.!?]?\s*/);
    if (firstSentence && firstSentence[0].length < threshold) {
      return firstSentence[0].trim();
    }
  }
  
  // For other modes: find a good break point
  if (content.length <= threshold) {
    return content;
  }
  
  // Try to break at paragraph or sentence
  const truncated = content.slice(0, threshold);
  
  // Look for last complete sentence
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('.\n'),
    truncated.lastIndexOf('? '),
    truncated.lastIndexOf('! ')
  );
  
  if (lastSentenceEnd > threshold * 0.5) {
    return content.slice(0, lastSentenceEnd + 1);
  }
  
  // Look for last newline
  const lastNewline = truncated.lastIndexOf('\n');
  if (lastNewline > threshold * 0.5) {
    return content.slice(0, lastNewline);
  }
  
  // Fallback: break at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > threshold * 0.7) {
    return content.slice(0, lastSpace) + '…';
  }
  
  return truncated + '…';
};

export const StructuredMessage: FC<StructuredMessageProps> = ({
  content,
  isCollapsible = true,
  responseMode = 'structured',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate if content needs collapsing based on mode
  const threshold = getCollapseThreshold(responseMode);
  const needsCollapsing = isCollapsible && content.length > threshold;
  
  // Get visible content
  const visibleContent = needsCollapsing && !isExpanded 
    ? getPreviewContent(content, responseMode)
    : content;

  // Calculate how much is hidden
  const hiddenChars = needsCollapsing ? content.length - visibleContent.length : 0;
  const hiddenPercent = Math.round((hiddenChars / content.length) * 100);

  return (
    <div className="space-y-2">
      <div className="text-sm leading-relaxed">
        <FormattedText content={visibleContent} />
      </div>
      
      {needsCollapsing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Réduire
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Voir plus ({hiddenPercent}% masqué)
            </>
          )}
        </Button>
      )}
    </div>
  );
};
