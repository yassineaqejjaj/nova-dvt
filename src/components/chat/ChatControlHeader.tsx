import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';
import { LiveSynthesis, ResponseMode, SteeringCommand } from '@/types';
import { ConversationStatusPill } from './ConversationStatusPill';
import { ResponseModeToggle } from './ResponseModeToggle';
import { ModeSwitcher } from './ModeSwitcher';

interface ChatControlHeaderProps {
  synthesis: LiveSynthesis;
  messageCount: number;
  activeMode: SteeringCommand | null;
  onModeChange: (mode: SteeringCommand | null) => void;
  responseMode: ResponseMode;
  onResponseModeChange: (mode: ResponseMode) => void;
  showSynthesisPanel: boolean;
  onToggleSynthesisPanel: () => void;
  isLoading: boolean;
}

export const ChatControlHeader: FC<ChatControlHeaderProps> = ({
  synthesis,
  messageCount,
  activeMode,
  onModeChange,
  responseMode,
  onResponseModeChange,
  showSynthesisPanel,
  onToggleSynthesisPanel,
  isLoading,
}) => {
  return (
    <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="px-4 py-3 space-y-2">
        {/* Row 1: Title + Status Pill | Response Mode + Panel Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-sm">Conversation</h3>
            <ConversationStatusPill synthesis={synthesis} messageCount={messageCount} />
          </div>
          <div className="flex items-center gap-3">
            <ResponseModeToggle mode={responseMode} onChange={onResponseModeChange} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSynthesisPanel}
              className="h-7 px-2"
              aria-label={showSynthesisPanel ? 'Masquer le panneau de synthèse' : 'Afficher le panneau de synthèse'}
            >
              {showSynthesisPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Row 2: Mode Switcher */}
        <ModeSwitcher 
          activeMode={activeMode} 
          onModeChange={onModeChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
