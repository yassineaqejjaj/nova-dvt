import React, { useState, useRef, useEffect } from 'react';
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
import { ConfidentialityDialog } from './ConfidentialityDialog';
import { ContextSelector } from './ContextSelector';

interface CanvasGeneratorProps {
  open: boolean;
  onClose: () => void;
  prdId?: string | null;
  prdContent?: any;
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

// Canvas templates organized by segments
const canvasSegments = {
  discovery: {
    title: 'Découverte & Recherche',
    description: 'Analysez vos utilisateurs et le marché',
    templates: [] as CanvasTemplate[]
  },
  planning: {
    title: 'Planification Stratégique',
    description: 'Définissez votre stratégie et roadmap',
    templates: [] as CanvasTemplate[]
  },
  prioritization: {
    title: 'Priorisation',
    description: 'Priorisez vos initiatives',
    templates: [] as CanvasTemplate[]
  },
  design: {
    title: 'Design & UX',
    description: 'Concevez l\'expérience utilisateur',
    templates: [] as CanvasTemplate[]
  },
  development: {
    title: 'Développement',
    description: 'Planifiez l\'architecture technique',
    templates: [] as CanvasTemplate[]
  }
};

const canvasTemplates: CanvasTemplate[] = [
  // DISCOVERY & RESEARCH
  {
    id: 'swot',
    name: 'Analyse SWOT',
    description: 'Analysez Forces, Faiblesses, Opportunités et Menaces',
    icon: <TrendingUp className="w-6 h-6" />,
    sections: ['Forces', 'Faiblesses', 'Opportunités', 'Menaces'],
    prompts: {
      'Forces': 'Quels sont nos avantages ?',
      'Faiblesses': 'Quels domaines nécessitent des améliorations ?',
      'Opportunités': 'Quelles opportunités de marché existent ?',
      'Menaces': 'Quelles menaces externes devons-nous considérer ?'
    },
    color: 'bg-agent-green',
    role: 'product-manager',
    formFields: [
      { name: 'industry', label: 'Industrie/Marché', type: 'input', placeholder: 'ex : SaaS, E-commerce', required: true },
      { name: 'company_size', label: 'Taille de l\'Entreprise', type: 'select', options: ['Startup', 'Petite (1-50)', 'Moyenne (51-500)', 'Grande (500+)'] },
      { name: 'competitors', label: 'Concurrents Principaux', type: 'textarea', placeholder: 'Listez 3-5 concurrents principaux' }
    ]
  },
  {
    id: 'user-journey',
    name: 'User Journey Map',
    description: 'Cartographiez l\'expérience utilisateur complète',
    icon: <Map className="w-6 h-6" />,
    sections: ['Persona', 'Awareness', 'Consideration', 'Purchase/Action', 'Retention', 'Advocacy', 'Pain Points', 'Opportunities'],
    prompts: {
      'Persona': 'Qui est l\'utilisateur ? (Démographie, objectifs, motivations)',
      'Awareness': 'Comment l\'utilisateur découvre le produit ?',
      'Consideration': 'Que pense/ressent l\'utilisateur durant l\'évaluation ?',
      'Purchase/Action': 'Quel est le moment clé d\'action ou de conversion ?',
      'Retention': 'Comment maintenons-nous l\'engagement dans le temps ?',
      'Advocacy': 'Qu\'est-ce qui fait que les utilisateurs recommandent ?',
      'Pain Points': 'Quelles frustrations existent à chaque étape ?',
      'Opportunities': 'Où pouvons-nous améliorer l\'expérience ?'
    },
    color: 'bg-agent-blue',
    role: 'designer',
    formFields: [
      { name: 'user_type', label: 'Type d\'Utilisateur', type: 'input', placeholder: 'ex : Premier achat', required: true },
      { name: 'journey_scope', label: 'Périmètre du Parcours', type: 'select', options: ['Feature unique', 'Onboarding produit', 'Cycle complet', 'Tâche spécifique'] },
      { name: 'touchpoints', label: 'Points de Contact Clés', type: 'textarea', placeholder: 'Listez les principaux touchpoints' }
    ]
  },

  // STRATEGIC PLANNING
  {
    id: 'business-model',
    name: 'Business Model Canvas',
    description: 'Cartographiez votre modèle d\'affaires en 9 blocs',
    icon: <Grid3X3 className="w-6 h-6" />,
    sections: [
      'Key Partners', 'Key Activities', 'Key Resources', 'Value Propositions',
      'Customer Relationships', 'Channels', 'Customer Segments', 'Cost Structure', 'Revenue Streams'
    ],
    prompts: {
      'Key Partners': 'Quels sont nos partenaires et fournisseurs clés ?',
      'Key Activities': 'Quelles activités clés notre entreprise nécessite ?',
      'Key Resources': 'Quelles ressources clés nécessitons-nous ?',
      'Value Propositions': 'Quelle valeur délivrons-nous aux clients ?',
      'Customer Relationships': 'Quel type de relation avec les clients ?',
      'Channels': 'Comment atteignons-nous et livrons aux clients ?',
      'Customer Segments': 'Pour qui créons-nous de la valeur ?',
      'Cost Structure': 'Quels sont les coûts les plus importants ?',
      'Revenue Streams': 'Pour quelle valeur les clients paient-ils ?'
    },
    color: 'bg-agent-purple',
    role: 'product-manager',
    formFields: [
      { name: 'business_type', label: 'Type de Business', type: 'select', options: ['B2B', 'B2C', 'B2B2C', 'Marketplace'], required: true },
      { name: 'revenue_model', label: 'Modèle de Revenus', type: 'select', options: ['Abonnement', 'Achat unique', 'Freemium', 'Commission', 'Publicité'] },
      { name: 'target_market', label: 'Taille du Marché Cible', type: 'input', placeholder: 'Taille estimée du marché' }
    ]
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Timeline stratégique de développement produit',
    icon: <Calendar className="w-6 h-6" />,
    sections: ['Now (0-3 mois)', 'Next (3-6 mois)', 'Later (6-12 mois)', 'Vision Future', 'Dépendances', 'Métriques de Succès'],
    prompts: {
      'Now (0-3 mois)': 'Quelles sont les priorités immédiates et quick wins ?',
      'Next (3-6 mois)': 'Quelles features sont planifiées à court terme ?',
      'Later (6-12 mois)': 'Quelles initiatives long terme sont à l\'horizon ?',
      'Vision Future': 'Quelle est la vision produit au-delà de 12 mois ?',
      'Dépendances': 'Quelles dépendances externes ou blocages existent ?',
      'Métriques de Succès': 'Comment mesurerez-vous le succès à chaque étape ?'
    },
    color: 'bg-agent-blue',
    role: 'product-manager',
    formFields: [
      { name: 'product_stage', label: 'Stade du Produit', type: 'select', options: ['Pre-lancement', 'MVP', 'Croissance', 'Mature'], required: true },
      { name: 'team_capacity', label: 'Capacité de l\'Équipe', type: 'input', placeholder: 'Taille équipe développement' },
      { name: 'market_pressure', label: 'Pression Marché', type: 'select', options: ['Faible', 'Moyenne', 'Haute', 'Critique'] }
    ]
  },
  {
    id: 'okr-canvas',
    name: 'OKR Canvas',
    description: 'Définissez Objectifs et Résultats Clés',
    icon: <Flag className="w-6 h-6" />,
    sections: ['Objectif 1', 'Résultats Clés 1', 'Objectif 2', 'Résultats Clés 2', 'Objectif 3', 'Résultats Clés 3', 'Alignement & Dépendances'],
    prompts: {
      'Objectif 1': 'Quel est votre objectif principal ? (Qualitatif, inspirant)',
      'Résultats Clés 1': 'Quels sont les 3-4 résultats mesurables de succès ?',
      'Objectif 2': 'Quel est votre second objectif important ?',
      'Résultats Clés 2': 'Quels résultats mesurables soutiennent cet objectif ?',
      'Objectif 3': 'Quel est votre troisième objectif clé ?',
      'Résultats Clés 3': 'Quelles métriques traceront cet objectif ?',
      'Alignement & Dépendances': 'Comment ces OKRs s\'alignent avec les objectifs entreprise ? Quelles dépendances ?'
    },
    color: 'bg-agent-green',
    role: 'product-manager',
    formFields: [
      { name: 'timeframe', label: 'Période OKR', type: 'select', options: ['Trimestre', 'Semestre', 'Année'], required: true },
      { name: 'team', label: 'Équipe/Département', type: 'input', placeholder: 'ex : Produit, Engineering' },
      { name: 'company_okrs', label: 'OKRs Entreprise Liés', type: 'textarea', placeholder: 'Listez les OKRs entreprise pertinents' }
    ]
  },
  {
    id: 'gtm-strategy',
    name: 'Go-to-Market Strategy',
    description: 'Planifiez votre lancement et entrée marché',
    icon: <TrendingUp className="w-6 h-6" />,
    sections: ['Marché Cible', 'Proposition de Valeur', 'Stratégie Pricing', 'Canaux Marketing', 'Stratégie Vente', 'Timeline Lancement', 'Métriques Succès'],
    prompts: {
      'Marché Cible': 'Qui est votre client idéal ? Définissez segments et personas.',
      'Proposition de Valeur': 'Quelle valeur unique votre produit apporte ?',
      'Stratégie Pricing': 'Comment allez-vous pricer et packager ?',
      'Canaux Marketing': 'Quels canaux utiliserez-vous pour atteindre les clients ?',
      'Stratégie Vente': 'Comment allez-vous acquérir et convertir ?',
      'Timeline Lancement': 'Quels sont les jalons et dates clés ?',
      'Métriques Succès': 'Quels KPIs mesureront le succès du lancement ?'
    },
    color: 'bg-agent-purple',
    role: 'product-manager',
    formFields: [
      { name: 'product_type', label: 'Type de Produit', type: 'select', options: ['Nouveau Produit', 'Lancement Feature', 'Expansion Marché', 'Relancement'], required: true },
      { name: 'launch_date', label: 'Date Lancement Cible', type: 'input', placeholder: 'MM/AAAA' },
      { name: 'budget', label: 'Budget Marketing', type: 'input', placeholder: 'Budget alloué' }
    ]
  },

  // PRIORITIZATION
  {
    id: 'moscow',
    name: 'Priorisation MoSCoW',
    description: 'Priorisez les fonctionnalités : Must have, Should have, Could have, Won\'t have',
    icon: <Target className="w-6 h-6" />,
    sections: ['Must Have', 'Should Have', 'Could Have', 'Won\'t Have'],
    prompts: {
      'Must Have': 'Quelles fonctionnalités sont critiques pour le lancement ?',
      'Should Have': 'Quelles fonctionnalités sont importantes mais non critiques ?',
      'Could Have': 'Qu\'est-ce qui serait agréable à avoir si le temps le permet ?',
      'Won\'t Have': 'Qu\'est-ce que nous ne faisons explicitement pas cette fois-ci ?'
    },
    color: 'bg-agent-blue',
    role: 'product-manager',
    formFields: [
      { name: 'timeline', label: 'Calendrier du Projet', type: 'input', placeholder: 'ex : 3 mois', required: true },
      { name: 'budget', label: 'Contraintes Budgétaires', type: 'input', placeholder: 'Limitations budgétaires' },
      { name: 'stakeholders', label: 'Parties Prenantes Clés', type: 'textarea', placeholder: 'Listez les parties prenantes clés et leurs priorités' }
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

  // DESIGN & UX
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

  // DEVELOPMENT
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

// Organize templates into segments
canvasSegments.discovery.templates = canvasTemplates.filter(t => 
  ['swot', 'user-journey'].includes(t.id)
);
canvasSegments.planning.templates = canvasTemplates.filter(t => 
  ['business-model', 'product-roadmap', 'okr-canvas', 'gtm-strategy'].includes(t.id)
);
canvasSegments.prioritization.templates = canvasTemplates.filter(t => 
  ['moscow', 'rice'].includes(t.id)
);
canvasSegments.design.templates = canvasTemplates.filter(t => 
  ['design-system', 'wireframe-planning', 'ab-test'].includes(t.id)
);
canvasSegments.development.templates = canvasTemplates.filter(t => 
  ['tech-architecture', 'api-design', 'sprint-planning', 'code-review'].includes(t.id)
);

export const CanvasGenerator: React.FC<CanvasGeneratorProps> = ({
  open,
  onClose,
  prdId,
  prdContent
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate | null>(null);
  const [projectContext, setProjectContext] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [generatedCanvas, setGeneratedCanvas] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'product-manager' | 'designer' | 'developer'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfidentialityDialog, setShowConfidentialityDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [importedContext, setImportedContext] = useState<any>(null);

  // Pre-fill with PRD content if provided
  useEffect(() => {
    if (prdContent && open) {
      const contextFromPRD = `PRD Context:
Vision: ${prdContent.vision || ''}
Problem: ${prdContent.problem || ''}
Features: ${prdContent.features?.map((f: any) => f.name).join(', ') || ''}`;
      setProjectContext(contextFromPRD);
    }
  }, [prdContent, open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Show confidentiality warning before upload
    setPendingFiles(files);
    setShowConfidentialityDialog(true);
  };

  const confirmFileUpload = async () => {
    if (!pendingFiles) return;
    setShowConfidentialityDialog(false);

    const files = pendingFiles;
    setPendingFiles(null);

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
          // Load product context ID from PRD if available
          let contextId = null;
          if (prdId) {
            const { data: prdData } = await supabase
              .from('prds')
              .select('product_context_id')
              .eq('id', prdId)
              .single();
            contextId = prdData?.product_context_id || null;
          }

          await supabase.from('artifacts').insert([{
            user_id: user.id,
            artifact_type: 'canvas',
            title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
            content: data.canvas as any,
            prd_id: prdId || null,
            product_context_id: contextId,
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
            <span>Générateur Multi-Canvas</span>
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choisissez un Framework</h3>
              <p className="text-muted-foreground mb-4">
                Sélectionnez un framework adapté aux Product Managers, Designers ou Développeurs pour générer un canvas structuré
              </p>
            </div>
            
            {/* Frameworks organized by segments */}
            <div className="space-y-8">
              {Object.entries(canvasSegments).map(([segmentKey, segment]) => (
                <div key={segmentKey} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-primary">{segment.title}</h4>
                    <p className="text-sm text-muted-foreground">{segment.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {segment.templates.map((template) => (
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
                Retour aux Templates
              </Button>
            </div>

            {Object.keys(generatedCanvas).length === 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="context">Contexte Projet</Label>
                  <div className="flex gap-2 mb-2">
                    <ContextSelector
                      onContextSelected={(context) => {
                        setImportedContext(context);
                        const contextInfo = `Contexte: ${context.name}\nVision: ${context.vision || 'Non définie'}\nObjectifs: ${context.objectives.join(', ')}\nAudience: ${context.target_audience || 'Non définie'}`;
                        setProjectContext(prev => prev ? `${prev}\n\n${contextInfo}` : contextInfo);
                      }}
                      selectedContextId={importedContext?.id}
                    />
                  </div>
                  <Textarea
                    id="context"
                    placeholder="Décrivez votre projet, produit ou initiative que vous souhaitez analyser avec ce framework..."
                    value={projectContext}
                    onChange={(e) => setProjectContext(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Custom form fields for selected template */}
                {selectedTemplate.formFields && selectedTemplate.formFields.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Informations Complémentaires</h4>
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
                            <option value="">Sélectionnez une option...</option>
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
                  <ConfidentialityDialog
                    open={showConfidentialityDialog}
                    onOpenChange={setShowConfidentialityDialog}
                    onConfirm={confirmFileUpload}
                  />
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold">Documents Supports</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Télécharger des Fichiers
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
                        Les documents téléchargés seront analysés pour améliorer la génération du canvas
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
                      Génération du Canvas...
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Générer {selectedTemplate.name}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Canvas Généré</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyCanvas}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCanvas}>
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
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
                  Générer un Nouveau Canvas
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};