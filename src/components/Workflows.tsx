import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { WorkflowSteps } from './WorkflowSteps';
import { CanvasGenerator } from './CanvasGenerator';
import { StoryWriter } from './StoryWriter';
import { ImpactPlotter } from './ImpactPlotter';
import { MarketResearch } from './MarketResearch';
import { ResearchObjectivesGenerator } from './research/ResearchObjectivesGenerator';
import { ResearchPlanBuilder } from './research/ResearchPlanBuilder';
import { ResearchConductor } from './research/ResearchConductor';
import { ResearchSynthesizer } from './research/ResearchSynthesizer';
import { RequirementsScopeDefiner } from './requirements/RequirementsScopeDefiner';
import { RequirementsCollector } from './requirements/RequirementsCollector';
import { RequirementsPrioritizer } from './requirements/RequirementsPrioritizer';
import { RequirementsDocumentor } from './requirements/RequirementsDocumentor';
import { DesignTool } from './DesignTool';
import { CodeGenerator } from './CodeGenerator';
import { RoadmapPlanner } from './RoadmapPlanner';
import { ProductLaunch } from './ProductLaunch';
import { SprintPlanner } from './SprintPlanner';
import { SprintIntelligence } from './sprint-intelligence';
import { KPIGenerator } from './KPIGenerator';
import { ProductContextManager } from './ProductContextManager';
import { FeatureDiscoveryWorkflow } from './FeatureDiscoveryWorkflow';
import { TechnicalSpecification } from './TechnicalSpecification';

import EpicToUserStories from './EpicToUserStories';
import { GitToSpecsGenerator } from './GitToSpecsGenerator';
import { ProductVisionDefiner } from './ProductVisionDefiner';
import { AcceptanceCriteriaValidator } from './AcceptanceCriteriaValidator';
import { DesignSystem } from './DesignSystem';
import { InsightSynthesizer } from './InsightSynthesizer';
import { FrameworkFilter } from './FrameworkFilter';
import { useFrameworkFilter } from '@/hooks/useFrameworkFilter';
import { useWorkflowProgress } from '@/hooks/useWorkflowProgress';
import { useNavigate } from 'react-router-dom';

// New workflow components
import { 
  IntentEntryCards, 
  getIntentWorkflowIds,
  RecommendedWorkflows,
  WorkflowCard,
  getExpectedOutput 
} from './workflows';

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
  FileCode,
  Sparkles,
  CheckCircle2,
  ListTree,
  BarChart3,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  tags: string[];
  frameworks?: string[]; // Framework IDs this workflow supports
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: Array<{
    id: string;
    title: string;
    description: string;
    tool?: 'canvas' | 'story' | 'impact' | 'research' | 'design' | 'code' | 'roadmap' | 'launch' | 'sprint' | 'sprint-intelligence' | 'kpi' | 'epic-stories' | 'test-generator' | 'ac-validator' | 'git-to-specs' | 'critical-path-analyzer' | 'vision' | 'research-objectives' | 'research-plan' | 'research-conduct' | 'research-synthesize' | 'requirements-scope' | 'requirements-collection' | 'requirements-prioritization' | 'requirements-documentation';
    completed?: boolean;
  }>;
}

