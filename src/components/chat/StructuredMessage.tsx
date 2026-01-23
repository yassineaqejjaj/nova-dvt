import { useState, type FC } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, MessageSquare, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedText } from '@/components/ui/formatted-text';
import { cn } from '@/lib/utils';

interface StructuredMessageProps {
  content: string;
  isCollapsible?: boolean;
  maxPreviewLines?: number;
}

interface ParsedSection {
  type: 'insight' | 'reasoning' | 'conclusion';
  content: string;
}

// Parse message content into semantic sections
const parseMessageSections = (content: string): ParsedSection[] => {
  const sections: ParsedSection[] = [];
  const lines = content.split('\n').filter(l => l.trim());
  
  if (lines.length === 0) return [{ type: 'reasoning', content }];
  
  // Simple heuristic: first meaningful sentence is insight, last is conclusion, rest is reasoning
  if (lines.length === 1) {
    return [{ type: 'insight', content: lines[0] }];
  }
  
  // Look for bullet points or structured content
  const hasBullets = lines.some(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().match(/^\d+\./));
  
  if (hasBullets) {
    // First line before bullets = insight
    const firstNonBullet = lines.findIndex(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().match(/^\d+\./));
    
    if (firstNonBullet > 0) {
      sections.push({ type: 'insight', content: lines.slice(0, firstNonBullet).join('\n') });
    }
    
    // Find where bullets end
    const bulletLines: string[] = [];
    let lastBulletIdx = firstNonBullet >= 0 ? firstNonBullet : 0;
    
    for (let i = lastBulletIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./) || line.startsWith('  ')) {
        bulletLines.push(lines[i]);
        lastBulletIdx = i;
      } else if (bulletLines.length > 0) {
        break;
      }
    }
    
    if (bulletLines.length > 0) {
      sections.push({ type: 'reasoning', content: bulletLines.join('\n') });
    }
    
    // Remaining lines = conclusion
    if (lastBulletIdx < lines.length - 1) {
      sections.push({ type: 'conclusion', content: lines.slice(lastBulletIdx + 1).join('\n') });
    }
  } else {
    // No bullets: split by paragraph structure
    sections.push({ type: 'insight', content: lines[0] });
    
    if (lines.length > 2) {
      sections.push({ type: 'reasoning', content: lines.slice(1, -1).join('\n') });
      sections.push({ type: 'conclusion', content: lines[lines.length - 1] });
    } else if (lines.length === 2) {
      sections.push({ type: 'conclusion', content: lines[1] });
    }
  }
  
  return sections.length > 0 ? sections : [{ type: 'reasoning', content }];
};

const SectionIcon: FC<{ type: ParsedSection['type'] }> = ({ type }) => {
  switch (type) {
    case 'insight':
      return <Lightbulb className="w-3.5 h-3.5 text-primary" />;
    case 'reasoning':
      return <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />;
    case 'conclusion':
      return <Target className="w-3.5 h-3.5 text-primary" />;
  }
};

export const StructuredMessage: FC<StructuredMessageProps> = ({
  content,
  isCollapsible = true,
  maxPreviewLines = 4,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sections = parseMessageSections(content);
  
  // Calculate if content needs collapsing
  const totalLines = content.split('\n').length;
  const needsCollapsing = isCollapsible && totalLines > maxPreviewLines;
  
  // In collapsed mode, show only insight
  const visibleSections = needsCollapsing && !isExpanded 
    ? sections.filter(s => s.type === 'insight').slice(0, 1)
    : sections;

  return (
    <div className="space-y-2">
      {visibleSections.map((section, idx) => (
        <div 
          key={idx} 
          className={cn(
            "text-sm leading-relaxed",
            section.type === 'insight' && "font-medium",
            section.type === 'conclusion' && "bg-muted/50 rounded-md px-2.5 py-1.5 border-l-2 border-primary/50"
          )}
        >
          {section.type !== 'reasoning' && (
            <span className="inline-flex items-center gap-1.5 mr-1">
              <SectionIcon type={section.type} />
            </span>
          )}
          <FormattedText
            content={section.content}
            className={cn(section.type === 'reasoning' && 'text-muted-foreground')}
          />
        </div>
      ))}
      
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
              Voir le raisonnement
            </>
          )}
        </Button>
      )}
    </div>
  );
};
