import { supabase } from '@/integrations/supabase/client';
import { TensionAgent } from './types';

interface ProductContext {
  name: string;
  vision: string | null;
  target_audience: string | null;
  objectives: string[];
  constraints: string | null;
  metadata?: Record<string, any> | null;
}

// Default tension agent roles that can be contextualized
const TENSION_ROLES = [
  { role: 'brand_guardian', baseName: 'Gardien de Marque', baseDirective: 'Protège l\'image de marque et le positionnement.' },
  { role: 'operations', baseName: 'Réalité Terrain', baseDirective: 'Représente les contraintes opérationnelles quotidiennes.' },
  { role: 'finance', baseName: 'Réalité Financière', baseDirective: 'Questionne la rentabilité et demande des ROI.' },
  { role: 'customer', baseName: 'Avocat Utilisateur', baseDirective: 'Défend le point de vue de l\'utilisateur final.' },
];

// Context-specific tension agent templates
const INDUSTRY_TENSION_TEMPLATES: Record<string, Partial<TensionAgent>[]> = {
  'E-commerce': [
    { id: 'logistics-reality', name: 'Réalité Logistique', specialty: 'Supply chain', directive: 'Soulève les contraintes de livraison, stock et retours.' },
    { id: 'conversion-advocate', name: 'Avocat Conversion', specialty: 'Optimisation tunnel', directive: 'Challenge chaque friction dans le parcours d\'achat.' },
  ],
  'SaaS / B2B': [
    { id: 'enterprise-buyer', name: 'Acheteur Enterprise', specialty: 'Processus achat', directive: 'Représente les contraintes de procurement et compliance B2B.' },
    { id: 'churn-preventer', name: 'Gardien Rétention', specialty: 'Churn prevention', directive: 'Questionne l\'impact sur la rétention et l\'adoption.' },
  ],
  'Retail / Luxe': [
    { id: 'brand-guardian', name: 'Gardien de Marque', specialty: 'Image de marque', directive: 'Protège l\'exclusivité et le positionnement premium.' },
    { id: 'store-manager', name: 'Manager Boutique', specialty: 'Opérations terrain', directive: 'Représente la réalité du terrain et l\'impact sur les équipes.' },
  ],
  'Fintech': [
    { id: 'compliance-officer', name: 'Responsable Conformité', specialty: 'Régulation', directive: 'Soulève les contraintes réglementaires et de compliance.' },
    { id: 'security-guardian', name: 'Gardien Sécurité', specialty: 'Cybersécurité', directive: 'Challenge la sécurité des données et des transactions.' },
  ],
  'Santé': [
    { id: 'patient-advocate', name: 'Avocat Patient', specialty: 'Expérience patient', directive: 'Défend l\'accessibilité et la compréhension pour les patients.' },
    { id: 'medical-compliance', name: 'Conformité Médicale', specialty: 'Réglementation santé', directive: 'Soulève les contraintes réglementaires médicales.' },
  ],
  'Media / Contenu': [
    { id: 'creator-advocate', name: 'Avocat Créateurs', specialty: 'Économie créateurs', directive: 'Défend les intérêts des créateurs de contenu.' },
    { id: 'engagement-guardian', name: 'Gardien Engagement', specialty: 'Rétention audience', directive: 'Challenge l\'impact sur l\'engagement et la rétention.' },
  ],
};

