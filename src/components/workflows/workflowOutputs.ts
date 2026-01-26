// Expected outputs for each workflow - provides clarity on what users will get
export const workflowExpectedOutputs: Record<string, string> = {
  'insight-synthesizer': 'Epics et User Stories avec recommandations roadmap',
  'smart-discovery': 'Canvas validé avec personas, journeys et stories',
  'roadmap-planning': 'Roadmap trimestrielle avec jalons et KPIs',
  'feature-discovery': 'Epic structuré avec User Stories validées',
  'user-research': 'Insights actionnables et plan de recherche',
  'requirements-collection': 'Spécification complète avec priorisation MoSCoW',
  'sprint-planning': 'Backlog sprint prêt avec capacité planifiée',
  'requirements-gathering': 'Documentation des exigences structurée',
  'technical-spec': 'Spécification technique avec architecture et tests',
  'comite-projet': 'Compte-rendu et plan d\'action',
  'comite-pilotage': 'Décisions stratégiques formalisées',
  'product-launch': 'Checklist de lancement complète',
  'comite-technique': 'Validation architecture et plan de test',
  'comite-innovation': 'Business case et pitch deck',
  'epic-to-stories': 'User Stories prêtes pour le backlog',
  'design-system': 'Documentation des composants UI',
  'component-development': 'Composant testé et documenté',
  'test-planning-automation': 'Templates de tests automatisés',
};

// Get expected output for a workflow, with fallback
export function getExpectedOutput(workflowId: string): string {
  return workflowExpectedOutputs[workflowId] || 'Livrables structurés';
}
