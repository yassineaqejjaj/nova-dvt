import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles, FileText, BarChart3, Users, Zap, Layout } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { TabType } from '@/types';

interface MagicBarProps {
  onNavigate: (tab: TabType) => void;
  onAction?: (action: string, data?: any) => void;
}

export const MagicBar: React.FC<MagicBarProps> = ({ onNavigate, onAction }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [suggestions, setSuggestions] = useState<Array<{ label: string; action: string; icon: any }>>([]);

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

  useEffect(() => {
    // Context-aware suggestions based on current location
    updateSuggestions();
  }, [location.pathname]);

  const updateSuggestions = () => {
    const pathname = location.pathname;
    let contextSuggestions = [];

    if (pathname.includes('artifacts')) {
      contextSuggestions = [
        { label: 'Generate Summary', action: 'generate_summary', icon: FileText },
        { label: 'Export Artifacts', action: 'export_artifacts', icon: FileText },
      ];
    } else if (pathname.includes('analytics')) {
      contextSuggestions = [
        { label: 'Explain KPI Drift', action: 'explain_kpi', icon: BarChart3 },
        { label: 'Generate Report', action: 'generate_report', icon: FileText },
      ];
    } else if (pathname.includes('squads')) {
      contextSuggestions = [
        { label: 'Suggest Squad Composition', action: 'suggest_squad', icon: Users },
        { label: 'Optimize Squad', action: 'optimize_squad', icon: Zap },
      ];
    } else {
      contextSuggestions = [
        { label: 'Create New Canvas', action: 'create_canvas', icon: Layout },
        { label: 'Generate PRD', action: 'generate_prd', icon: FileText },
      ];
    }

    setSuggestions(contextSuggestions);
  };

  const handleSelect = (action: string) => {
    if (onAction) {
      onAction(action);
    }
    setOpen(false);
  };

  const quickActions = [
    { label: 'Go to Dashboard', action: () => onNavigate('dashboard'), icon: Layout },
    { label: 'View Agents', action: () => onNavigate('agents'), icon: Users },
    { label: 'View Artifacts', action: () => onNavigate('artifacts'), icon: FileText },
    { label: 'View Analytics', action: () => onNavigate('analytics'), icon: BarChart3 },
  ];

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

      {/* Command Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="What would you like to do?" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              {suggestions.length > 0 && (
                <CommandGroup heading="Suggested for this page">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSelect(suggestion.action)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{suggestion.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              <CommandGroup heading="Quick Actions">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <CommandItem key={index} onSelect={() => { action.action(); setOpen(false); }}>
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{action.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};
