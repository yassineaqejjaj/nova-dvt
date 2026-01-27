import React from 'react';
import { Brain, Workflow, Users } from 'lucide-react';

export const ContextRoleExplainer: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-2">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <span>Alimente les agents</span>
      </div>
      <div className="flex items-center gap-2">
        <Workflow className="w-4 h-4 text-primary" />
        <span>Guide les workflows</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span>Influence les décisions</span>
      </div>
    </div>
  );
};
