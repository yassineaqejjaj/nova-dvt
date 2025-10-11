import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { WorkflowSteps } from './WorkflowSteps';
import { CanvasGenerator } from './CanvasGenerator';
import { StoryWriter } from './StoryWriter';
import { ImpactPlotter } from './ImpactPlotter';
import { MarketResearch } from './MarketResearch';
import { DesignTool } from './DesignTool';
import { CodeGenerator } from './CodeGenerator';
import { RoadmapPlanner } from './RoadmapPlanner';
import { ProductLaunch } from './ProductLaunch';
import { SprintPlanner } from './SprintPlanner';
import { KPIGenerator } from './KPIGenerator';
import { ProductContextManager } from './ProductContextManager';
import {
  Rocket,
  Target,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  ArrowLeft,
  CheckCircle,
  Palette,
  Code2,
  Filter,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  tags: string[];
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: Array<{
    id: string;
    title: string;
    description: string;
    tool?: 'canvas' | 'story' | 'impact' | 'research' | 'design' | 'code' | 'roadmap' | 'launch' | 'sprint' | 'kpi';
    completed?: boolean;
  }>;
}

const workflows: Workflow[] = [
  // PRODUCT STRATEGY
  {
    id: 'roadmap-planning',
    name: 'Strategic Roadmap Planning',
    description: 'Create a comprehensive product roadmap with quarterly milestones and strategic themes',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Product Strategy',
    tags: ['Strategy', 'Roadmap', 'Planning', 'Long-term'],
    difficulty: 'Advanced',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'vision',
        title: 'Define Product Vision',
        description: 'Establish long-term vision and strategic objectives',
        completed: false,
      },
      {
        id: 'milestones',
        title: 'Plan Milestones',
        description: 'Use roadmap planner to create quarterly milestones',
        tool: 'roadmap',
        completed: false,
      },
      {
        id: 'impact',
        title: 'Prioritize Initiatives',
        description: 'Evaluate initiatives using impact/effort analysis',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'kpi-alignment',
        title: 'Metrics Alignment',
        description: 'Generate KPIs aligned with strategic objectives',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'stakeholders',
        title: 'Stakeholder Alignment',
        description: 'Present and gather feedback on roadmap',
        completed: false,
      },
    ],
  },
  {
    id: 'feature-discovery',
    name: 'Feature Discovery & Validation',
    description: 'Research, validate, and define a new feature from idea to user story',
    icon: <Target className="w-6 h-6" />,
    category: 'Product Strategy',
    tags: ['Discovery', 'Research', 'Validation', 'Features'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'research',
        title: 'Market & User Research',
        description: 'Gather competitive insights and user feedback',
        tool: 'research',
        completed: false,
      },
      {
        id: 'swot',
        title: 'SWOT Analysis',
        description: 'Analyze strengths, weaknesses, opportunities, threats',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'prioritize',
        title: 'Impact vs Effort',
        description: 'Evaluate feature against other priorities',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'validation-kpi',
        title: 'Validation Planning',
        description: 'Define KPIs to validate feature success',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'story',
        title: 'Write User Story',
        description: 'Create user story with acceptance criteria',
        tool: 'story',
        completed: false,
      },
    ],
  },
  
  // AGILE & EXECUTION
  {
    id: 'sprint-planning',
    name: 'Agile Sprint Planning',
    description: 'Plan and manage sprint backlog with capacity planning and kanban board',
    icon: <Calendar className="w-6 h-6" />,
    category: 'Agile & Execution',
    tags: ['Agile', 'Sprint', 'Scrum', 'Planning', 'Kanban'],
    difficulty: 'Beginner',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'backlog',
        title: 'Review Backlog',
        description: 'Review and groom product backlog items',
        completed: false,
      },
      {
        id: 'sprint',
        title: 'Sprint Planning Board',
        description: 'Use sprint planner with kanban visualization',
        tool: 'sprint',
        completed: false,
      },
      {
        id: 'stories',
        title: 'Refine User Stories',
        description: 'Ensure stories have clear acceptance criteria',
        tool: 'story',
        completed: false,
      },
      {
        id: 'sprint-kpi',
        title: 'Sprint Metrics (Optional)',
        description: 'Define sprint success metrics and KPIs',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'capacity',
        title: 'Capacity Planning',
        description: 'Allocate work based on team velocity',
        completed: false,
      },
    ],
  },
  {
    id: 'requirements-gathering',
    name: 'Requirements Gathering',
    description: 'Collect and document comprehensive product requirements with stakeholder input',
    icon: <FileText className="w-6 h-6" />,
    category: 'Agile & Execution',
    tags: ['Requirements', 'Documentation', 'Planning', 'Stakeholders'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'stakeholders',
        title: 'Identify Stakeholders',
        description: 'List all stakeholders and their needs',
        completed: false,
      },
      {
        id: 'gather',
        title: 'Gather Requirements',
        description: 'Conduct interviews and collect requirements',
        completed: false,
      },
      {
        id: 'moscow',
        title: 'Prioritize Requirements',
        description: 'Use MoSCoW framework to prioritize',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'document',
        title: 'Document Stories',
        description: 'Convert requirements into user stories',
        tool: 'story',
        completed: false,
      },
    ],
  },

  // PRODUCT LAUNCH
  {
    id: 'product-launch',
    name: 'Product Launch Execution',
    description: 'Plan and execute successful product launch with comprehensive task checklist',
    icon: <Rocket className="w-6 h-6" />,
    category: 'Product Launch',
    tags: ['Launch', 'GTM', 'Marketing', 'Execution', 'Checklist'],
    difficulty: 'Advanced',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'strategy',
        title: 'Launch Strategy',
        description: 'Define goals, audience, and positioning',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'checklist',
        title: 'Launch Checklist',
        description: 'Create comprehensive cross-team task list',
        tool: 'launch',
        completed: false,
      },
      {
        id: 'research',
        title: 'Market Research',
        description: 'Analyze market and competitive landscape',
        tool: 'research',
        completed: false,
      },
      {
        id: 'timeline',
        title: 'Execute Launch',
        description: 'Track progress and complete all tasks',
        completed: false,
      },
    ],
  },

  // USER RESEARCH
  {
    id: 'user-research',
    name: 'User Research & Insights',
    description: 'Plan, conduct, and synthesize user research to generate actionable insights',
    icon: <Users className="w-6 h-6" />,
    category: 'User Research',
    tags: ['Research', 'Users', 'Interviews', 'Insights', 'UX'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'objectives',
        title: 'Define Research Objectives',
        description: 'Set clear research questions and goals',
        completed: false,
      },
      {
        id: 'plan',
        title: 'Research Plan',
        description: 'Design methodology and recruit participants',
        completed: false,
      },
      {
        id: 'conduct',
        title: 'Conduct Research',
        description: 'Execute interviews, surveys, usability tests',
        completed: false,
      },
      {
        id: 'synthesize',
        title: 'Synthesize Findings',
        description: 'Analyze data and create actionable insights',
        tool: 'canvas',
        completed: false,
      },
    ],
  },

  // DESIGN
  {
    id: 'design-system',
    name: 'Design System Creation',
    description: 'Build complete design system with brand identity, components, and documentation',
    icon: <Palette className="w-6 h-6" />,
    category: 'Design',
    tags: ['Design', 'UI', 'Brand', 'Components', 'System'],
    difficulty: 'Advanced',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'brand',
        title: 'Brand Identity',
        description: 'Define brand colors, logo, visual identity',
        tool: 'design',
        completed: false,
      },
      {
        id: 'typography',
        title: 'Typography System',
        description: 'Choose fonts and create text hierarchy',
        tool: 'design',
        completed: false,
      },
      {
        id: 'components',
        title: 'UI Components',
        description: 'Design reusable component library',
        tool: 'design',
        completed: false,
      },
      {
        id: 'documentation',
        title: 'Documentation',
        description: 'Create design system documentation',
        completed: false,
      },
    ],
  },

  // DEVELOPMENT
  {
    id: 'component-development',
    name: 'Component Development',
    description: 'Build and test reusable UI components from designs to production-ready code',
    icon: <Code2 className="w-6 h-6" />,
    category: 'Development',
    tags: ['Development', 'Code', 'Components', 'Testing', 'TypeScript'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'requirements',
        title: 'Component Requirements',
        description: 'Define props, variants, and component API',
        completed: false,
      },
      {
        id: 'code',
        title: 'Code Implementation',
        description: 'Write component code with TypeScript',
        tool: 'code',
        completed: false,
      },
      {
        id: 'styling',
        title: 'Styling',
        description: 'Apply design tokens and responsive styles',
        tool: 'design',
        completed: false,
      },
      {
        id: 'testing',
        title: 'Testing & Documentation',
        description: 'Write tests and document usage',
        tool: 'code',
        completed: false,
      },
    ],
  },
];

