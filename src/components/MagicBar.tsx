import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { TabType } from '@/types';
import { NovaChat } from './NovaChat';

interface MagicBarProps {
  onNavigate: (tab: TabType) => void;
  onAction?: (action: string, data?: any) => void;
}

export const MagicBar: React.FC<MagicBarProps> = ({ onNavigate, onAction }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-medium">Ask Nova Anything</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
          ⌘K
        </kbd>
      </button>

      {/* Nova Chat Dialog */}
      <NovaChat
        open={open}
        onOpenChange={setOpen}
        onNavigate={onNavigate}
        onAction={onAction}
      />
    </>
  );
};
