import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'fr' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

/* ─── Translations ─── */
const translations: Record<string, Record<Lang, string>> = {
  // Header nav
  'nav.vision': { en: 'Vision', fr: 'Vision' },
  'nav.product': { en: 'Product', fr: 'Produit' },
  'nav.useCases': { en: 'Use Cases', fr: 'Cas d\'usage' },
  'nav.security': { en: 'Security', fr: 'Sécurité' },
  'nav.login': { en: 'Log in', fr: 'Se connecter' },
  'nav.demo': { en: 'Book a demo', fr: 'Réserver une démo' },

  // Landing – Hero
  'landing.hero.label': { en: 'Devoteam AI Factory', fr: 'Devoteam AI Factory' },
  'landing.hero.h1.1': { en: 'Nova is not just an assistant.', fr: 'Nova n\'est pas un simple assistant.' },
  'landing.hero.h1.2': { en: 'It is the operating system for augmented teams.', fr: 'C\'est le système d\'exploitation des équipes augmentées.' },
  'landing.hero.desc': { en: 'Product, Design, Engineering and AI agents working in one system.', fr: 'Product, Design, Engineering et agents IA travaillant dans un seul système.' },
  'landing.hero.cta1': { en: 'Discover Nova', fr: 'Découvrir Nova' },
  'landing.hero.tag1': { en: 'Context-aware', fr: 'Contextuel' },
  'landing.hero.tag2': { en: 'Agent-driven', fr: 'Piloté par agents' },
  'landing.hero.tag3': { en: 'Built for delivery', fr: 'Conçu pour livrer' },

  // Landing – Manifest
  'landing.manifest.h2.1': { en: 'Teams do not need more tools.', fr: 'Les équipes n\'ont pas besoin de plus d\'outils.' },
  'landing.manifest.h2.2': { en: 'They need more coherence.', fr: 'Elles ont besoin de plus de cohérence.' },
  'landing.manifest.desc': { en: 'Nova connects context, workflows and AI into one experience.', fr: 'Nova connecte contexte, workflows et IA en une seule expérience.' },

  // Landing – Value Blocks
  'landing.value.context.label': { en: 'CONTEXT', fr: 'CONTEXTE' },
  'landing.value.context.title': { en: 'Context becomes active', fr: 'Le contexte devient actif' },
  'landing.value.context.text': { en: 'Nova understands projects, history, documents and decisions.', fr: 'Nova comprend les projets, l\'historique, les documents et les décisions.' },
  'landing.value.agents.label': { en: 'AGENTS', fr: 'AGENTS' },
  'landing.value.agents.title': { en: 'AI becomes structured', fr: 'L\'IA devient structurée' },
  'landing.value.agents.text': { en: 'Product, Design, Dev and QA roles activated dynamically.', fr: 'Les rôles Product, Design, Dev et QA activés dynamiquement.' },
  'landing.value.flow.label': { en: 'FLOW', fr: 'FLUX' },
  'landing.value.flow.title': { en: 'Work becomes continuous', fr: 'Le travail devient continu' },
  'landing.value.flow.text': { en: 'From idea to delivery without losing context.', fr: 'De l\'idée à la livraison sans perdre le contexte.' },
  'landing.value.cta': { en: 'See how it works', fr: 'Voir comment ça marche' },

  // Landing – Product Immersive
  'landing.product.h2.1': { en: 'One system.', fr: 'Un seul système.' },
  'landing.product.h2.2': { en: 'Multiple forms of intelligence.', fr: 'Plusieurs formes d\'intelligence.' },
  'landing.product.desc': { en: 'Nova combines context, workflows, artefacts and agents in one workspace.', fr: 'Nova combine contexte, workflows, artefacts et agents dans un espace unique.' },
  'landing.product.cta': { en: 'Explore the product', fr: 'Explorer le produit' },

  // Landing – Use Cases
  'landing.useCases.label': { en: 'USE CASES', fr: 'CAS D\'USAGE' },
  'landing.useCases.h2': { en: 'Built for how teams actually work', fr: 'Conçu pour la façon dont les équipes travaillent vraiment' },
  'landing.useCases.onboarding.label': { en: 'ONBOARDING', fr: 'ONBOARDING' },
  'landing.useCases.onboarding.title': { en: 'Mission onboarding', fr: 'Onboarding mission' },
  'landing.useCases.onboarding.desc': { en: 'Get a new team member up to speed in minutes, not weeks.', fr: 'Mettez un nouveau membre d\'équipe à niveau en minutes, pas en semaines.' },
  'landing.useCases.discovery.label': { en: 'DISCOVERY', fr: 'DISCOVERY' },
  'landing.useCases.discovery.title': { en: 'Feature discovery', fr: 'Découverte de fonctionnalités' },
  'landing.useCases.discovery.desc': { en: 'From user need to validated feature with full traceability.', fr: 'Du besoin utilisateur à la fonctionnalité validée avec traçabilité complète.' },
  'landing.useCases.sprint.label': { en: 'SPRINT', fr: 'SPRINT' },
  'landing.useCases.sprint.title': { en: 'Sprint planning', fr: 'Planification de sprint' },
  'landing.useCases.sprint.desc': { en: 'Real capacity data, not optimistic guesses.', fr: 'Des données de capacité réelles, pas des estimations optimistes.' },
  'landing.useCases.meetings.label': { en: 'MEETINGS', fr: 'RÉUNIONS' },
  'landing.useCases.meetings.title': { en: 'Meeting to action', fr: 'De la réunion à l\'action' },
  'landing.useCases.meetings.desc': { en: 'Turn any meeting into structured decisions and artefacts.', fr: 'Transformez chaque réunion en décisions structurées et artefacts.' },

  // Landing – Metrics
  'landing.metrics.productivity': { en: 'productivity', fr: 'productivité' },
  'landing.metrics.redundancy': { en: 'redundancy', fr: 'redondance' },
  'landing.metrics.coherence': { en: 'coherence', fr: 'cohérence' },

  // Landing – Differentiation
  'landing.diff.1.from': { en: 'Not a chatbot', fr: 'Pas un chatbot' },
  'landing.diff.1.to': { en: 'builds outputs', fr: 'produit des livrables' },
  'landing.diff.2.from': { en: 'Not a copilot', fr: 'Pas un copilote' },
  'landing.diff.2.to': { en: 'collaborates', fr: 'collabore' },
  'landing.diff.3.from': { en: 'Not a tool', fr: 'Pas un outil' },
  'landing.diff.3.to': { en: 'becomes your system', fr: 'devient votre système' },

  // Landing – Governance
  'landing.gov.label': { en: 'GOVERNANCE', fr: 'GOUVERNANCE' },
  'landing.gov.h2': { en: 'Built with governance in mind', fr: 'Conçu avec la gouvernance en tête' },
  'landing.gov.1': { en: 'Human validation at every critical step', fr: 'Validation humaine à chaque étape critique' },
  'landing.gov.2': { en: 'Traceable artefacts linked to context and decisions', fr: 'Artefacts traçables liés au contexte et aux décisions' },
  'landing.gov.3': { en: 'Controlled context with granular access', fr: 'Contexte contrôlé avec accès granulaire' },

  // Landing – Final CTA
  'landing.cta.h2.1': { en: 'From AI-aware teams', fr: 'Des équipes sensibilisées à l\'IA' },
  'landing.cta.h2.2': { en: 'to AI-native organizations.', fr: 'aux organisations AI-native.' },
  'landing.cta.desc': { en: 'Nova is the layer in between.', fr: 'Nova est la couche qui fait le lien.' },

  // Footer
  'footer.overview': { en: 'Overview', fr: 'Aperçu' },
  'footer.features': { en: 'Features', fr: 'Fonctionnalités' },
  'footer.agents': { en: 'Agents', fr: 'Agents' },
  'footer.workflows': { en: 'Workflows', fr: 'Workflows' },
  'footer.artefacts': { en: 'Artefacts', fr: 'Artefacts' },
  'footer.vision': { en: 'Vision', fr: 'Vision' },
  'footer.useCases': { en: 'Use Cases', fr: 'Cas d\'usage' },
  'footer.about': { en: 'About', fr: 'À propos' },
  'footer.contact': { en: 'Contact', fr: 'Contact' },

  // Vision page
  'vision.hero.label': { en: 'Vision', fr: 'Vision' },
  'vision.hero.h1': { en: 'Vision of Nova', fr: 'La vision de Nova' },
  'vision.hero.sub': { en: 'Nova: Not Only a Virtual Assistant', fr: 'Nova : Not Only a Virtual Assistant' },
  'vision.shift.h2': { en: 'A simple shift', fr: 'Un changement simple' },
  'vision.shift.p1': { en: 'Most AI tools today are isolated.', fr: 'La plupart des outils IA aujourd\'hui sont isolés.' },
  'vision.shift.p1b': { en: 'One assistant. One prompt. One answer.', fr: 'Un assistant. Un prompt. Une réponse.' },
  'vision.shift.p2': { en: 'But real work doesn\'t happen like that.', fr: 'Mais le vrai travail ne fonctionne pas comme ça.' },
  'vision.shift.p3a': { en: 'Work is collaborative.', fr: 'Le travail est collaboratif.' },
  'vision.shift.p3b': { en: 'It depends on context.', fr: 'Il dépend du contexte.' },
  'vision.shift.p3c': { en: 'It evolves over time.', fr: 'Il évolue dans le temps.' },
  'vision.shift.p4': { en: 'Nova was built to match that reality.', fr: 'Nova a été conçu pour répondre à cette réalité.' },
  'vision.our.label': { en: 'OUR VISION', fr: 'NOTRE VISION' },
  'vision.our.h2': { en: 'Build the first system that organizes work between humans and AI.', fr: 'Construire le premier système qui organise le travail entre humains et IA.' },
  'vision.our.p1': { en: 'Not another tool.', fr: 'Pas un outil de plus.' },
  'vision.our.p1b': { en: 'A system that structures, orchestrates, and accelerates.', fr: 'Un système qui structure, orchestre et accélère.' },
  'vision.our.p2': { en: 'Nova acts like a Work OS:', fr: 'Nova fonctionne comme un Work OS :' },
  'vision.our.b1': { en: 'It understands the full context of a mission or product', fr: 'Il comprend le contexte complet d\'une mission ou d\'un produit' },
  'vision.our.b2': { en: 'It coordinates multiple specialized agents', fr: 'Il coordonne plusieurs agents spécialisés' },
  'vision.our.b3': { en: 'It produces consistent, traceable, and usable outputs', fr: 'Il produit des livrables cohérents, traçables et exploitables' },
  'vision.why.label': { en: 'WHY NOVA EXISTS', fr: 'POURQUOI NOVA EXISTE' },
  'vision.why.h2': { en: 'Companies face a simple problem', fr: 'Les entreprises font face à un problème simple' },
  'vision.why.p1': { en: 'Too much information.', fr: 'Trop d\'information.' },
  'vision.why.p1b': { en: 'Not enough structure.', fr: 'Pas assez de structure.' },
  'vision.why.p1c': { en: 'And AI that is still disconnected from real workflows.', fr: 'Et une IA encore déconnectée des vrais workflows.' },
  'vision.why.p2': { en: 'Existing solutions:', fr: 'Les solutions existantes :' },
  'vision.why.b1': { en: "don't retain context", fr: 'ne retiennent pas le contexte' },
  'vision.why.b2': { en: "don't collaborate with each other", fr: 'ne collaborent pas entre elles' },
  'vision.why.b3': { en: "don't make reasoning visible", fr: 'ne rendent pas le raisonnement visible' },
  'vision.why.p3': { en: 'Nova was designed to fix this.', fr: 'Nova a été conçu pour résoudre ça.' },
  'vision.why.p4': { en: 'A system able to:', fr: 'Un système capable de :' },
  'vision.why.b4': { en: 'coordinate multiple agents reliably', fr: 'coordonner plusieurs agents de manière fiable' },
  'vision.why.b5': { en: 'maintain a dynamic project memory', fr: 'maintenir une mémoire de projet dynamique' },
  'vision.why.b6': { en: 'make decisions explainable', fr: 'rendre les décisions explicables' },
  'vision.change.label': { en: 'WHAT NOVA CHANGES', fr: 'CE QUE NOVA CHANGE' },
  'vision.change.h2.1': { en: 'You don\'t work alone with AI.', fr: 'Vous ne travaillez pas seul avec l\'IA.' },
  'vision.change.h2.2': { en: 'You work with an augmented team.', fr: 'Vous travaillez avec une équipe augmentée.' },
  'vision.change.desc.1': { en: 'A Product Manager, a Designer, a Developer…', fr: 'Un Product Manager, un Designer, un Développeur…' },
  'vision.change.desc.2': { en: 'each supported by specialized agents that can:', fr: 'chacun soutenu par des agents spécialisés qui peuvent :' },
  'vision.change.b1': { en: 'understand full context', fr: 'comprendre le contexte complet' },
  'vision.change.b2': { en: 'collaborate with each other', fr: 'collaborer entre eux' },
  'vision.change.b3': { en: 'continuously improve output quality', fr: 'améliorer continuellement la qualité des livrables' },
  'vision.change.m1': { en: 'More', fr: 'Plus de' },
  'vision.change.m1l': { en: 'consistency', fr: 'cohérence' },
  'vision.change.m2': { en: 'Less', fr: 'Moins de' },
  'vision.change.m2l': { en: 'information loss', fr: 'perte d\'information' },
  'vision.change.m3': { en: 'Real', fr: 'Une vraie' },
  'vision.change.m3l': { en: 'acceleration in delivery', fr: 'accélération de la livraison' },
  'vision.ambition.label': { en: 'OUR AMBITION', fr: 'NOTRE AMBITION' },
  'vision.ambition.h2': { en: 'Turn AI into a work system, not a feature.', fr: 'Transformer l\'IA en système de travail, pas en fonctionnalité.' },
  'vision.ambition.b1': { en: 'where decisions are traceable', fr: 'où les décisions sont traçables' },
  'vision.ambition.b2': { en: 'where human + AI collaboration is seamless', fr: 'où la collaboration humain + IA est fluide' },
  'vision.ambition.b3': { en: "where productivity doesn't come at the cost of quality", fr: 'où la productivité ne se fait pas au détriment de la qualité' },
  'vision.ambition.p1': { en: 'Nova is not an assistant.', fr: 'Nova n\'est pas un assistant.' },
  'vision.ambition.p2': { en: 'It\'s the layer that changes how teams think, decide, and build.', fr: 'C\'est la couche qui change comment les équipes pensent, décident et construisent.' },

  // Product page
  'product.hero.label': { en: 'Product', fr: 'Produit' },
  'product.hero.h1': { en: 'Nova: Not Only a Virtual Assistant', fr: 'Nova : Not Only a Virtual Assistant' },
  'product.hero.p1': { en: 'Nova is a Work OS powered by AI agents.', fr: 'Nova est un Work OS propulsé par des agents IA.' },
  'product.hero.p2': { en: 'It doesn\'t just answer questions.', fr: 'Il ne se contente pas de répondre aux questions.' },
  'product.hero.p3': { en: 'It structures how work gets done.', fr: 'Il structure la manière dont le travail se fait.' },
  'product.how.label': { en: 'HOW IT WORKS', fr: 'COMMENT ÇA MARCHE' },
  'product.how.h2': { en: 'Built on three core layers', fr: 'Construit sur trois couches fondamentales' },
  'product.how.1.label': { en: 'CONTEXT', fr: 'CONTEXTE' },
  'product.how.1.title': { en: 'Everything starts with context', fr: 'Tout commence par le contexte' },
  'product.how.1.b1': { en: 'Mission context', fr: 'Contexte de mission' },
  'product.how.1.b2': { en: 'Product context', fr: 'Contexte produit' },
  'product.how.1.b3': { en: 'Documents, decisions, history', fr: 'Documents, décisions, historique' },
  'product.how.1.footer': { en: 'Nova keeps a dynamic memory of your work so nothing gets lost.', fr: 'Nova maintient une mémoire dynamique de votre travail pour que rien ne se perde.' },
  'product.how.2.label': { en: 'AGENTS', fr: 'AGENTS' },
  'product.how.2.title': { en: 'Each role can be augmented', fr: 'Chaque rôle peut être augmenté' },
  'product.how.2.b1': { en: 'Product Manager agent', fr: 'Agent Product Manager' },
  'product.how.2.b2': { en: 'Designer agent', fr: 'Agent Designer' },
  'product.how.2.b3': { en: 'Developer agent', fr: 'Agent Développeur' },
  'product.how.2.b4': { en: 'QA / Data / Strategy agents', fr: 'Agents QA / Data / Stratégie' },
  'product.how.2.footer': { en: "They don't work in isolation. They collaborate, challenge each other, and improve outputs.", fr: 'Ils ne travaillent pas en silo. Ils collaborent, se challengent mutuellement et améliorent les résultats.' },
  'product.how.3.label': { en: 'WORKFLOWS', fr: 'WORKFLOWS' },
  'product.how.3.title': { en: 'Structured execution', fr: 'Exécution structurée' },
  'product.how.3.b1': { en: 'Discovery', fr: 'Discovery' },
  'product.how.3.b2': { en: 'Product definition', fr: 'Définition produit' },
  'product.how.3.b3': { en: 'Delivery', fr: 'Livraison' },
  'product.how.3.b4': { en: 'QA and iteration', fr: 'QA et itération' },
  'product.how.3.footer': { en: 'Each workflow produces real artefacts: PRDs, user stories, roadmaps, technical specs.', fr: 'Chaque workflow produit de vrais artefacts : PRD, user stories, roadmaps, spécifications techniques.' },
  'product.diff.label': { en: 'WHAT MAKES NOVA DIFFERENT', fr: 'CE QUI REND NOVA DIFFÉRENT' },
  'product.diff.h2.1': { en: 'Most AI tools are assistants.', fr: 'La plupart des outils IA sont des assistants.' },
  'product.diff.h2.2': { en: 'Nova is a system.', fr: 'Nova est un système.' },
  'product.diff.b1': { en: 'Multi-agent coordination (not a single model)', fr: 'Coordination multi-agents (pas un seul modèle)' },
  'product.diff.b2': { en: 'Persistent context across time', fr: 'Contexte persistant dans le temps' },
  'product.diff.b3': { en: 'Traceable reasoning and decisions', fr: 'Raisonnement et décisions traçables' },
  'product.diff.b4': { en: 'Built for real product teams', fr: 'Conçu pour les vraies équipes produit' },
  'product.get.label': { en: 'WHAT YOU GET', fr: 'CE QUE VOUS OBTENEZ' },
  'product.get.h2': { en: 'Nova turns scattered work into structured execution.', fr: 'Nova transforme le travail dispersé en exécution structurée.' },
  'product.get.1': { en: 'Faster onboarding on any project', fr: 'Onboarding plus rapide sur tout projet' },
  'product.get.2': { en: 'Structured and consistent deliverables', fr: 'Livrables structurés et cohérents' },
  'product.get.3': { en: 'Reduced cognitive load', fr: 'Charge cognitive réduite' },
  'product.get.4': { en: 'Higher quality decisions', fr: 'Décisions de meilleure qualité' },
  'product.cta.h2': { en: 'Ready to see Nova in action?', fr: 'Prêt à voir Nova en action ?' },

  // Use Cases page
  'useCases.hero.label': { en: 'Methodology', fr: 'Méthodologie' },
  'useCases.hero.h1.1': { en: 'The Double Diamond,', fr: 'Le Double Diamant,' },
  'useCases.hero.h1.2': { en: 'powered by AI', fr: 'propulsé par l\'IA' },
  'useCases.hero.desc': { en: 'Nova follows the Double Diamond framework — the proven design methodology — and supercharges every phase with AI agents.', fr: 'Nova suit le framework Double Diamant — la méthodologie de design éprouvée — et décuple chaque phase avec des agents IA.' },
  'useCases.how.label': { en: 'How it works', fr: 'Comment ça marche' },
  'useCases.how.h2': { en: 'From problem to solution, structured and traceable', fr: 'Du problème à la solution, structuré et traçable' },
  'useCases.how.desc': { en: 'The Double Diamond splits every initiative into four phases: two divergent, two convergent. Nova maps its tools, agents, and workflows to each.', fr: 'Le Double Diamant divise chaque initiative en quatre phases : deux divergentes, deux convergentes. Nova associe ses outils, agents et workflows à chacune.' },
  'useCases.discover': { en: 'Discover', fr: 'Découvrir' },
  'useCases.define': { en: 'Define', fr: 'Définir' },
  'useCases.develop': { en: 'Develop', fr: 'Développer' },
  'useCases.deliver': { en: 'Deliver', fr: 'Livrer' },
  'useCases.diverge': { en: 'Diverge', fr: 'Diverger' },
  'useCases.converge': { en: 'Converge', fr: 'Converger' },
  'useCases.diamond1': { en: 'Diamond 1 — Problem space', fr: 'Diamant 1 — Espace problème' },
  'useCases.diamond2': { en: 'Diamond 2 — Solution space', fr: 'Diamant 2 — Espace solution' },
  'useCases.phase1.label': { en: 'Phase 1 — Discover', fr: 'Phase 1 — Découvrir' },
  'useCases.phase1.h2': { en: 'Explore the problem space', fr: 'Explorer l\'espace problème' },
  'useCases.phase1.desc': { en: 'Diverge. Gather signals, understand users, challenge assumptions. Nova helps you cast a wide net without losing structure.', fr: 'Diverger. Recueillir les signaux, comprendre les utilisateurs, remettre en question les hypothèses. Nova vous aide à ratisser large sans perdre la structure.' },
  'useCases.phase1.tools': { en: 'NOVA TOOLS', fr: 'OUTILS NOVA' },
  'useCases.phase1.b1': { en: 'Smart Discovery Canvas — AI-guided problem framing', fr: 'Smart Discovery Canvas — cadrage de problème guidé par l\'IA' },
  'useCases.phase1.b2': { en: 'User Research workflows — objectives, plans, synthesis', fr: 'Workflows User Research — objectifs, plans, synthèse' },
  'useCases.phase1.b3': { en: 'Market Research — competitive & trend analysis', fr: 'Market Research — analyse concurrentielle et tendances' },
  'useCases.phase1.b4': { en: 'User Persona Builder — data-driven persona creation', fr: 'User Persona Builder — création de personas basée sur les données' },
  'useCases.phase1.b5': { en: 'Meeting Minutes — extract insights from any meeting', fr: 'Meeting Minutes — extraire les insights de toute réunion' },
  'useCases.phase1.footer': { en: '→ From scattered inputs to structured understanding.', fr: '→ Des inputs dispersés à une compréhension structurée.' },
  'useCases.phase2.label': { en: 'Phase 2 — Define', fr: 'Phase 2 — Définir' },
  'useCases.phase2.h2': { en: 'Frame the right problem', fr: 'Cadrer le bon problème' },
  'useCases.phase2.desc': { en: 'Converge. Synthesize findings into a clear problem statement, vision, and priorities. Nova helps you align before you build.', fr: 'Converger. Synthétiser les résultats en un énoncé de problème clair, une vision et des priorités. Nova vous aide à aligner avant de construire.' },
  'useCases.phase2.b1': { en: 'Product Vision Definer — mission, audience, value prop', fr: 'Product Vision Definer — mission, audience, proposition de valeur' },
  'useCases.phase2.b2': { en: 'Instant PRD — structured product requirements in minutes', fr: 'Instant PRD — exigences produit structurées en quelques minutes' },
  'useCases.phase2.b3': { en: 'KPI Generator — measurable outcomes tied to objectives', fr: 'KPI Generator — résultats mesurables liés aux objectifs' },
  'useCases.phase2.b4': { en: 'Insight Synthesizer — patterns from research data', fr: 'Insight Synthesizer — patterns issus des données de recherche' },
  'useCases.phase2.b5': { en: 'Product Context — persistent strategic alignment', fr: 'Product Context — alignement stratégique persistant' },
  'useCases.phase2.footer': { en: '→ From broad research to focused direction.', fr: '→ D\'une recherche large à une direction ciblée.' },
  'useCases.phase3.label': { en: 'Phase 3 — Develop', fr: 'Phase 3 — Développer' },
  'useCases.phase3.h2': { en: 'Explore solutions', fr: 'Explorer les solutions' },
  'useCases.phase3.desc': { en: 'Diverge again. Generate ideas, prototype approaches, challenge with multiple perspectives. Nova\'s agents debate so your team doesn\'t have to guess.', fr: 'Diverger à nouveau. Générer des idées, prototyper des approches, challenger avec de multiples perspectives. Les agents Nova débattent pour que votre équipe n\'ait pas à deviner.' },
  'useCases.phase3.b1': { en: 'Multi-Agent Chat — PM, UX, Dev, QA debate solutions', fr: 'Chat Multi-Agents — PM, UX, Dev, QA débattent des solutions' },
  'useCases.phase3.b2': { en: 'Epic to User Stories — break features into deliverables', fr: 'Epic to User Stories — décomposer les features en livrables' },
  'useCases.phase3.b3': { en: 'Canvas Generator — Lean, Business Model, Value Prop', fr: 'Canvas Generator — Lean, Business Model, Value Prop' },
  'useCases.phase3.b4': { en: 'Estimation Tool — T-shirt sizing with rationale', fr: 'Estimation Tool — estimation T-shirt avec justification' },
  'useCases.phase3.b5': { en: 'RACI Generator — role clarity before execution', fr: 'RACI Generator — clarté des rôles avant l\'exécution' },
  'useCases.phase3.footer': { en: '→ From one idea to validated, multi-perspective solutions.', fr: '→ D\'une idée à des solutions validées et multi-perspectives.' },
  'useCases.phase4.label': { en: 'Phase 4 — Deliver', fr: 'Phase 4 — Livrer' },
  'useCases.phase4.h2': { en: 'Ship with confidence', fr: 'Livrer avec confiance' },
  'useCases.phase4.desc': { en: 'Converge. Finalize specs, plan sprints, generate test cases, and produce release-ready artefacts. Everything is linked and traceable.', fr: 'Converger. Finaliser les spécifications, planifier les sprints, générer les cas de test et produire des artefacts prêts pour la release. Tout est lié et traçable.' },
  'useCases.phase4.b1': { en: 'Technical Specifications — architecture & API docs', fr: 'Spécifications Techniques — architecture et docs API' },
  'useCases.phase4.b2': { en: 'Test Case Generator — edge cases & acceptance criteria', fr: 'Test Case Generator — cas limites et critères d\'acceptation' },
  'useCases.phase4.b3': { en: 'Sprint Intelligence — capacity-based planning', fr: 'Sprint Intelligence — planification basée sur la capacité' },
  'useCases.phase4.b4': { en: 'Release Notes Generator — changelog from artefacts', fr: 'Release Notes Generator — changelog depuis les artefacts' },
  'useCases.phase4.b5': { en: 'Impact Analysis — trace changes across the system', fr: 'Impact Analysis — tracer les changements à travers le système' },
  'useCases.phase4.footer': { en: '→ From validated solution to production-ready delivery.', fr: '→ De la solution validée à la livraison prête pour la production.' },
  'useCases.why.label': { en: 'Why it matters', fr: 'Pourquoi c\'est important' },
  'useCases.why.h2': { en: 'Structure without bureaucracy', fr: 'De la structure sans bureaucratie' },
  'useCases.why.1.title': { en: 'Full traceability', fr: 'Traçabilité complète' },
  'useCases.why.1.desc': { en: 'Every artefact links back to its origin — research, decision, agent contribution. No more "where did this come from?"', fr: 'Chaque artefact est relié à son origine — recherche, décision, contribution d\'agent. Plus de « d\'où ça vient ? »' },
  'useCases.why.2.title': { en: 'Right tool, right phase', fr: 'Le bon outil, la bonne phase' },
  'useCases.why.2.desc': { en: 'Nova surfaces the relevant tools for each phase. No overwhelm, no guessing what to do next.', fr: 'Nova fait remonter les outils pertinents pour chaque phase. Pas de surcharge, pas de doute sur la prochaine étape.' },
  'useCases.why.3.title': { en: 'AI that follows methodology', fr: 'Une IA qui suit la méthodologie' },
  'useCases.why.3.desc': { en: 'Unlike generic AI, Nova\'s agents understand which phase you\'re in and adapt their behavior accordingly.', fr: 'Contrairement à l\'IA générique, les agents Nova comprennent dans quelle phase vous êtes et adaptent leur comportement.' },
  'useCases.bottom.h2': { en: 'Nova doesn\'t replace your process.', fr: 'Nova ne remplace pas votre processus.' },
  'useCases.bottom.sub': { en: 'It makes it AI-native.', fr: 'Il le rend AI-native.' },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('nova-lang') as Lang;
    return saved === 'en' ? 'en' : 'fr'; // Default French
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('nova-lang', l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