const workflows: Workflow[] = [
  {
    id: 'insight-synthesizer',
    name: 'Insight Synthesizer',
    description: 'Transformez vos avis stores, demandes métiers et incidents en recommandations roadmap avec Epics et User Stories',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'Discovery',
    tags: ['AI', 'Insights', 'Roadmap', 'Priorisation', 'Epic', 'Stores'],
    frameworks: ['scrum', 'less', 'spotify', 'lean', 'safe'],
    difficulty: 'Intermediate',
    estimatedTime: '30-45 min',
    steps: [
      {
        id: 'input',
        title: 'Sources de Données',
        description: 'Avis App Stores, demandes métiers, incidents',
        completed: false,
      },
      {
        id: 'synthesis',
        title: 'Synthèse & Priorisation',
        description: 'Analyse automatique et thèmes prioritaires',
        completed: false,
      },
      {
        id: 'recommendations',
        title: 'Recommandations Roadmap',
        description: 'Impact, effort et actions recommandées',
        completed: false,
      },
      {
        id: 'epics',
        title: 'Epics & User Stories',
        description: 'Génération automatique avec AC',
        completed: false,
      }
    ]
  },
  {
    id: 'smart-discovery',
    name: 'Smart Discovery Canvas',
    description: 'Transformez une idée floue en feature validée en 30 minutes avec Nova AI',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'Discovery',
    tags: ['AI', 'Discovery', 'Validation', 'Fast'],
    frameworks: ['scrum', 'less', 'spotify', 'lean'],
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    steps: [
      {
        id: 'input',
        title: 'Input Initial',
        description: 'Collez le message du stakeholder ou décrivez l\'idée',
        completed: false,
      }
    ]
  },
  // DISCOVERY
  {
    id: 'roadmap-planning',
    name: 'Planification Stratégique Roadmap',
    description: 'Créez une roadmap produit complète avec jalons trimestriels et thèmes stratégiques',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Discovery',
    tags: ['Stratégie', 'Roadmap', 'Planification', 'Long-terme'],
    frameworks: ['safe', 'waterfall', 'spotify', 'lean'],
    difficulty: 'Advanced',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'vision',
        title: 'Définir la Vision Produit',
        description: 'Établir la vision long-terme et les objectifs stratégiques',
        tool: 'vision',
        completed: false,
      },
      {
        id: 'milestones',
        title: 'Planifier les Jalons',
        description: 'Utiliser le planificateur de roadmap pour créer des jalons trimestriels',
        tool: 'roadmap',
        completed: false,
      },
      {
        id: 'impact',
        title: 'Prioriser les Initiatives',
        description: 'Évaluer les initiatives via analyse impact/effort',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'kpi-alignment',
        title: 'Alignement des Métriques',
        description: 'Générer des KPIs alignés avec les objectifs stratégiques',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'stakeholders',
        title: 'Alignement Parties Prenantes',
        description: 'Présenter et recueillir les retours sur la roadmap',
        completed: false,
      },
    ],
  },
  {
    id: 'feature-discovery',
    name: 'Discovery & Validation de Features',
    description: 'Transformez une idée en Epic structuré avec User Stories via 4 étapes guidées',
    icon: <Target className="w-6 h-6" />,
    category: 'Discovery',
    tags: ['Discovery', 'Validation', 'Epic', 'User Stories'],
    frameworks: ['scrum', 'less', 'spotify', 'lean'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'problem',
        title: 'Définition du Problème',
        description: 'Définir le problème, utilisateurs cibles et points de douleur',
        completed: false,
      },
      {
        id: 'hypothesis',
        title: 'Formulation d\'Hypothèse',
        description: 'Formuler hypothèse de solution et bénéfices attendus',
        completed: false,
      },
      {
        id: 'validation',
        title: 'Planification de Validation',
        description: 'Planifier la validation avec KPIs et méthode',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'epic',
        title: 'Génération d\'Epic',
        description: 'Générer Epic complet avec User Stories',
        completed: false,
      },
    ],
  },
  {
    id: 'user-research',
    name: 'Recherche Utilisateur & Insights',
    description: 'Planifiez, menez et synthétisez la recherche utilisateur pour générer des insights actionnables',
    icon: <Users className="w-6 h-6" />,
    category: 'Discovery',
    tags: ['Recherche', 'Utilisateurs', 'Interviews', 'Insights', 'UX'],
    frameworks: ['scrum', 'less', 'spotify', 'lean'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'objectives',
        title: 'Définir les Objectifs de Recherche',
        description: 'Définir des questions et objectifs de recherche clairs',
        tool: 'research-objectives',
        completed: false,
      },
      {
        id: 'plan',
        title: 'Plan de Recherche',
        description: 'Concevoir la méthodologie et recruter les participants',
        tool: 'research-plan',
        completed: false,
      },
      {
        id: 'conduct',
        title: 'Mener la Recherche',
        description: 'Exécuter interviews, sondages, tests d\'utilisabilité',
        tool: 'research-conduct',
        completed: false,
      },
      {
        id: 'synthesize',
        title: 'Synthétiser les Résultats',
        description: 'Analyser les données et créer des insights actionnables',
        tool: 'research-synthesize',
        completed: false,
      },
    ],
  },
  {
    id: 'requirements-collection',
    name: 'Collecte d\'Exigences',
    description: 'Définir, collecter, prioriser et documenter les exigences projet',
    icon: <FileText className="w-6 h-6" />,
    category: 'Discovery',
    tags: ['Exigences', 'Spécifications', 'MoSCoW', 'Documentation'],
    frameworks: ['waterfall', 'safe', 'scrum'],
    difficulty: 'Intermediate',
    estimatedTime: '60-90 min',
    steps: [
      { id: 'scope', title: 'Définir le Périmètre', description: 'Vision, parties prenantes et contraintes', tool: 'requirements-scope', completed: false },
      { id: 'collect', title: 'Collecter les Exigences', description: 'Exigences fonctionnelles et non-fonctionnelles', tool: 'requirements-collection', completed: false },
      { id: 'prioritize', title: 'Prioriser', description: 'MoSCoW et matrice valeur/effort', tool: 'requirements-prioritization', completed: false },
      { id: 'document', title: 'Documenter', description: 'Spécifications complètes', tool: 'requirements-documentation', completed: false },
    ],
  },
  
  // CADRAGE
  {
    id: 'sprint-planning',
    name: 'Planification de Sprint Agile',
    description: 'Planifiez et gérez le backlog de sprint avec planification de capacité et tableau kanban',
    icon: <Calendar className="w-6 h-6" />,
    category: 'Cadrage',
    tags: ['Agile', 'Sprint', 'Scrum', 'Planification', 'Kanban'],
    frameworks: ['scrum', 'less', 'safe'],
    difficulty: 'Beginner',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'backlog',
        title: 'Revue du Backlog',
        description: 'Revoir et affiner les éléments du backlog produit',
        completed: false,
      },
      {
        id: 'sprint',
        title: 'Tableau de Planification Sprint',
        description: 'Utiliser le planificateur de sprint avec visualisation kanban',
        tool: 'sprint',
        completed: false,
      },
      {
        id: 'stories',
        title: 'Affiner les User Stories',
        description: 'S\'assurer que les stories ont des critères d\'acceptation clairs',
        tool: 'story',
        completed: false,
      },
      {
        id: 'sprint-kpi',
        title: 'Métriques Sprint (Optionnel)',
        description: 'Définir les métriques et KPIs de succès du sprint',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'capacity',
        title: 'Planification de Capacité',
        description: 'Allouer le travail selon la vélocité de l\'équipe',
        completed: false,
      },
    ],
  },
  {
    id: 'requirements-gathering',
    name: 'Collecte d\'Exigences',
    description: 'Collectez et documentez les exigences produit complètes avec input des parties prenantes',
    icon: <FileText className="w-6 h-6" />,
    category: 'Cadrage',
    tags: ['Exigences', 'Documentation', 'Planification', 'Parties Prenantes'],
    frameworks: ['waterfall', 'safe'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'stakeholders',
        title: 'Identifier les Parties Prenantes',
        description: 'Lister toutes les parties prenantes et leurs besoins',
        completed: false,
      },
      {
        id: 'gather',
        title: 'Collecter les Exigences',
        description: 'Mener des interviews et collecter les exigences',
        completed: false,
      },
      {
        id: 'moscow',
        title: 'Prioriser les Exigences',
        description: 'Utiliser le framework MoSCoW pour prioriser',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'document',
        title: 'Documenter les Stories',
        description: 'Convertir les exigences en user stories',
        tool: 'story',
        completed: false,
      },
    ],
  },
  {
    id: 'technical-spec',
    name: 'Spécification Technique',
    description: 'Traduire User Story en spécification technique détaillée avec architecture, tests et DoD',
    icon: <FileCode className="w-6 h-6" />,
    category: 'Cadrage',
    tags: ['Développement', 'Technique', 'Architecture', 'Testing', 'Spécification'],
    frameworks: ['scrum', 'less', 'waterfall', 'safe'],
    difficulty: 'Advanced',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'story',
        title: 'Input Story',
        description: 'Sélectionner User Story et définir contexte technique',
        completed: false,
      },
      {
        id: 'tech',
        title: 'Exigences Tech',
        description: 'Architecture, APIs, composants et modèle de données',
        completed: false,
      },
      {
        id: 'tests',
        title: 'Cas de Test',
        description: 'Unit tests, integration tests et edge cases',
        completed: false,
      },
      {
        id: 'dod',
        title: 'Definition of Done',
        description: 'Checklist technique de validation',
        completed: false,
      },
    ],
  },

  // COMITOLOGIE
  {
    id: 'comite-projet',
    name: 'Comité Projet',
    description: 'Template prêt à l\'emploi pour préparer et animer un comité projet avec les bons outils',
    icon: <FileText className="w-6 h-6" />,
    category: 'Comitologie',
    tags: ['Comité', 'Projet', 'Gouvernance', 'Suivi', 'Décision'],
    frameworks: ['waterfall', 'safe'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'preparation',
        title: 'Préparation du Comité',
        description: 'Créer l\'ordre du jour et préparer les documents de support',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'status',
        title: 'État d\'Avancement',
        description: 'Synthétiser l\'avancement du projet vs planning',
        tool: 'roadmap',
        completed: false,
      },
      {
        id: 'kpis',
        title: 'Suivi des KPIs',
        description: 'Présenter les indicateurs clés et leur évolution',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'issues',
        title: 'Risques et Décisions',
        description: 'Identifier les blocages et points de décision',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'synthesis',
        title: 'Compte-Rendu',
        description: 'Documenter les décisions et actions à suivre',
        completed: false,
      },
    ],
  },
  {
    id: 'comite-pilotage',
    name: 'Comité de Pilotage',
    description: 'Template exécutif pour préparer un COPIL avec vision stratégique et décisions clés',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Comitologie',
    tags: ['COPIL', 'Stratégie', 'Gouvernance', 'Direction', 'Exécutif'],
    frameworks: ['safe', 'waterfall'],
    difficulty: 'Advanced',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'executive-summary',
        title: 'Synthèse Exécutive',
        description: 'Préparer le résumé exécutif pour la direction',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'strategic-alignment',
        title: 'Alignement Stratégique',
        description: 'Vérifier l\'alignement avec la roadmap et objectifs business',
        tool: 'roadmap',
        completed: false,
      },
      {
        id: 'business-impact',
        title: 'Impact Business',
        description: 'Analyser l\'impact business et le ROI attendu',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'market-position',
        title: 'Positionnement Marché',
        description: 'Présenter l\'analyse concurrentielle et positionnement',
        tool: 'research',
        completed: false,
      },
      {
        id: 'strategic-decisions',
        title: 'Décisions Stratégiques',
        description: 'Obtenir les validations et arbitrages nécessaires',
        completed: false,
      },
      {
        id: 'action-plan',
        title: 'Plan d\'Action',
        description: 'Définir les prochaines étapes et responsabilités',
        tool: 'sprint',
        completed: false,
      },
    ],
  },
  {
    id: 'product-launch',
    name: 'Exécution de Lancement Produit',
    description: 'Planifiez et exécutez un lancement produit réussi avec checklist de tâches complète',
    icon: <Rocket className="w-6 h-6" />,
    category: 'Comitologie',
    tags: ['Lancement', 'GTM', 'Marketing', 'Exécution', 'Checklist'],
    frameworks: ['waterfall', 'safe', 'spotify'],
    difficulty: 'Advanced',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'strategy',
        title: 'Stratégie de Lancement',
        description: 'Définir les objectifs, audience et positionnement',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'checklist',
        title: 'Checklist de Lancement',
        description: 'Créer une liste de tâches cross-équipes complète',
        tool: 'launch',
        completed: false,
      },
      {
        id: 'research',
        title: 'Étude de Marché',
        description: 'Analyser le marché et le paysage concurrentiel',
        tool: 'research',
        completed: false,
      },
      {
        id: 'timeline',
        title: 'Exécuter le Lancement',
        description: 'Suivre les progrès et compléter toutes les tâches',
        completed: false,
      },
    ],
  },
  {
    id: 'comite-technique',
    name: 'Comité Technique',
    description: 'Préparez votre comité technique avec architecture, risques et plan de test',
    icon: <FileCode className="w-6 h-6" />,
    category: 'Comitologie',
    tags: ['Technique', 'Architecture', 'Risques', 'Validation', 'Tests'],
    frameworks: ['waterfall', 'safe', 'scrum'],
    difficulty: 'Advanced',
    estimatedTime: '60-90 min',
    steps: [
      {
        id: 'architecture',
        title: 'Architecture Technique',
        description: 'Documenter l\'architecture système et les choix technologiques',
        tool: 'design',
        completed: false,
      },
      {
        id: 'risques-techniques',
        title: 'Analyse des Risques Techniques',
        description: 'Identifier les risques techniques et les stratégies d\'atténuation',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'plan-test',
        title: 'Plan de Tests & Validation',
        description: 'Définir la stratégie de tests (unitaires, intégration, E2E)',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'raci-tech',
        title: 'RACI Technique',
        description: 'Définir les responsabilités de l\'équipe technique',
        tool: 'kpi',
        completed: false,
      },
      {
        id: 'comite-materials',
        title: 'Préparation Matériaux Comité',
        description: 'Compiler la présentation et les documents de décision',
        completed: false,
      },
    ],
  },
  {
    id: 'comite-innovation',
    name: 'Comité Innovation',
    description: 'Présentez vos initiatives innovantes avec business case et POC',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'Comitologie',
    tags: ['Innovation', 'POC', 'Business Case', 'Transformation', 'R&D'],
    frameworks: ['spotify', 'lean', 'safe'],
    difficulty: 'Advanced',
    estimatedTime: '90-120 min',
    steps: [
      {
        id: 'idea-validation',
        title: 'Validation de l\'Idée Innovation',
        description: 'Valider l\'opportunité et l\'alignement stratégique',
        tool: 'canvas',
        completed: false,
      },
      {
        id: 'market-analysis',
        title: 'Analyse Marché & Concurrence',
        description: 'Analyser le marché, les tendances et la concurrence',
        tool: 'research',
        completed: false,
      },
      {
        id: 'business-case',
        title: 'Business Case & ROI',
        description: 'Construire le business case avec ROI projeté',
        tool: 'impact',
        completed: false,
      },
      {
        id: 'poc-plan',
        title: 'Plan POC/MVP',
        description: 'Définir le périmètre et le plan du Proof of Concept',
        tool: 'roadmap',
        completed: false,
      },
      {
        id: 'pitch-deck',
        title: 'Pitch Deck Innovation',
        description: 'Créer la présentation pour le comité',
        completed: false,
      },
    ],
  },

  // MON QUOTIDIEN  
  {
    id: 'epic-to-stories',
    name: 'Création de User Stories',
    description: 'Transformer un Epic en User Stories détaillées et prêtes pour le développement',
    icon: <FileText className="w-6 h-6" />,
    category: 'Mon Quotidien',
    tags: ['Epic', 'User Stories', 'Agile', 'Backlog', 'AI'],
    frameworks: ['scrum', 'less', 'safe', 'spotify'],
    difficulty: 'Beginner',
    estimatedTime: '20-30 min',
    steps: [
      {
        id: 'epic-definition',
        title: 'Définir l\'Epic',
        description: 'Créer ou sélectionner un Epic à décomposer en User Stories',
        tool: 'epic-stories',
        completed: false,
      },
      {
        id: 'story-generation',
        title: 'Génération des Stories',
        description: 'Utiliser l\'IA pour générer des User Stories structurées',
        tool: 'epic-stories',
        completed: false,
      },
      {
        id: 'story-review',
        title: 'Revue et Ajustement',
        description: 'Réviser et ajuster les User Stories générées',
        tool: 'epic-stories',
        completed: false,
      },
      {
        id: 'backlog-ready',
        title: 'Prêt pour le Backlog',
        description: 'Finaliser et sauvegarder les User Stories',
        completed: false,
      },
    ],
  },
  {
    id: 'design-system',
    name: 'Design System & Storybook',
    description: 'Explorez le design system complet avec tokens, composants UI et documentation Storybook',
    icon: <Palette className="w-6 h-6" />,
    category: 'Mon Quotidien',
    tags: ['Design', 'UI', 'Storybook', 'Composants', 'Documentation'],
    frameworks: ['spotify', 'lean', 'scrum', 'safe'],
    difficulty: 'Beginner',
    estimatedTime: '10 min',
    steps: [
      {
        id: 'explore',
        title: 'Explorer le Design System',
        description: 'Parcourir les tokens de couleurs, typographie et composants',
        completed: false,
      }
    ],
  },
  {
    id: 'component-development',
    name: 'Développement de Composants',
    description: 'Construisez et testez des composants UI réutilisables depuis les designs jusqu\'au code production',
    icon: <Code2 className="w-6 h-6" />,
    category: 'Mon Quotidien',
    tags: ['Développement', 'Code', 'Composants', 'Testing', 'TypeScript'],
    frameworks: ['scrum', 'spotify', 'lean'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'requirements',
        title: 'Exigences Composant',
        description: 'Définir props, variants et API du composant',
        completed: false,
      },
      {
        id: 'code',
        title: 'Implémentation Code',
        description: 'Écrire le code du composant avec TypeScript',
        tool: 'code',
        completed: false,
      },
      {
        id: 'styling',
        title: 'Styling',
        description: 'Appliquer design tokens et styles responsives',
        tool: 'design',
        completed: false,
      },
      {
        id: 'testing',
        title: 'Tests & Documentation',
        description: 'Écrire tests et documenter l\'usage',
        tool: 'code',
        completed: false,
      },
    ],
  },
  {
    id: 'test-planning-automation',
    name: 'Test Planning & Automation Setup',
    description: 'Workflow QA complet: définir le scope, identifier les chemins critiques, générer des tests automatisés',
    icon: <CheckCircle2 className="w-6 h-6" />,
    category: 'QA & Testing',
    tags: ['QA', 'Testing', 'Automation', 'AI', 'Test-Cases'],
    frameworks: ['scrum', 'safe', 'waterfall', 'less'],
    difficulty: 'Intermediate',
    estimatedTime: '45-60 min',
    steps: [
      {
        id: 'qa-scope',
        title: 'Définir le Scope QA',
        description: 'Identifier les niveaux de test nécessaires (unit, API, UI, load)',
        completed: false,
      },
      {
        id: 'critical-paths',
        title: 'Identifier les Chemins Critiques',
        description: 'Analyser les Epics et détecter les flux à risque',
        tool: 'critical-path-analyzer',
        completed: false,
      },
      {
        id: 'generate-tests',
        title: 'Générer Tests Automatisés',
        description: 'Créer des templates de test pour Playwright/Jest/Postman',
        tool: 'test-generator',
        completed: false,
      },
      {
        id: 'qa-dashboard',
        title: 'Setup QA Dashboard',
        description: 'Connecter aux métriques de test via API',
        completed: false,
      },
    ],
  },
];