export async function generateContextualTensionAgents(context: ProductContext | null): Promise<TensionAgent[]> {
  // If no context, return default agents
  if (!context) {
    return getDefaultTensionAgents();
  }

  const industrySector = context.metadata?.industrySector || '';
  const contextualAgents: TensionAgent[] = [];

  // Add industry-specific agents
  const industryAgents = INDUSTRY_TENSION_TEMPLATES[industrySector];
  if (industryAgents) {
    industryAgents.forEach((template, index) => {
      contextualAgents.push({
        id: template.id || `industry-${index}`,
        name: template.name || 'Agent',
        role: 'brand_guardian' as any,
        specialty: template.specialty || 'Général',
        directive: template.directive || '',
        avatar: '',
      });
    });
  }

  // Generate context-aware agents based on vision and audience
  if (context.target_audience) {
    contextualAgents.push({
      id: 'audience-advocate',
      name: `Avocat ${extractAudienceShortName(context.target_audience)}`,
      role: 'customer_advocate',
      specialty: 'Expérience utilisateur',
      directive: `Défend le point de vue de: ${context.target_audience}. S'assure que les décisions servent vraiment cette cible.`,
      avatar: '',
    });
  }

  // Add constraint-based agent if constraints exist
  if (context.constraints) {
    contextualAgents.push({
      id: 'constraint-reality',
      name: 'Réalité Contraintes',
      role: 'finance_reality',
      specialty: 'Contraintes projet',
      directive: `Rappelle les contraintes définies: ${context.constraints}. Questionne les décisions qui les ignorent.`,
      avatar: '',
    });
  }

  // Ensure we have at least 4 agents
  if (contextualAgents.length < 4) {
    const defaults = getDefaultTensionAgents();
    const existingIds = contextualAgents.map(a => a.id);
    defaults.forEach(d => {
      if (!existingIds.includes(d.id) && contextualAgents.length < 4) {
        contextualAgents.push(d);
      }
    });
  }

  return contextualAgents.slice(0, 4);
}

function extractAudienceShortName(audience: string): string {
  // Extract first significant word from audience description
  const words = audience.split(/[\s,]+/).filter(w => w.length > 3);
  if (words.length > 0) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }
  return 'Client';
}

function getDefaultTensionAgents(): TensionAgent[] {
  return [
    {
      id: 'brand-guardian',
      name: 'Gardien de Marque',
      role: 'brand_guardian',
      specialty: 'Protection de marque',
      directive: 'Protège l\'image de marque et l\'exclusivité. Questionne tout ce qui pourrait diluer le positionnement.',
      avatar: ''
    },
    {
      id: 'operations-reality',
      name: 'Réalité Terrain',
      role: 'store_manager',
      specialty: 'Opérations terrain',
      directive: 'Représente la réalité du terrain. Soulève les contraintes opérationnelles et l\'impact sur les équipes.',
      avatar: ''
    },
    {
      id: 'finance-reality',
      name: 'Réalité Financière',
      role: 'finance_reality',
      specialty: 'Viabilité économique',
      directive: 'Questionne la rentabilité et les coûts cachés. Demande des chiffres et des ROI.',
      avatar: ''
    },
    {
      id: 'customer-advocate',
      name: 'Avocat Client',
      role: 'customer_advocate',
      specialty: 'Expérience client',
      directive: 'Défend le point de vue client. Questionne si les décisions servent vraiment l\'utilisateur final.',
      avatar: ''
    }
  ];
}

// Hook to get tension agents for current context
export function useTensionAgentsForContext() {
  const [tensionAgents, setTensionAgents] = useState<TensionAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTensionAgents();
  }, []);

  const loadTensionAgents = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTensionAgents(getDefaultTensionAgents());
        return;
      }

      // Get active context
      const { data: contextData } = await supabase
        .from('product_contexts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .maybeSingle();

      if (contextData) {
        const objectives = Array.isArray(contextData.objectives) 
          ? (contextData.objectives as unknown[]).map(o => String(o))
          : [];
        const context: ProductContext = {
          name: contextData.name,
          vision: contextData.vision,
          target_audience: contextData.target_audience,
          objectives,
          constraints: contextData.constraints,
          metadata: contextData.metadata as Record<string, any> | null,
        };
        const agents = await generateContextualTensionAgents(context);
        setTensionAgents(agents);
      } else {
        setTensionAgents(getDefaultTensionAgents());
      }
    } catch (error) {
      console.error('Error loading tension agents:', error);
      setTensionAgents(getDefaultTensionAgents());
    } finally {
      setIsLoading(false);
    }
  };

  return { tensionAgents, isLoading, refreshTensionAgents: loadTensionAgents };
}

// Required imports for the hook
import { useState, useEffect } from 'react';