export const Workflows: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  
  const [showCanvasGenerator, setShowCanvasGenerator] = useState(false);
  const [showStoryWriter, setShowStoryWriter] = useState(false);
  const [showImpactPlotter, setShowImpactPlotter] = useState(false);
  const [showMarketResearch, setShowMarketResearch] = useState(false);
  const [showDesignTool, setShowDesignTool] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [showRoadmapPlanner, setShowRoadmapPlanner] = useState(false);
  const [showProductLaunch, setShowProductLaunch] = useState(false);
  const [showSprintPlanner, setShowSprintPlanner] = useState(false);
  const [showKPIGenerator, setShowKPIGenerator] = useState(false);
  const [showContextManager, setShowContextManager] = useState(false);

  const [activeContext, setActiveContext] = useState<{
    name: string;
    vision: string | null;
    objectives: string[];
    target_kpis: string[];
    constraints: string | null;
    target_audience: string | null;
  } | null>(null);

  // Load active context on mount
  useEffect(() => {
    const loadActiveContext = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('product_contexts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('is_deleted', false)
          .single();

        if (error || !data) {
          // If no active context, get the most recent one
          const { data: recentData } = await supabase
            .from('product_contexts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_deleted', false)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (recentData) {
            setActiveContext({
              name: recentData.name,
              vision: recentData.vision,
              objectives: Array.isArray(recentData.objectives) ? recentData.objectives as string[] : [],
              target_kpis: Array.isArray(recentData.target_kpis) ? recentData.target_kpis as string[] : [],
              constraints: recentData.constraints,
              target_audience: recentData.target_audience
            });
          }
          return;
        }

        setActiveContext({
          name: data.name,
          vision: data.vision,
          objectives: Array.isArray(data.objectives) ? data.objectives as string[] : [],
          target_kpis: Array.isArray(data.target_kpis) ? data.target_kpis as string[] : [],
          constraints: data.constraints,
          target_audience: data.target_audience
        });
      } catch (error) {
        console.error('Error loading active context:', error);
      }
    };

    loadActiveContext();
  }, []);

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setCurrentStep(0);
  };

  const handleBackToWorkflows = () => {
    setSelectedWorkflow(null);
    setCurrentStep(0);
  };

  const handleToolLaunch = (tool: string) => {
    switch (tool) {
      case 'canvas':
        setShowCanvasGenerator(true);
        break;
      case 'story':
        setShowStoryWriter(true);
        break;
      case 'impact':
        setShowImpactPlotter(true);
        break;
      case 'research':
        setShowMarketResearch(true);
        break;
      case 'design':
        setShowDesignTool(true);
        break;
      case 'code':
        setShowCodeGenerator(true);
        break;
      case 'roadmap':
        setShowRoadmapPlanner(true);
        break;
      case 'launch':
        setShowProductLaunch(true);
        break;
      case 'sprint':
        setShowSprintPlanner(true);
        break;
      case 'kpi':
        setShowKPIGenerator(true);
        break;
    }
  };

  const handleCompleteWorkflow = () => {
    toast.success(`Completed ${selectedWorkflow?.name} workflow!`, {
      description: 'Great work! Your workflow is complete.',
    });
    handleBackToWorkflows();
  };

  const categories = Array.from(new Set(workflows.map(w => w.category)));
  const allTags = Array.from(new Set(workflows.flatMap(w => w.tags)));

  const filteredWorkflows = workflows.filter(w => {
    const categoryMatch = selectedCategory === 'all' || w.category === selectedCategory;
    const tagMatch = selectedTag === 'all' || w.tags.includes(selectedTag);
    return categoryMatch && tagMatch;
  });

  if (selectedWorkflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToWorkflows}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Button>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{selectedWorkflow.estimatedTime}</Badge>
            <Badge variant="secondary">{selectedWorkflow.difficulty}</Badge>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-3 mb-2">
            {selectedWorkflow.icon}
            <h2 className="text-3xl font-bold">{selectedWorkflow.name}</h2>
          </div>
          <p className="text-muted-foreground mb-3">{selectedWorkflow.description}</p>
          <div className="flex flex-wrap gap-1">
            {selectedWorkflow.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentStep + 1}</div>
                  <div className="text-xs text-muted-foreground">Current Step</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedWorkflow.steps.length}</div>
                  <div className="text-xs text-muted-foreground">Total Steps</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(((currentStep + 1) / selectedWorkflow.steps.length) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <WorkflowSteps
          steps={selectedWorkflow.steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          onToolLaunch={handleToolLaunch}
          onComplete={handleCompleteWorkflow}
        />

        {/* Tool Dialogs */}
        <CanvasGenerator open={showCanvasGenerator} onClose={() => setShowCanvasGenerator(false)} />
        <StoryWriter open={showStoryWriter} onClose={() => setShowStoryWriter(false)} />
        <ImpactPlotter open={showImpactPlotter} onClose={() => setShowImpactPlotter(false)} />
        {showMarketResearch && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowMarketResearch(false)}
              >
                ✕
              </Button>
              <MarketResearch />
            </div>
          </div>
        )}
        {showDesignTool && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowDesignTool(false)}
              >
                ✕
              </Button>
              <DesignTool />
            </div>
          </div>
        )}
        {showCodeGenerator && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowCodeGenerator(false)}
              >
                ✕
              </Button>
              <CodeGenerator />
            </div>
          </div>
        )}
        {showRoadmapPlanner && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowRoadmapPlanner(false)}
              >
                ✕
              </Button>
              <RoadmapPlanner />
            </div>
          </div>
        )}
        {showProductLaunch && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowProductLaunch(false)}
              >
                ✕
              </Button>
              <ProductLaunch />
            </div>
          </div>
        )}
        {showSprintPlanner && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowSprintPlanner(false)}
              >
                ✕
              </Button>
              <SprintPlanner />
            </div>
          </div>
        )}
        <KPIGenerator 
          open={showKPIGenerator} 
          onOpenChange={setShowKPIGenerator}
          activeContext={activeContext}
        />
        <ProductContextManager 
          open={showContextManager} 
          onOpenChange={setShowContextManager}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">PM Workflows</h2>
          <p className="text-muted-foreground">
            Guided step-by-step workflows for product management, design, and development
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {activeContext && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Contexte: {activeContext.name}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContextManager(true)}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Gérer Contextes
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Filter className="w-4 h-4" />
            <span>Filter Workflows</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTag === 'all' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedTag('all')}
              >
                All
              </Badge>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows by Category */}
      {categories.filter(cat => filteredWorkflows.some(w => w.category === cat)).map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <span>{category}</span>
            <Badge variant="secondary">
              {filteredWorkflows.filter(w => w.category === category).length}
            </Badge>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows
              .filter(workflow => workflow.category === category)
              .map(workflow => (
                <Card
                  key={workflow.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleWorkflowSelect(workflow)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {workflow.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{workflow.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {workflow.estimatedTime}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {workflow.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription>{workflow.description}</CardDescription>
                    <div className="flex flex-wrap gap-1">
                      {workflow.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {workflow.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{workflow.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                      <span>{workflow.steps.length} steps</span>
                      <Button variant="ghost" size="sm">
                        Start Workflow →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Benefits of Guided Workflows</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Follow proven product management processes step-by-step</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Integrate multiple PM tools in a logical sequence</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Track progress and maintain consistency across initiatives</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Learn best practices while getting work done</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <ProductContextManager 
        open={showContextManager} 
        onOpenChange={setShowContextManager}
      />
    </div>
  );
};
