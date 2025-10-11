import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  Grid3X3,
  Download,
  Copy,
  CheckCircle,
  Upload,
  FileText,
  X,
  Calendar,
  Flag,
  Palette,
  Map,
  TestTube,
  Code,
  Layers,
  GitBranch,
  Clipboard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CanvasGeneratorProps {
  open: boolean;
  onClose: () => void;
}

interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: string[];
  prompts: Record<string, string>;
  color: string;
  role: 'product-manager' | 'designer' | 'developer';
  formFields?: Array<{
    name: string;
    label: string;
    type: 'input' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
}

interface UploadedDocument {
  name: string;
  content: string;
  size: number;
}

const canvasTemplates: CanvasTemplate[] = [
  // PRODUCT MANAGER FRAMEWORKS
  {
    id: 'moscow',
    name: 'MoSCoW Prioritization',
    description: 'Prioritize features using Must have, Should have, Could have, Won\'t have',
    icon: <Target className="w-6 h-6" />,
    sections: ['Must Have', 'Should Have', 'Could Have', 'Won\'t Have'],
    prompts: {
      'Must Have': 'What features are critical for launch?',
      'Should Have': 'What features are important but not critical?',
      'Could Have': 'What would be nice to have if time permits?',
      'Won\'t Have': 'What are we explicitly not doing this time?'
    },
    color: 'bg-agent-blue',
    role: 'product-manager',
    formFields: [
      { name: 'timeline', label: 'Project Timeline', type: 'input', placeholder: 'e.g., 3 months', required: true },
      { name: 'budget', label: 'Budget Constraints', type: 'input', placeholder: 'Budget limitations' },
      { name: 'stakeholders', label: 'Key Stakeholders', type: 'textarea', placeholder: 'List key stakeholders and their priorities' }
    ]
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
    icon: <TrendingUp className="w-6 h-6" />,
    sections: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
    prompts: {
      'Strengths': 'What advantages do we have?',
      'Weaknesses': 'What areas need improvement?',
      'Opportunities': 'What market opportunities exist?',
      'Threats': 'What external threats should we consider?'
    },
    color: 'bg-agent-green',
    role: 'product-manager',
    formFields: [
      { name: 'industry', label: 'Industry/Market', type: 'input', placeholder: 'e.g., SaaS, E-commerce', required: true },
      { name: 'company_size', label: 'Company Size', type: 'select', options: ['Startup', 'Small (1-50)', 'Medium (51-500)', 'Large (500+)'] },
      { name: 'competitors', label: 'Main Competitors', type: 'textarea', placeholder: 'List 3-5 main competitors' }
    ]
  },
  {
    id: 'business-model',
    name: 'Business Model Canvas',
    description: 'Map out your business model across 9 key building blocks',
    icon: <Grid3X3 className="w-6 h-6" />,
    sections: [
      'Key Partners', 'Key Activities', 'Key Resources', 'Value Propositions',
      'Customer Relationships', 'Channels', 'Customer Segments', 'Cost Structure', 'Revenue Streams'
    ],
    prompts: {
      'Key Partners': 'Who are our key partners and suppliers?',
      'Key Activities': 'What key activities does our business require?',
      'Key Resources': 'What key resources does our business require?',
      'Value Propositions': 'What value do we deliver to customers?',
      'Customer Relationships': 'What type of relationship do we have with customers?',
      'Channels': 'How do we reach and deliver to customers?',
      'Customer Segments': 'Who are we creating value for?',
      'Cost Structure': 'What are the most important costs in our business?',
      'Revenue Streams': 'For what value are customers willing to pay?'
    },
    color: 'bg-agent-purple',
    role: 'product-manager',
    formFields: [
      { name: 'business_type', label: 'Business Type', type: 'select', options: ['B2B', 'B2C', 'B2B2C', 'Marketplace'], required: true },
      { name: 'revenue_model', label: 'Revenue Model', type: 'select', options: ['Subscription', 'One-time', 'Freemium', 'Commission', 'Advertising'] },
      { name: 'target_market', label: 'Target Market Size', type: 'input', placeholder: 'Estimated market size' }
    ]
  },
  {
    id: 'rice',
    name: 'RICE Scoring',
    description: 'Prioritize initiatives using Reach, Impact, Confidence, Effort',
    icon: <Zap className="w-6 h-6" />,
    sections: ['Initiative', 'Reach', 'Impact', 'Confidence', 'Effort', 'RICE Score'],
    prompts: {
      'Initiative': 'What initiative are you evaluating?',
      'Reach': 'How many people will this impact? (per quarter)',
      'Impact': 'What impact will this have? (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)',
      'Confidence': 'How confident are you? (100%=high, 80%=medium, 50%=low)',
      'Effort': 'How much effort is required? (person-months)',
      'RICE Score': 'Calculated automatically: (Reach × Impact × Confidence) / Effort'
    },
    color: 'bg-agent-orange',
    role: 'product-manager',
    formFields: [
      { name: 'initiatives', label: 'Initiatives to Evaluate', type: 'textarea', placeholder: 'List initiatives separated by lines', required: true },
      { name: 'team_size', label: 'Team Size', type: 'input', placeholder: 'Number of team members' },
      { name: 'timeframe', label: 'Evaluation Timeframe', type: 'select', options: ['Quarter', 'Half-year', 'Year'] }
    ]
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Strategic timeline for product development and releases',
    icon: <Calendar className="w-6 h-6" />,
    sections: ['Now (0-3 months)', 'Next (3-6 months)', 'Later (6-12 months)', 'Future Vision', 'Dependencies', 'Success Metrics'],
    prompts: {
      'Now (0-3 months)': 'What are the immediate priorities and quick wins?',
      'Next (3-6 months)': 'What features are planned for the near term?',
      'Later (6-12 months)': 'What longer-term initiatives are on the horizon?',
      'Future Vision': 'What is the long-term product vision beyond 12 months?',
      'Dependencies': 'What external dependencies or blockers exist?',
      'Success Metrics': 'How will you measure success at each stage?'
    },
    color: 'bg-agent-blue',
    role: 'product-manager',
    formFields: [
      { name: 'product_stage', label: 'Product Stage', type: 'select', options: ['Pre-launch', 'MVP', 'Growth', 'Mature'], required: true },
      { name: 'team_capacity', label: 'Team Capacity', type: 'input', placeholder: 'Development team size' },
      { name: 'market_pressure', label: 'Market Pressure', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] }
    ]
  },
  {
    id: 'okr-canvas',
    name: 'OKR Canvas',
    description: 'Define Objectives and Key Results for focused execution',
    icon: <Flag className="w-6 h-6" />,
    sections: ['Objective 1', 'Key Results 1', 'Objective 2', 'Key Results 2', 'Objective 3', 'Key Results 3', 'Alignment & Dependencies'],
    prompts: {
      'Objective 1': 'What is your primary objective? (Qualitative, inspirational)',
      'Key Results 1': 'What are 3-4 measurable results that define success?',
      'Objective 2': 'What is your second most important objective?',
      'Key Results 2': 'What measurable results support this objective?',
      'Objective 3': 'What is your third key objective?',
      'Key Results 3': 'What metrics will track this objective?',
      'Alignment & Dependencies': 'How do these OKRs align with company goals? What dependencies exist?'
    },
    color: 'bg-agent-green',
    role: 'product-manager',
    formFields: [
      { name: 'timeframe', label: 'OKR Timeframe', type: 'select', options: ['Quarter', 'Half-year', 'Year'], required: true },
      { name: 'team', label: 'Team/Department', type: 'input', placeholder: 'e.g., Product, Engineering' },
      { name: 'company_okrs', label: 'Related Company OKRs', type: 'textarea', placeholder: 'List relevant company-level OKRs' }
    ]
  },
  {
    id: 'gtm-strategy',
    name: 'Go-to-Market Strategy',
    description: 'Plan your product launch and market entry strategy',
    icon: <TrendingUp className="w-6 h-6" />,
    sections: ['Target Market', 'Value Proposition', 'Pricing Strategy', 'Marketing Channels', 'Sales Strategy', 'Launch Timeline', 'Success Metrics'],
    prompts: {
      'Target Market': 'Who is your ideal customer? Define segments and personas.',
      'Value Proposition': 'What unique value does your product provide?',
      'Pricing Strategy': 'How will you price and package your product?',
      'Marketing Channels': 'Which channels will you use to reach customers?',
      'Sales Strategy': 'How will you acquire and convert customers?',
      'Launch Timeline': 'What are the key milestones and dates?',
      'Success Metrics': 'What KPIs will measure launch success?'
    },
    color: 'bg-agent-purple',
    role: 'product-manager',
    formFields: [
      { name: 'product_type', label: 'Product Type', type: 'select', options: ['New Product', 'Feature Launch', 'Market Expansion', 'Relaunch'], required: true },
      { name: 'launch_date', label: 'Target Launch Date', type: 'input', placeholder: 'MM/YYYY' },
      { name: 'budget', label: 'Marketing Budget', type: 'input', placeholder: 'Budget allocated' }
    ]
  },

  // DESIGNER FRAMEWORKS
  {
    id: 'design-system',
    name: 'Design System Canvas',
    description: 'Structure your design system foundations and components',
    icon: <Palette className="w-6 h-6" />,
    sections: ['Brand Foundation', 'Color Palette', 'Typography', 'Components Library', 'Patterns & Guidelines', 'Accessibility Standards'],
    prompts: {
      'Brand Foundation': 'What are the core brand values and personality?',
      'Color Palette': 'What colors represent the brand? (Primary, secondary, neutrals)',
      'Typography': 'What fonts and type scales will you use?',
      'Components Library': 'What UI components are needed? (Buttons, forms, cards, etc.)',
      'Patterns & Guidelines': 'What design patterns and usage guidelines?',
      'Accessibility Standards': 'What accessibility standards will you follow? (WCAG level, contrast ratios)'
    },
    color: 'bg-agent-purple',
    role: 'designer',
    formFields: [
      { name: 'platform', label: 'Platform', type: 'select', options: ['Web', 'Mobile', 'Cross-platform'], required: true },
      { name: 'design_maturity', label: 'Design System Maturity', type: 'select', options: ['Starting', 'Growing', 'Established', 'Mature'] },
      { name: 'team_size', label: 'Design Team Size', type: 'input', placeholder: 'Number of designers' }
    ]
  },
  {
    id: 'user-journey',
    name: 'User Journey Map',
    description: 'Map the complete user experience across all touchpoints',
    icon: <Map className="w-6 h-6" />,
    sections: ['Persona', 'Awareness', 'Consideration', 'Purchase/Action', 'Retention', 'Advocacy', 'Pain Points', 'Opportunities'],
    prompts: {
      'Persona': 'Who is the user? (Demographics, goals, motivations)',
      'Awareness': 'How does the user become aware of the product?',
      'Consideration': 'What does the user think/feel during evaluation?',
      'Purchase/Action': 'What is the key action or conversion moment?',
      'Retention': 'How do we keep users engaged over time?',
      'Advocacy': 'What makes users recommend the product?',
      'Pain Points': 'What frustrations exist at each stage?',
      'Opportunities': 'Where can we improve the experience?'
    },
    color: 'bg-agent-blue',
    role: 'designer',
    formFields: [
      { name: 'user_type', label: 'Primary User Type', type: 'input', placeholder: 'e.g., First-time buyer', required: true },
      { name: 'journey_scope', label: 'Journey Scope', type: 'select', options: ['Single feature', 'Product onboarding', 'Full lifecycle', 'Specific task'] },
      { name: 'touchpoints', label: 'Key Touchpoints', type: 'textarea', placeholder: 'List main user touchpoints' }
    ]
  },
  {
    id: 'wireframe-planning',
    name: 'Wireframe Planning',
    description: 'Plan information architecture and layout structure',
    icon: <Layers className="w-6 h-6" />,
    sections: ['Page Purpose', 'Key Content Blocks', 'Navigation Elements', 'Interactive Components', 'Content Priority', 'Responsive Considerations'],
    prompts: {
      'Page Purpose': 'What is the primary goal of this page/screen?',
      'Key Content Blocks': 'What are the main content sections? (Hero, features, CTA, etc.)',
      'Navigation Elements': 'What navigation and wayfinding is needed?',
      'Interactive Components': 'What interactive elements are required? (Forms, buttons, filters)',
      'Content Priority': 'What content should be most prominent? How is it prioritized?',
      'Responsive Considerations': 'How will layout adapt across devices?'
    },
    color: 'bg-agent-green',
    role: 'designer',
    formFields: [
      { name: 'page_type', label: 'Page/Screen Type', type: 'select', options: ['Landing page', 'Dashboard', 'Form', 'Detail page', 'List view'], required: true },
      { name: 'viewport', label: 'Primary Viewport', type: 'select', options: ['Desktop', 'Mobile', 'Tablet', 'All'] },
      { name: 'complexity', label: 'Layout Complexity', type: 'select', options: ['Simple', 'Medium', 'Complex'] }
    ]
  },
  {
    id: 'ab-test',
    name: 'A/B Test Canvas',
    description: 'Design and plan effective A/B tests for your product',
    icon: <TestTube className="w-6 h-6" />,
    sections: ['Hypothesis', 'Control (A)', 'Variant (B)', 'Success Metrics', 'Sample Size & Duration', 'Expected Impact', 'Implementation Notes'],
    prompts: {
      'Hypothesis': 'What is your testable hypothesis? (If we change X, then Y will happen because Z)',
      'Control (A)': 'What is the current/control version?',
      'Variant (B)': 'What is the proposed change/variation?',
      'Success Metrics': 'What metrics will determine the winner? (Primary & secondary)',
      'Sample Size & Duration': 'How many users and how long will the test run?',
      'Expected Impact': 'What lift/improvement do you expect to see?',
      'Implementation Notes': 'What technical or design considerations exist?'
    },
    color: 'bg-agent-orange',
    role: 'designer',
    formFields: [
      { name: 'test_type', label: 'Test Type', type: 'select', options: ['UI/UX', 'Copy/Messaging', 'Feature', 'Pricing', 'Workflow'], required: true },
      { name: 'traffic_allocation', label: 'Traffic Split', type: 'select', options: ['50/50', '80/20', '70/30', 'Custom'] },
      { name: 'confidence_level', label: 'Statistical Confidence', type: 'select', options: ['90%', '95%', '99%'] }
    ]
  },

  // DEVELOPER FRAMEWORKS
  {
    id: 'tech-architecture',
    name: 'Technical Architecture',
    description: 'Design system architecture and technical stack',
    icon: <Code className="w-6 h-6" />,
    sections: ['System Overview', 'Frontend Stack', 'Backend Stack', 'Database Design', 'Infrastructure', 'Security & Auth', 'Third-party Services', 'Scalability Plan'],
    prompts: {
      'System Overview': 'What is the high-level system architecture?',
      'Frontend Stack': 'What frontend technologies and frameworks?',
      'Backend Stack': 'What backend languages, frameworks, and services?',
      'Database Design': 'What database(s) and data models?',
      'Infrastructure': 'What hosting, deployment, and CI/CD?',
      'Security & Auth': 'What security measures and authentication methods?',
      'Third-party Services': 'What external APIs and services?',
      'Scalability Plan': 'How will the system scale with growth?'
    },
    color: 'bg-agent-blue',
    role: 'developer',
    formFields: [
      { name: 'project_scale', label: 'Project Scale', type: 'select', options: ['Small (MVP)', 'Medium (Growth)', 'Large (Enterprise)'], required: true },
      { name: 'team_size', label: 'Dev Team Size', type: 'input', placeholder: 'Number of developers' },
      { name: 'timeline', label: 'Development Timeline', type: 'input', placeholder: 'Estimated time to build' }
    ]
  },
  {
    id: 'api-design',
    name: 'API Design Canvas',
    description: 'Plan RESTful or GraphQL API structure',
    icon: <GitBranch className="w-6 h-6" />,
    sections: ['API Purpose', 'Endpoints & Resources', 'Request/Response Formats', 'Authentication', 'Rate Limiting', 'Error Handling', 'Versioning Strategy', 'Documentation Plan'],
    prompts: {
      'API Purpose': 'What is the primary purpose and use case of this API?',
      'Endpoints & Resources': 'What are the main resources and endpoints? (GET, POST, PUT, DELETE)',
      'Request/Response Formats': 'What data formats and schemas? (JSON structure, pagination)',
      'Authentication': 'What authentication method? (JWT, OAuth, API keys)',
      'Rate Limiting': 'What rate limits and quotas will apply?',
      'Error Handling': 'How will errors be structured and communicated?',
      'Versioning Strategy': 'How will API versions be managed?',
      'Documentation Plan': 'What documentation tools and standards? (OpenAPI, Swagger)'
    },
    color: 'bg-agent-green',
    role: 'developer',
    formFields: [
      { name: 'api_type', label: 'API Type', type: 'select', options: ['REST', 'GraphQL', 'gRPC', 'WebSocket'], required: true },
      { name: 'consumers', label: 'API Consumers', type: 'select', options: ['Internal only', 'Partner APIs', 'Public API'] },
      { name: 'data_sensitivity', label: 'Data Sensitivity', type: 'select', options: ['Public', 'Internal', 'Sensitive', 'PII/Regulated'] }
    ]
  },
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Plan agile sprint with stories, tasks, and estimates',
    icon: <Calendar className="w-6 h-6" />,
    sections: ['Sprint Goal', 'User Stories', 'Technical Tasks', 'Story Points', 'Team Capacity', 'Dependencies', 'Definition of Done', 'Risks'],
    prompts: {
      'Sprint Goal': 'What is the overarching goal for this sprint?',
      'User Stories': 'What user stories will be included? (With acceptance criteria)',
      'Technical Tasks': 'What technical work is needed? (Refactoring, tech debt, setup)',
      'Story Points': 'What is the estimated complexity? (Total points)',
      'Team Capacity': 'What is the team\'s available capacity? (Days, velocity)',
      'Dependencies': 'What dependencies exist? (Other teams, external services)',
      'Definition of Done': 'What criteria must be met for completion?',
      'Risks': 'What risks or blockers might impact delivery?'
    },
    color: 'bg-agent-purple',
    role: 'developer',
    formFields: [
      { name: 'sprint_length', label: 'Sprint Length', type: 'select', options: ['1 week', '2 weeks', '3 weeks', '4 weeks'], required: true },
      { name: 'team_velocity', label: 'Team Velocity', type: 'input', placeholder: 'Average story points per sprint' },
      { name: 'sprint_number', label: 'Sprint Number', type: 'input', placeholder: 'e.g., Sprint 15' }
    ]
  },
  {
    id: 'code-review',
    name: 'Code Review Checklist',
    description: 'Systematic code review framework and quality checks',
    icon: <Clipboard className="w-6 h-6" />,
    sections: ['Code Quality', 'Architecture', 'Security', 'Performance', 'Testing', 'Documentation', 'Best Practices', 'Action Items'],
    prompts: {
      'Code Quality': 'Is the code readable, maintainable, and following style guides?',
      'Architecture': 'Does it follow architectural patterns and design principles?',
      'Security': 'Are there security vulnerabilities or exposed secrets?',
      'Performance': 'Are there performance issues or optimization opportunities?',
      'Testing': 'Is there adequate test coverage? (Unit, integration, e2e)',
      'Documentation': 'Is code documented? Are comments clear and necessary?',
      'Best Practices': 'Does it follow language/framework best practices?',
      'Action Items': 'What changes are required before merge?'
    },
    color: 'bg-agent-orange',
    role: 'developer',
    formFields: [
      { name: 'review_type', label: 'Review Type', type: 'select', options: ['Feature', 'Bug fix', 'Refactoring', 'Hotfix'], required: true },
      { name: 'pr_size', label: 'PR Size', type: 'select', options: ['Small (<200 lines)', 'Medium (200-500)', 'Large (>500)'] },
      { name: 'criticality', label: 'Code Criticality', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] }
    ]
  }
];

