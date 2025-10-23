import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  label: string;
  action: string;
  requiredArtifactType?: string;
}

interface WorkflowState {
  type: string;
  currentStep: number;
  completedSteps: string[];
  context: Record<string, any>;
}

export const useWorkflowProgress = (
  activeWorkflow: { type: string; currentStep: number } | null,
  onStepComplete?: (newStep: number, context: any) => void
) => {
  const [lastArtifactCount, setLastArtifactCount] = useState(0);

  useEffect(() => {
    if (!activeWorkflow) {
      setLastArtifactCount(0);
      return;
    }

    let lastCount = 0;

    // Watch for new artifacts to auto-advance workflow
    const checkForNewArtifacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: artifacts } = await supabase
        .from('artifacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!artifacts || artifacts.length === 0) return;

      const currentCount = artifacts.length;
      if (currentCount > lastCount && lastCount > 0 && onStepComplete) {
        // New artifact created!
        const newArtifact = artifacts[0];
        const updatedContext = {
          [`step_${activeWorkflow.currentStep}`]: newArtifact,
          lastArtifact: newArtifact
        };
        
        // Auto-advance to next step
        onStepComplete(activeWorkflow.currentStep + 1, updatedContext);
      }
      
      lastCount = currentCount;
      setLastArtifactCount(currentCount);
    };

    // Initial count
    const initializeCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      lastCount = count || 0;
      setLastArtifactCount(count || 0);
    };

    initializeCount();

    // Poll for changes every 2 seconds when workflow is active
    const interval = setInterval(checkForNewArtifacts, 2000);

    return () => clearInterval(interval);
  }, [activeWorkflow, onStepComplete]);
  
  // Return empty workflowContext for compatibility
  return { workflowContext: {} };
};
