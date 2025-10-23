import { useState, useMemo } from 'react';
import frameworksData from '@/data/frameworks.json';

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  philosophy: string;
  description: string;
  deliverables: string[];
  tools: string[];
  rituals: string[];
  best_for: string;
  team_size: string;
  cadence: string;
  color: string;
}

interface WorkflowBase {
  id: string;
  name: string;
  frameworks?: string[];
  [key: string]: any;
}

export function useFrameworkFilter() {
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  
  const frameworks: Framework[] = frameworksData.frameworks;

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const clearFrameworks = () => {
    setSelectedFrameworks([]);
  };

  const selectAllFrameworks = () => {
    setSelectedFrameworks(frameworks.map(f => f.id));
  };

  const isFrameworkSelected = (frameworkId: string) => {
    return selectedFrameworks.includes(frameworkId);
  };

  const getSelectedFrameworks = () => {
    return frameworks.filter(f => selectedFrameworks.includes(f.id));
  };

  const filterWorkflows = <T extends WorkflowBase>(workflows: T[]): T[] => {
    if (selectedFrameworks.length === 0) {
      return workflows;
    }

    return workflows.filter(workflow => {
      // If workflow doesn't specify frameworks, show it for all
      if (!workflow.frameworks || workflow.frameworks.length === 0) {
        return true;
      }

      // Check if workflow supports any of the selected frameworks
      return workflow.frameworks.some(fw => selectedFrameworks.includes(fw));
    });
  };

  const getRecommendedTools = () => {
    if (selectedFrameworks.length === 0) {
      return [];
    }

    const selectedFrameworkObjects = getSelectedFrameworks();
    const toolSet = new Set<string>();
    
    selectedFrameworkObjects.forEach(fw => {
      fw.tools.forEach(tool => toolSet.add(tool));
    });

    return Array.from(toolSet);
  };

  const getRecommendedDeliverables = () => {
    if (selectedFrameworks.length === 0) {
      return [];
    }

    const selectedFrameworkObjects = getSelectedFrameworks();
    const deliverableSet = new Set<string>();
    
    selectedFrameworkObjects.forEach(fw => {
      fw.deliverables.forEach(deliverable => deliverableSet.add(deliverable));
    });

    return Array.from(deliverableSet);
  };

  return {
    frameworks,
    selectedFrameworks,
    toggleFramework,
    clearFrameworks,
    selectAllFrameworks,
    isFrameworkSelected,
    getSelectedFrameworks,
    filterWorkflows,
    getRecommendedTools,
    getRecommendedDeliverables,
  };
}
