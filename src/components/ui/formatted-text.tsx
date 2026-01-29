import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

// Orphan emoji pattern to clean up
const ORPHAN_EMOJI_PATTERN = /^[\s]*[💡⚙️🎯📌✨🔹🔸⚡️🚀📋✅❌⬆️⬇️➡️⭐️🎨📊💎🔥📈📉🎁💼📝🔍🛠️💬🎯]*[\s]*$/u;

// Check if line is just emojis/symbols without meaningful text
const isOrphanLine = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (ORPHAN_EMOJI_PATTERN.test(trimmed)) return true;
  // Single @ or * or - with no text
  if (/^[@*\-•●○◦▪▸►]\s*$/.test(trimmed)) return true;
  return false;
};

/**
 * Renders text with formatting:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - `code` → <code>
 * - **Title:** → styled header
 * - Line breaks preserved
 * - Bullet points (- or • or *) styled
 * - Numbered lists styled
 * - Orphan emojis/symbols cleaned up
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const formatLine = (line: string, index: number): React.ReactNode => {
    // Skip orphan lines (empty or just emojis)
    if (isOrphanLine(line)) {
      // Return small spacer for true empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return null; // Skip orphan emoji lines
    }

    // Check for bold header pattern: **Title:** or **Title :**
    const boldHeaderMatch = line.match(/^\*\*([^*]+):\s*\*\*\s*(.*)$/);
    if (boldHeaderMatch) {
      const [, headerText, rest] = boldHeaderMatch;
      return (
        <div key={index} className="mt-3 mb-1">
          <span className="font-semibold text-foreground">{headerText}:</span>
          {rest && <span className="ml-1">{formatInlineText(rest)}</span>}
        </div>
      );
    }

    // Check for bullet points (-, •, ●, *)
    const bulletMatch = line.match(/^(\s*)([-•●*]\s+)(.*)$/);
    if (bulletMatch) {
      const [, indent, , text] = bulletMatch;
      const indentLevel = Math.floor(indent.length / 2);
      return (
        <div 
          key={index} 
          className="flex items-start gap-2"
          style={{ paddingLeft: `${indentLevel * 1}rem` }}
        >
          <span className="text-primary mt-0.5 flex-shrink-0 text-xs">•</span>
          <span className="flex-1">{formatInlineText(text)}</span>
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
          <span className="text-primary font-medium flex-shrink-0 min-w-[1.5rem] text-sm">{number.trim()}</span>
          <span className="flex-1">{formatInlineText(text)}</span>
        </div>
      );
    }

    // Check for markdown headers (lines starting with #)
    if (line.match(/^#{1,3}\s+/)) {
      const headerText = line.replace(/^#{1,3}\s+/, '');
      return (
        <div key={index} className="font-semibold text-foreground mt-3 mb-1">
          {formatInlineText(headerText)}
        </div>
      );
    }

    // Check for section headers (text ending with colon, like "Section Title:")
    const sectionHeaderMatch = line.match(/^([A-Z][^:]{2,40}):\s*$/);
    if (sectionHeaderMatch) {
      return (
        <div key={index} className="font-medium text-foreground mt-3 mb-1">
          {sectionHeaderMatch[1]}:
        </div>
      );
    }

    // Check for inline header (Bold text with colon at start)
    const inlineHeaderMatch = line.match(/^([A-Z][A-Za-zÀ-ÿ\s]{1,30}):\s+(.+)$/);
    if (inlineHeaderMatch) {
      const [, header, rest] = inlineHeaderMatch;
      return (
        <div key={index}>
          <span className="font-medium text-foreground">{header}:</span>
          <span className="ml-1">{formatInlineText(rest)}</span>
        </div>
      );
    }

    // Regular line
    return (
      <div key={index}>
        {formatInlineText(line)}
      </div>
    );
  };

  const formatInlineText = (text: string): React.ReactNode => {
    if (!text) return null;
    
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    // Process bold, italic, and code in sequence
    while (remaining.length > 0) {
      // Match **bold** (including with colon like **Title:**)
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      // Match *italic* - improved regex to avoid conflicts with **bold**
      // Use negative lookbehind/lookahead to ensure it's not part of **
      const italicMatch = remaining.match(/(?<!\*)\*([^*\n]+)\*(?!\*)/);
      // Match `code`
      const codeMatch = remaining.match(/`([^`]+)`/);

      // Find the earliest match
      const matches = [
        boldMatch ? { type: 'bold', match: boldMatch, index: remaining.indexOf(boldMatch[0]) } : null,
        italicMatch ? { type: 'italic', match: italicMatch, index: remaining.indexOf(italicMatch[0]) } : null,
        codeMatch ? { type: 'code', match: codeMatch, index: remaining.indexOf(codeMatch[0]) } : null,
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
        parts.push(<strong key={keyIndex++} className="font-semibold text-foreground">{earliest.match[1]}</strong>);
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
  const formattedLines = lines.map((line, index) => formatLine(line, index)).filter(Boolean);

  return (
    <div className={`space-y-1 ${className}`}>
      {formattedLines}
    </div>
  );
};
