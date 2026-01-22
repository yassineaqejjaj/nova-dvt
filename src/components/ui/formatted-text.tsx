import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * Renders text with formatting:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - `code` → <code>
 * - Line breaks preserved
 * - Bullet points (- or •) styled
 * - Numbered lists styled
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const formatLine = (line: string, index: number): React.ReactNode => {
    // Check for bullet points
    const bulletMatch = line.match(/^(\s*)([-•●]\s+)(.*)$/);
    if (bulletMatch) {
      const [, indent, bullet, text] = bulletMatch;
      const indentLevel = Math.floor(indent.length / 2);
      return (
        <div 
          key={index} 
          className="flex items-start gap-2"
          style={{ paddingLeft: `${indentLevel * 1}rem` }}
        >
          <span className="text-primary mt-1 flex-shrink-0">•</span>
          <span>{formatInlineText(text)}</span>
        </div>
      );
    }

    // Check for numbered lists
    const numberedMatch = line.match(/^(\s*)(\d+[\.\)]\s+)(.*)$/);
    if (numberedMatch) {
      const [, indent, number, text] = numberedMatch;
      const indentLevel = Math.floor(indent.length / 2);
      return (
        <div 
          key={index} 
          className="flex items-start gap-2"
          style={{ paddingLeft: `${indentLevel * 1}rem` }}
        >
          <span className="text-primary font-medium flex-shrink-0 min-w-[1.5rem]">{number.trim()}</span>
          <span>{formatInlineText(text)}</span>
        </div>
      );
    }

    // Check for headers (lines starting with # or ending with :)
    if (line.match(/^#{1,3}\s+/)) {
      const headerText = line.replace(/^#{1,3}\s+/, '');
      return (
        <div key={index} className="font-semibold text-foreground mt-3 mb-1">
          {formatInlineText(headerText)}
        </div>
      );
    }

    // Check for section headers (text ending with colon, all caps, or emoji prefix)
    if (line.match(/^[A-Z][A-Z\s]+:/) || line.match(/^[\u{1F300}-\u{1F9FF}]/u)) {
      return (
        <div key={index} className="font-medium text-foreground mt-2 mb-1">
          {formatInlineText(line)}
        </div>
      );
    }

    // Regular line
    if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    }

    return (
      <div key={index}>
        {formatInlineText(line)}
      </div>
    );
  };

  const formatInlineText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    // Process bold, italic, and code in sequence
    while (remaining.length > 0) {
      // Match **bold**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Match *italic* (but not **)
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
      // Match `code`
      const codeMatch = remaining.match(/`([^`]+)`/);

      // Find the earliest match
      const matches = [
        boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
        italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
        codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
      ].filter(Boolean) as Array<{ type: string; match: RegExpMatchArray; index: number }>;

      if (matches.length === 0) {
        // No more matches, add remaining text
        parts.push(<React.Fragment key={keyIndex++}>{remaining}</React.Fragment>);
        break;
      }

      // Get earliest match
      matches.sort((a, b) => a.index - b.index);
      const earliest = matches[0];

      // Add text before match
      if (earliest.index > 0) {
        parts.push(<React.Fragment key={keyIndex++}>{remaining.slice(0, earliest.index)}</React.Fragment>);
      }

      // Add formatted text
      if (earliest.type === 'bold') {
        parts.push(<strong key={keyIndex++} className="font-semibold">{earliest.match[1]}</strong>);
      } else if (earliest.type === 'italic') {
        parts.push(<em key={keyIndex++} className="italic">{earliest.match[1]}</em>);
      } else if (earliest.type === 'code') {
        parts.push(
          <code key={keyIndex++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {earliest.match[1]}
          </code>
        );
      }

      // Continue with remaining text
      remaining = remaining.slice(earliest.index + earliest.match[0].length);
    }

    return <>{parts}</>;
  };

  const lines = content.split('\n');

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, index) => formatLine(line, index))}
    </div>
  );
};