export const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  
  // Workflow progress management
  const [activeWorkflow, setActiveWorkflow] = useState<{ type: string; currentStep: number } | null>(null);
  const [workflowContext, setWorkflowContext] = useState<Record<string, any>>({});
  
  // Mémoriser le callback pour éviter les re-renders infinis
  const handleStepComplete = useCallback((nextStep: number, context: any) => {
    setCurrentStep(nextStep);
    setWorkflowContext(context);
  }, []);
  
  useWorkflowProgress(activeWorkflow, handleStepComplete);
  
  // Framework filtering
  const {
    frameworks,
    selectedFrameworks,
    toggleFramework,
    clearFrameworks,
    selectAllFrameworks,
    filterWorkflows: applyFrameworkFilter,
  } = useFrameworkFilter();
  
  const [showCanvasGenerator, setShowCanvasGenerator] = useState(false);
  const [showStoryWriter, setShowStoryWriter] = useState(false);
  const [showImpactPlotter, setShowImpactPlotter] = useState(false);
  const [showMarketResearch, setShowMarketResearch] = useState(false);
  const [showDesignTool, setShowDesignTool] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [showRoadmapPlanner, setShowRoadmapPlanner] = useState(false);
  const [showProductLaunch, setShowProductLaunch] = useState(false);
  const [showSprintPlanner, setShowSprintPlanner] = useState(false);
  const [showSprintIntelligence, setShowSprintIntelligence] = useState(false);
  const [showKPIGenerator, setShowKPIGenerator] = useState(false);
  const [showContextManager, setShowContextManager] = useState(false);
  const [showFeatureDiscovery, setShowFeatureDiscovery] = useState(false);
  const [showTechnicalSpec, setShowTechnicalSpec] = useState(false);
  
  const [showEpicToStories, setShowEpicToStories] = useState(false);
  const [showACValidator, setShowACValidator] = useState(false);
  const [showGitToSpecs, setShowGitToSpecs] = useState(false);
  const [showVisionDefiner, setShowVisionDefiner] = useState(false);
  const [showResearchObjectives, setShowResearchObjectives] = useState(false);
  const [showResearchPlan, setShowResearchPlan] = useState(false);
  const [showResearchConduct, setShowResearchConduct] = useState(false);
  const [showResearchSynthesize, setShowResearchSynthesize] = useState(false);
  const [showRequirementsScope, setShowRequirementsScope] = useState(false);
  const [showRequirementsCollection, setShowRequirementsCollection] = useState(false);
  const [showRequirementsPrioritization, setShowRequirementsPrioritization] = useState(false);
  const [showRequirementsDocumentation, setShowRequirementsDocumentation] = useState(false);
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [showInsightSynthesizer, setShowInsightSynthesizer] = useState(false);

  const [activeContext, setActiveContext] = useState<{
    name: string;
    vision: string | null;
    objectives: string[];
    target_kpis: string[];
    constraints: string | null;
    target_audience: string | null;
  } | null>(null);

  // Load active context on mount and when context manager closes
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

  useEffect(() => {
    loadActiveContext();

    // Subscribe to realtime changes on product_contexts
    const channel = supabase
      .channel('product-contexts-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'product_contexts'
        },
        (payload) => {
          console.log('Context updated:', payload);
          // Reload active context when any context is updated
          loadActiveContext();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleWorkflowSelect = (workflow: Workflow) => {
    // Special cases for dedicated components
    if (workflow.id === 'feature-discovery') {
      setShowFeatureDiscovery(true);
      return;
    }
    if (workflow.id === 'technical-spec') {
      setShowTechnicalSpec(true);
      return;
    }
    if (workflow.id === 'smart-discovery') {
      navigate('/smart-discovery');
      return;
    }
    if (workflow.id === 'epic-to-stories') {
      setShowEpicToStories(true);
      return;
    }
    if (workflow.id === 'acceptance-criteria-validator') {
      setShowACValidator(true);
      return;
    }
    if (workflow.id === 'design-system') {
      setShowDesignSystem(true);
      return;
    }
    if (workflow.id === 'insight-synthesizer') {
      setShowInsightSynthesizer(true);
      return;
    }
    
    setSelectedWorkflow(workflow);
    setCurrentStep(0);
    setActiveWorkflow({ type: workflow.id, currentStep: 0 });
    setWorkflowContext({});
  };

  const handleBackToWorkflows = () => {
    setSelectedWorkflow(null);
    setCurrentStep(0);
    setActiveWorkflow(null);
    setWorkflowContext({});
  };

  const handleToolLaunch = (tool: string) => {
    console.log('🔧 Launching tool:', tool);
    try {
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
        case 'sprint-intelligence':
          setShowSprintIntelligence(true);
          break;
      case 'kpi':
        setShowKPIGenerator(true);
        break;
      case 'epic-stories':
        setShowEpicToStories(true);
        break;
      case 'test-generator':
        navigate('/test-generator');
        break;
      case 'ac-validator':
        setShowACValidator(true);
        break;
      case 'git-to-specs':
        setShowGitToSpecs(true);
        break;
      case 'critical-path-analyzer':
        navigate('/critical-path-analyzer');
        break;
      case 'vision':
        setShowVisionDefiner(true);
        break;
      case 'research-objectives':
        setShowResearchObjectives(true);
        break;
      case 'research-plan':
        setShowResearchPlan(true);
        break;
      case 'research-conduct':
        setShowResearchConduct(true);
        break;
      case 'research-synthesize':
        setShowResearchSynthesize(true);
        break;
      case 'requirements-scope':
        setShowRequirementsScope(true);
        break;
      case 'requirements-collection':
        setShowRequirementsCollection(true);
        break;
      case 'requirements-prioritization':
        setShowRequirementsPrioritization(true);
        break;
      case 'requirements-documentation':
        setShowRequirementsDocumentation(true);
        break;
      default:
        console.warn('Unknown tool:', tool);
    }
    toast.success(`Ouverture de l'outil: ${tool}`);
    } catch (e) {
      console.error('Tool launch error', e);
      toast.error("Impossible d'ouvrir l'outil");
    }
  };

  const handleCompleteWorkflow = useCallback(() => {
    toast.success(`Completed ${selectedWorkflow?.name} workflow!`, {
      description: 'Great work! Your workflow is complete.',
    });
    handleBackToWorkflows();
  }, [selectedWorkflow]);
  
  // Vérifier si le workflow est terminé
  React.useEffect(() => {
    if (selectedWorkflow && currentStep >= selectedWorkflow.steps.length) {
      handleCompleteWorkflow();
    }
  }, [currentStep, selectedWorkflow, handleCompleteWorkflow]);

  const categories = Array.from(new Set(workflows.map(w => w.category)));
  const allTags = Array.from(new Set(workflows.flatMap(w => w.tags)));
  
  // Get intent-based workflow IDs
  const intentWorkflowIds = getIntentWorkflowIds(selectedIntent);

  // Filter workflows based on all criteria including intent
  const filteredWorkflows = useMemo(() => {
    let result = workflows;
    
    // Apply intent filter first (highlights specific workflows)
    if (intentWorkflowIds.length > 0) {
      result = result.filter(w => intentWorkflowIds.includes(w.id));
    }
    
    // Then apply category and tag filters
    result = result.filter(w => {
      const categoryMatch = selectedCategory === 'all' || w.category === selectedCategory;
      const tagMatch = selectedTag === 'all' || w.tags.includes(selectedTag);
      return categoryMatch && tagMatch;
    });
    
    // Apply framework filter
    result = applyFrameworkFilter(result);
    
    // Sort by context relevance (if context is defined, prioritize related workflows)
    if (activeContext) {
      // Could add more sophisticated sorting based on context metadata
    }
    
    return result;
  }, [selectedIntent, selectedCategory, selectedTag, selectedFrameworks, activeContext, intentWorkflowIds, applyFrameworkFilter]);

  // Get recommended workflows (based on context and usage)
  const recommendedWorkflows = useMemo(() => {
    // Prioritize certain workflows when no intent is selected
    const recommendedIds = ['smart-discovery', 'insight-synthesizer', 'epic-to-stories'];
    return workflows
      .filter(w => recommendedIds.includes(w.id))
      .map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        icon: w.icon,
        estimatedTime: w.estimatedTime,
        expectedOutput: getExpectedOutput(w.id),
      }));
  }, []);

  // Check framework compatibility for a workflow
  const getCompatibleFrameworkNames = useCallback((workflow: Workflow): string[] => {
    if (!workflow.frameworks) return [];
    return frameworks
      .filter(f => selectedFrameworks.includes(f.id) && workflow.frameworks?.includes(f.id))
      .map(f => f.shortName);
  }, [frameworks, selectedFrameworks]);

  const isWorkflowCompatibleWithSelectedFrameworks = useCallback((workflow: Workflow): boolean => {
    if (selectedFrameworks.length === 0) return true;
    if (!workflow.frameworks || workflow.frameworks.length === 0) return true;
    return workflow.frameworks.some(fw => selectedFrameworks.includes(fw));
  }, [selectedFrameworks]);

  if (selectedWorkflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToWorkflows}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux Workflows
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
        <ImpactPlotter 
          open={showImpactPlotter} 
          onClose={() => setShowImpactPlotter(false)}
          activeWorkflow={activeWorkflow}
          onStepComplete={(nextStep, context) => {
            setCurrentStep(nextStep);
            setWorkflowContext(context);
            setActiveWorkflow(prev => prev ? { ...prev, currentStep: nextStep } : null);
          }}
          workflowContext={workflowContext}
        />
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
              <MarketResearch 
                activeWorkflow={activeWorkflow}
                onStepComplete={(nextStep, context) => {
                  setCurrentStep(nextStep);
                  setWorkflowContext(context);
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: nextStep } : null);
                  setShowMarketResearch(false);
                }}
                workflowContext={workflowContext}
              />
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
              <RoadmapPlanner 
                activeWorkflow={activeWorkflow}
                onStepComplete={(nextStep, context) => {
                  setCurrentStep(nextStep);
                  setWorkflowContext(context);
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: nextStep } : null);
                  setShowRoadmapPlanner(false);
                }}
                workflowContext={workflowContext}
              />
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
        {showSprintIntelligence && (
          <div className="fixed inset-0 z-50 bg-background">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50"
              onClick={() => setShowSprintIntelligence(false)}
            >
              ✕ Fermer
            </Button>
            <div className="overflow-auto h-full">
              <SprintIntelligence />
            </div>
          </div>
        )}
        {showVisionDefiner && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowVisionDefiner(false)}
              >
                ✕
              </Button>
              <ProductVisionDefiner 
                activeWorkflow={activeWorkflow}
                onStepComplete={(nextStep, context) => {
                  setCurrentStep(nextStep);
                  setWorkflowContext(context);
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: nextStep } : null);
                  setShowVisionDefiner(false);
                }}
                workflowContext={workflowContext}
              />
            </div>
          </div>
        )}
        {showResearchObjectives && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowResearchObjectives(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Objectifs de Recherche</h2>
              <ResearchObjectivesGenerator 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, objectives: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowResearchObjectives(false);
                }}
                workflowContext={workflowContext}
              />
            </div>
          </div>
        )}
        {showResearchPlan && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowResearchPlan(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Plan de Recherche</h2>
              <ResearchPlanBuilder 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, plan: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowResearchPlan(false);
                }}
                workflowContext={workflowContext}
              />
            </div>
          </div>
        )}
        {showResearchConduct && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowResearchConduct(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Mener la Recherche</h2>
              <ResearchConductor 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, researchData: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowResearchConduct(false);
                }}
                workflowContext={workflowContext}
              />
            </div>
          </div>
        )}
        {showResearchSynthesize && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowResearchSynthesize(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Synthèse de Recherche</h2>
              <ResearchSynthesizer 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, synthesis: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowResearchSynthesize(false);
                }}
                workflowContext={workflowContext}
              />
            </div>
          </div>
        )}
        {showRequirementsScope && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowRequirementsScope(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Définir le Périmètre</h2>
              <RequirementsScopeDefiner 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, scope: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowRequirementsScope(false);
                }}
                onClose={() => setShowRequirementsScope(false)}
              />
            </div>
          </div>
        )}
        {showRequirementsCollection && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowRequirementsCollection(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Collecter les Exigences</h2>
              <RequirementsCollector 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, requirements: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowRequirementsCollection(false);
                }}
                onClose={() => setShowRequirementsCollection(false)}
              />
            </div>
          </div>
        )}
        {showRequirementsPrioritization && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowRequirementsPrioritization(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Prioriser les Exigences</h2>
              <RequirementsPrioritizer 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, prioritization: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowRequirementsPrioritization(false);
                }}
                onClose={() => setShowRequirementsPrioritization(false)}
              />
            </div>
          </div>
        )}
        {showRequirementsDocumentation && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg border shadow-lg p-6">
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowRequirementsDocumentation(false)}
              >
                ✕
              </Button>
              <h2 className="text-2xl font-bold mb-4">Documenter les Spécifications</h2>
              <RequirementsDocumentor 
                onSave={(data) => {
                  setCurrentStep(currentStep + 1);
                  setWorkflowContext({ ...workflowContext, documentation: data });
                  setActiveWorkflow(prev => prev ? { ...prev, currentStep: currentStep + 1 } : null);
                  setShowRequirementsDocumentation(false);
                }}
                onClose={() => setShowRequirementsDocumentation(false)}
              />
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
          onContextSelected={loadActiveContext}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with context */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflows Produit</h2>
          <p className="text-sm text-muted-foreground">
            Processus guidés étape par étape pour le product management
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {activeContext && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              <Layers className="w-3 h-3 mr-1" />
              {activeContext.name}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContextManager(true)}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Contextes
          </Button>
        </div>
      </div>

      {/* Collapsible Filters - positioned right after context */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          <Filter className="w-4 h-4" />
          Filtres avancés
          <Badge variant="secondary" className="text-xs">
            {selectedCategory !== 'all' || selectedTag !== 'all' || selectedFrameworks.length > 0 ? 'Actifs' : ''}
          </Badge>
        </summary>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                Catégorie & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Catégorie</Label>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Toutes
                  </Badge>
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  <Badge
                    variant={selectedTag === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedTag('all')}
                  >
                    Tous
                  </Badge>
                  {allTags.slice(0, 12).map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length > 12 && (
                    <Badge variant="outline" className="text-xs">
                      +{allTags.length - 12}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Framework Filter - made more compact */}
          <FrameworkFilter
            frameworks={frameworks}
            selectedFrameworks={selectedFrameworks}
            onToggleFramework={toggleFramework}
            onClearAll={clearFrameworks}
            onSelectAll={selectAllFrameworks}
            className="border-border/50"
          />
        </div>
      </details>

      {/* Intent-based entry points - KEY IMPROVEMENT */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Target className="w-4 h-4" />
          Par où commencer ?
        </div>
        <IntentEntryCards
          selectedIntent={selectedIntent}
          onSelectIntent={(intent) => {
            setSelectedIntent(intent);
            // Reset other filters when intent is selected
            if (intent) {
              setSelectedCategory('all');
              setSelectedTag('all');
            }
          }}
        />
      </div>

      {/* Recommended workflows - show only when no intent selected */}
      {!selectedIntent && (
        <RecommendedWorkflows
          workflows={recommendedWorkflows}
          contextName={activeContext?.name || null}
          onSelect={(workflowId) => {
            const workflow = workflows.find(w => w.id === workflowId);
            if (workflow) handleWorkflowSelect(workflow);
          }}
        />
      )}

      {/* Workflows by Category - using new WorkflowCard */}
      {categories.filter(cat => filteredWorkflows.some(w => w.category === cat)).map(category => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>{category}</span>
            <Badge variant="secondary" className="text-xs">
              {filteredWorkflows.filter(w => w.category === category).length}
            </Badge>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredWorkflows
              .filter(workflow => workflow.category === category)
              .map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  expectedOutput={getExpectedOutput(workflow.id)}
                  isCompatibleWithFramework={isWorkflowCompatibleWithSelectedFrameworks(workflow)}
                  selectedFrameworks={selectedFrameworks}
                  compatibleFrameworkNames={getCompatibleFrameworkNames(workflow)}
                  onSelect={() => handleWorkflowSelect(workflow)}
                />
              ))}
          </div>
        </div>
      ))}

      {/* Removed the verbose "Benefits" card to reduce vertical space */}
      
      <ProductContextManager 
        open={showContextManager} 
        onOpenChange={setShowContextManager}
      />
      
      <FeatureDiscoveryWorkflow
        open={showFeatureDiscovery}
        onOpenChange={setShowFeatureDiscovery}
        activeContext={activeContext}
      />
      
      <TechnicalSpecification
        open={showTechnicalSpec}
        onClose={() => setShowTechnicalSpec(false)}
      />
      
      
      {showEpicToStories && (
        <div className="fixed inset-0 z-50 bg-background">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50"
            onClick={() => setShowEpicToStories(false)}
          >
            ✕ Fermer
          </Button>
          <EpicToUserStories />
        </div>
      )}
      
      {showGitToSpecs && (
        <div className="fixed inset-0 z-50 bg-background overflow-auto">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50"
            onClick={() => setShowGitToSpecs(false)}
          >
            ✕ Fermer
          </Button>
          <div className="container mx-auto p-6">
            <GitToSpecsGenerator />
          </div>
        </div>
      )}
      
      {showGitToSpecs && (
        <div className="fixed inset-0 z-50 bg-background overflow-auto">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50"
            onClick={() => setShowGitToSpecs(false)}
          >
            ✕ Fermer
          </Button>
          <div className="container mx-auto p-6">
            <GitToSpecsGenerator />
          </div>
        </div>
      )}
      
      {showACValidator && (
        <div className="fixed inset-0 z-50 bg-background overflow-auto">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50"
            onClick={() => setShowACValidator(false)}
          >
            ✕ Fermer
          </Button>
          <div className="container mx-auto p-6">
            <AcceptanceCriteriaValidator />
          </div>
        </div>
      )}
      
      {showDesignSystem && (
        <div className="fixed inset-0 z-50 bg-background overflow-auto">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50"
            onClick={() => setShowDesignSystem(false)}
          >
            ✕ Fermer
          </Button>
          <DesignSystem />
        </div>
      )}
      
      <InsightSynthesizer 
        open={showInsightSynthesizer} 
        onClose={() => setShowInsightSynthesizer(false)} 
      />
    </div>
  );
};
