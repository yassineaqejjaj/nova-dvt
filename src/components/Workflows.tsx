import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowSteps } from './WorkflowSteps';
import { CanvasGenerator } from './CanvasGenerator';
import { StoryWriter } from './StoryWriter';
import { ImpactPlotter } from './ImpactPlotter';
import { MarketResearch } from './MarketResearch';
import {
  Rocket,
  Target,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  estimatedTime: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    tool?: 'canvas' | 'story' | 'impact' | 'research';
    completed?: boolean;
  }>;
}

const workflows: Workflow[] = [
  {
    id: 'feature-discovery',
    name: 'Feature Discovery',
    description: 'Research, prioritize, and define a new feature from idea to user story',
    icon: <Target className="w-6 h-6" />,
    category: 'Discovery',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'research',
        title: 'Market & User Research',
        description: 'Gather competitive insights and user feedback to validate the feature idea',
        tool: 'research',
        completed: false,
      },
      {
        id: 'swot',
        title: 'SWOT Analysis',
        description: 'Analyze strengths, weaknesses, opportunities, and threats',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'prioritize',
        title: 'Impact vs Effort Analysis',
        description: 'Evaluate the feature against other priorities',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'story',
        title: 'Write User Story',
        description: 'Create a comprehensive user story with acceptance criteria',
        tool: 'story',
        completed: false,
      },
    ],
  },
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Prepare and organize work for an upcoming sprint cycle',
    icon: <Calendar className="w-6 h-6" />,
    category: 'Planning',
    estimatedTime: '30-45 min',
    steps: [
      {
        id: 'review',
        title: 'Backlog Review',
        description: 'Review and groom the product backlog items',
        completed: false,
      },
      {
        id: 'prioritize',
        title: 'Prioritize Items',
        description: 'Use MoSCoW or Impact/Effort to prioritize backlog',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'refine',
        title: 'Refine User Stories',
        description: 'Ensure stories are ready with clear acceptance criteria',
        tool: 'story',
        completed: false,
      },
      {
        id: 'capacity',
        title: 'Capacity Planning',
        description: 'Allocate stories based on team capacity and velocity',
        completed: false,
      },
    ],
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Plan and execute a successful product or feature launch',
    icon: <Rocket className="w-6 h-6" />,
    category: 'Execution',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'strategy',
        title: 'Launch Strategy',
        description: 'Define launch goals, target audience, and positioning',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'gtm',
        title: 'Go-to-Market Plan',
        description: 'Create marketing, sales, and distribution strategies',
        completed: false,
      },
      {
        id: 'metrics',
        title: 'Success Metrics',
        description: 'Define KPIs and measurement framework',
        completed: false,
      },
      {
        id: 'timeline',
        title: 'Launch Timeline',
        description: 'Create detailed timeline with milestones and dependencies',
        completed: false,
      },
    ],
  },
  {
    id: 'user-research',
    name: 'User Research',
    description: 'Plan, conduct, and synthesize user research findings',
    icon: <Users className="w-6 h-6" />,
    category: 'Discovery',
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
        description: 'Design methodology, recruit participants, prepare materials',
        completed: false,
      },
      {
        id: 'conduct',
        title: 'Conduct Research',
        description: 'Execute interviews, surveys, or usability tests',
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
  {
    id: 'roadmap-planning',
    name: 'Roadmap Planning',
    description: 'Create a strategic product roadmap aligned with company goals',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Strategy',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'vision',
        title: 'Product Vision',
        description: 'Define long-term vision and strategic objectives',
        completed: false,
      },
      {
        id: 'initiatives',
        title: 'Identify Initiatives',
        description: 'Gather and list all potential initiatives and features',
        completed: false,
      },
      {
        id: 'prioritize',
        title: 'Prioritization',
        description: 'Evaluate and prioritize initiatives using impact/effort',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'timeline',
        title: 'Timeline & Themes',
        description: 'Organize initiatives into quarters with strategic themes',
        tool: 'canvas',
        completed: false,
      },
    ],
  },
  {
    id: 'requirements-gathering',
    name: 'Requirements Gathering',
    description: 'Collect and document comprehensive product requirements',
    icon: <FileText className="w-6 h-6" />,
    category: 'Planning',
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
        description: 'Conduct interviews and collect functional/non-functional requirements',
        completed: false,
      },
      {
        id: 'moscow',
        title: 'Prioritize Requirements',
        description: 'Use MoSCoW framework to prioritize requirements',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'document',
        title: 'Document Stories',
        description: 'Convert requirements into detailed user stories',
        tool: 'story',
        completed: false,
      },
    ],
  },
];

export const Workflows: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCanvasGenerator, setShowCanvasGenerator] = useState(false);
  const [showStoryWriter, setShowStoryWriter] = useState(false);
  const [showImpactPlotter, setShowImpactPlotter] = useState(false);
  const [showMarketResearch, setShowMarketResearch] = useState(false);

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
    }
  };

  const handleCompleteWorkflow = () => {
    toast.success(`Completed ${selectedWorkflow?.name} workflow!`, {
      description: 'Great work! Your PM workflow is complete.',
    });
    handleBackToWorkflows();
  };

  const categories = Array.from(new Set(workflows.map(w => w.category)));

  if (selectedWorkflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToWorkflows}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Button>
          <Badge variant="outline">{selectedWorkflow.estimatedTime}</Badge>
        </div>

        <div>
          <div className="flex items-center space-x-3 mb-2">
            {selectedWorkflow.icon}
            <h2 className="text-3xl font-bold">{selectedWorkflow.name}</h2>
          </div>
          <p className="text-muted-foreground">{selectedWorkflow.description}</p>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">PM Workflows</h2>
        <p className="text-muted-foreground">
          Guided step-by-step workflows for common product management tasks
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <span>{category}</span>
            <Badge variant="secondary">
              {workflows.filter(w => w.category === category).length}
            </Badge>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows
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
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {workflow.estimatedTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{workflow.description}</CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
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
              <span>Save time with structured templates and frameworks</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Ensure nothing important gets missed in complex processes</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