export const CanvasGenerator: React.FC<CanvasGeneratorProps> = ({
  open,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate | null>(null);
  const [projectContext, setProjectContext] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [generatedCanvas, setGeneratedCanvas] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'product-manager' | 'designer' | 'developer'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return null;
      }

      try {
        const text = await file.text();
        return {
          name: file.name,
          content: text.substring(0, 10000), // Limit content to prevent token overflow
          size: file.size
        } as UploadedDocument;
      } catch (error) {
        toast.error(`Failed to read file ${file.name}`);
        return null;
      }
    });

    const uploadedDocs = (await Promise.all(uploadPromises)).filter(Boolean) as UploadedDocument[];
    setDocuments(prev => [...prev, ...uploadedDocs]);
    
    if (uploadedDocs.length > 0) {
      toast.success(`Uploaded ${uploadedDocs.length} document(s)`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    toast.success('Document removed');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCanvas = async () => {
    if (!selectedTemplate || !projectContext.trim()) {
      toast.error('Please select a template and provide project context');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('canvas-generator', {
        body: {
          template: selectedTemplate,
          projectContext,
          formData,
          documents
        }
      });

      if (error) throw error;

      if (data.canvas) {
        setGeneratedCanvas(data.canvas);
        
        // Save artifact to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('artifacts').insert([{
            user_id: user.id,
            artifact_type: 'canvas',
            title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
            content: data.canvas as any,
            metadata: { template: selectedTemplate.id, formData } as any
          }]);

          // Track analytics
          await supabase.from('analytics_events').insert([{
            user_id: user.id,
            event_type: 'canvas_generated',
            event_data: { template: selectedTemplate.name } as any
          }]);
        }
        
        toast.success(`${selectedTemplate.name} generated successfully!`);
      } else {
        throw new Error('No canvas data received');
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
      toast.error('Failed to generate canvas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCanvas = () => {
    const content = Object.entries(generatedCanvas)
      .map(([section, content]) => `${section}:\n${content}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(content);
    toast.success('Canvas copied to clipboard!');
  };

  const exportCanvas = () => {
    const content = Object.entries(generatedCanvas)
      .map(([section, content]) => `${section}:\n${content}\n`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name.replace(/\s+/g, '_')}_Canvas.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Canvas exported successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            <span>Multi-Canvas Generator</span>
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose a Framework</h3>
              <p className="text-muted-foreground mb-4">
                Select a framework tailored for Product Managers, Designers, or Developers to generate a structured canvas
              </p>
            </div>
            
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 pb-4 border-b">
              <Badge 
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm hover:opacity-80"
                onClick={() => setRoleFilter('all')}
              >
                All Frameworks
              </Badge>
              <Badge 
                variant={roleFilter === 'product-manager' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm hover:opacity-80"
                onClick={() => setRoleFilter('product-manager')}
              >
                <Target className="w-3 h-3 mr-1" />
                Product Manager
              </Badge>
              <Badge 
                variant={roleFilter === 'designer' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm hover:opacity-80"
                onClick={() => setRoleFilter('designer')}
              >
                <Palette className="w-3 h-3 mr-1" />
                Designer
              </Badge>
              <Badge 
                variant={roleFilter === 'developer' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm hover:opacity-80"
                onClick={() => setRoleFilter('developer')}
              >
                <Code className="w-3 h-3 mr-1" />
                Developer
              </Badge>
            </div>

            {/* Filtered Frameworks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canvasTemplates
                .filter(template => roleFilter === 'all' || template.role === roleFilter)
                .map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${template.color} text-white`}>
                          {template.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.slice(0, 4).map((section) => (
                          <Badge key={section} variant="outline" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                        {template.sections.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.sections.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${selectedTemplate.color} text-white`}>
                  {selectedTemplate.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Back to Templates
              </Button>
            </div>

            {Object.keys(generatedCanvas).length === 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="context">Project Context</Label>
                  <Textarea
                    id="context"
                    placeholder="Describe your project, product, or initiative that you want to analyze using this framework..."
                    value={projectContext}
                    onChange={(e) => setProjectContext(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Custom form fields for selected template */}
                {selectedTemplate.formFields && selectedTemplate.formFields.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Additional Information</h4>
                    {selectedTemplate.formFields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.type === 'input' && (
                          <Input
                            id={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <Textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                            rows={3}
                          />
                        )}
                        {field.type === 'select' && field.options && (
                          <select
                            id={field.name}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                          >
                            <option value="">Select an option...</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Document upload section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold">Supporting Documents</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.md,.csv,.json,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Uploaded documents will be analyzed to enhance canvas generation
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{doc.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(doc.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={generateCanvas} 
                  disabled={isGenerating || !projectContext.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Canvas...
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Generate {selectedTemplate.name}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Generated Canvas</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyCanvas}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCanvas}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(generatedCanvas).map(([section, content]) => (
                    <Card key={section}>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{section}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm whitespace-pre-line">{content}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedCanvas({});
                    setProjectContext('');
                    setFormData({});
                    setDocuments([]);
                  }}
                  className="w-full"
                >
                  Generate New Canvas
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};