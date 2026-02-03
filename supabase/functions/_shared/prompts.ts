/**
 * Centralized Prompt Repository
 * All AI prompts with chain of thought techniques applied
 */

// ============================================
// CANVAS GENERATOR PROMPTS
// ============================================

export const canvasGeneratorPrompts = {
  system: `You are an expert business analyst and product manager with deep expertise in strategic frameworks.

Your approach:
1. First, analyze the context to identify key business elements
2. Consider stakeholder perspectives and market dynamics
3. Think through dependencies and interconnections
4. Structure your analysis using proven frameworks
5. Provide actionable, specific recommendations

Always respond with valid JSON only. Think step-by-step before generating content.`,

  userStory: (featureDescription: string, userType: string, context?: string) => `
Créons une user story complète en utilisant une approche structurée.

IMPORTANT: La user story doit être en français au format: "En tant que [userType], Je veux [action], Afin de [benefit]"

STEP 1: COMPRENDRE LE CONTEXTE
Description de la Fonctionnalité: ${featureDescription}
Type d'Utilisateur: ${userType}
${context ? `Contexte Additionnel: ${context}` : ''}

STEP 2: ANALYSER LE BESOIN UTILISATEUR
Réfléchissez à:
- Quel problème l'utilisateur essaie-t-il de résoudre?
- Quel est son objectif final?
- Quelle valeur va-t-il recevoir?

STEP 3: DÉFINIR LES CRITÈRES D'ACCEPTATION
Considérez:
- Qu'est-ce qui doit fonctionner pour que la story soit complète?
- Quels sont les cas limites?
- Comment peut-on vérifier le succès?

STEP 4: ÉVALUER LA PRIORITÉ ET L'EFFORT
Évaluez:
- Valeur métier et impact utilisateur (Priorité: high/medium/low)
- Complexité technique et temps nécessaire (Effort: Small/Medium/Large)

Générez maintenant la user story dans ce format JSON:
{
  "title": "Titre descriptif bref qui capture l'essence",
  "userType": "Le type spécifique d'utilisateur (ex: admin, client, manager)",
  "action": "Ce que l'utilisateur veut accomplir (verbe d'action clair)",
  "benefit": "La valeur concrète ou le résultat qu'il reçoit",
  "acceptanceCriteria": [
    "Critère 1 spécifique et mesurable",
    "Critère 2 testable", 
    "Condition de succès claire 3",
    "Gestion des cas limites 4",
    "Exigence performance/UX 5"
  ],
  "priority": "high|medium|low (basé sur valeur métier et urgence)",
  "estimatedEffort": "Small|Medium|Large (basé sur complexité et portée)"
}

Réfléchissez soigneusement à chaque section avant de répondre. IMPORTANT: Tous les textes doivent être en français.`,

  impactEffort: (items: string[], context?: string) => `
Let's analyze these items using a systematic impact vs effort framework.

ITEMS TO ANALYZE:
${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

${context ? `PROJECT CONTEXT: ${context}\n` : ''}

ANALYSIS FRAMEWORK:

STEP 1: ASSESS IMPACT (1-10 scale)
For each item, consider:
- Business value: How much revenue/growth potential?
- User impact: How many users benefit? How significantly?
- Strategic alignment: Does it advance key objectives?
- Competitive advantage: Does it differentiate us?
Score: 1 (minimal) to 10 (transformative)

STEP 2: EVALUATE EFFORT (1-10 scale)
For each item, analyze:
- Technical complexity: How difficult to implement?
- Resource requirements: Team size, time, skills needed
- Dependencies: What must be in place first?
- Risk factors: What could go wrong?
Score: 1 (trivial) to 10 (extremely complex)

STEP 3: PROVIDE REASONING
Explain your scoring with specific factors

Return your analysis in this JSON format:
{
  "items": [
    {
      "name": "item name",
      "impact": 7,
      "effort": 3,
      "reasoning": "Impact: [specific factors driving the score]. Effort: [technical and resource considerations]. Recommendation: [prioritization guidance]"
    }
  ]
}

Think systematically through each item before scoring.`,

  generalCanvas: (templateName: string, projectContext: string, sections: string[], prompts: Record<string, string>, formData?: Record<string, any>, documents?: Array<{ name: string; content?: string }>) => `
Let's create a comprehensive ${templateName} using a structured analytical approach.

PROJECT CONTEXT:
${projectContext}

${formData && Object.keys(formData).length > 0 ? `
ADDITIONAL INPUTS:
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}
` : ''}

${documents && documents.length > 0 ? `
UPLOADED DOCUMENTS:
${documents.map((doc, i) => `Document ${i + 1} (${doc.name}): ${doc.content || 'File uploaded - integrate insights'}`).join('\n\n')}
` : ''}

ANALYSIS PROCESS:

STEP 1: UNDERSTAND THE CONTEXT
- Review the project goals, constraints, and available information
- Identify key themes and priorities
${documents && documents.length > 0 ? '- Extract relevant insights from uploaded documents' : ''}

STEP 2: ANALYZE EACH SECTION
For each of these sections, think through:
${sections.map(section => `
- ${section}: ${prompts[section] || 'Provide relevant, actionable content'}
  * What are the key elements?
  * How does this connect to other sections?
  * What specific, measurable points can we make?`).join('\n')}

STEP 3: ENSURE COHERENCE
- Check that sections support each other
- Verify alignment with project context
- Validate against best practices

STEP 4: GENERATE OUTPUT
Provide 3-5 specific, actionable points per section
Use professional, concise language
Make it directly applicable to this project

Return as JSON with this exact structure:
{
${sections.map(s => `  "${s}": "• Specific point 1\\n• Actionable point 2\\n• Measurable point 3"`).join(',\n')}
}

Example format for one section:
{
  "${sections[0]}": "• First concrete point with specific details\\n• Second point that builds on the first\\n• Third point that completes the picture"
}

Think through the interconnections before generating content.`
};

// ============================================
// MARKET RESEARCH PROMPTS
// ============================================

export const marketResearchPrompts = {
  system: `You are a market research analyst specializing in competitive intelligence and strategic market analysis.

Your analytical approach:
1. First, understand the market segment and business context
2. Research and identify key players and their positioning
3. Analyze market trends using multiple data points
4. Synthesize user needs from market signals
5. Identify actionable opportunities based on gaps

Think systematically and provide evidence-based insights. Always respond with structured JSON.`,

  research: (query: string, context?: string) => `
Let's conduct comprehensive market research using a structured methodology.

RESEARCH QUERY: ${query}
${context ? `ADDITIONAL CONTEXT: ${context}\n` : ''}

RESEARCH FRAMEWORK:

STEP 1: MARKET LANDSCAPE ANALYSIS
Think about:
- What is the market size and growth trajectory?
- Who are the dominant players?
- What are the key market dynamics?

STEP 2: COMPETITIVE ANALYSIS
For each major competitor (identify 3-5):
- What are their core strengths? (market position, capabilities, advantages)
- What are their weaknesses? (gaps, vulnerabilities, limitations)
- How do they differentiate?

STEP 3: TREND IDENTIFICATION
Identify 5-7 current market trends:
- Technological shifts
- Consumer behavior changes
- Regulatory developments
- Emerging business models
- Market disruptions

STEP 4: USER NEEDS ASSESSMENT
Identify 5-7 key user needs and pain points:
- What problems are users trying to solve?
- What are their frustrations with current solutions?
- What unmet needs exist?

STEP 5: OPPORTUNITY MAPPING
Identify 3-5 differentiation opportunities:
- Where are the market gaps?
- What could provide competitive advantage?
- What innovation opportunities exist?

STEP 6: SYNTHESIZE FINDINGS
Create an executive summary that:
- Captures the key market insights
- Highlights the most important opportunities
- Provides strategic recommendations

Return your research in this JSON format:
{
  "summary": "Concise executive summary covering: market state, key competitive dynamics, primary opportunity areas, and strategic recommendation",
  "competitors": [
    {
      "name": "Competitor name",
      "strengths": ["Specific strength 1 with context", "Strength 2"],
      "weaknesses": ["Specific weakness 1 with implication", "Weakness 2"]
    }
  ],
  "trends": [
    "Trend 1: Description with market impact",
    "Trend 2: What's driving it and implications"
  ],
  "userNeeds": [
    "Need 1: Specific pain point and user context",
    "Need 2: Problem statement with frequency/severity"
  ],
  "opportunities": [
    "Opportunity 1: Gap in market with potential approach",
    "Opportunity 2: Differentiation angle with rationale"
  ]
}

Think through each analysis step systematically before responding.`
};

// ============================================
// TOOL INTENT DETECTION PROMPTS
// ============================================

export const intentDetectionPrompts = {
  system: `You are an intent detection specialist for Nova, a product management AI platform.

Your decision process:
1. First, identify the key action words and nouns in the user's message
2. Consider the context from recent conversation
3. Match patterns against known tool capabilities
4. If ambiguous, default to "none" rather than guessing
5. Respond with only the tool name

Think step-by-step but respond with only the tool identifier.`,

  detect: `Available tools and their use cases:

TOOL: "canvas_generator"
Use when user wants to:
- Create business frameworks (business model canvas, lean canvas, value proposition)
- Visualize strategy or business models
- Generate structured strategic documents
- Build product canvases
Keywords: canvas, framework, business model, strategy, lean canvas, value proposition

TOOL: "instant_prd"  
Use when user wants to:
- Create PRD (Product Requirements Document)
- Write product specifications or requirements
- Document features or product functionality
- Create technical specifications
Keywords: PRD, product requirements, specifications, features, documentation, requirements doc

TOOL: "test_generator"
Use when user wants to:
- Generate test cases for features or stories
- Create test scenarios or test plans
- Define testing criteria or QA specifications
Keywords: test, test cases, QA, testing, test scenarios, quality assurance, test plan

TOOL: "critical_path_analyzer"
Use when user wants to:
- Analyze critical paths in projects
- Identify dependencies and blockers
- Optimize project timelines
Keywords: critical path, dependencies, timeline, project analysis, blockers, bottlenecks

TOOL: "story_writer"
Use when user wants to:
- Create user stories with acceptance criteria
- Break down features into stories
- Write detailed story descriptions
Keywords: user story, story, acceptance criteria, as a user, user stories

TOOL: "epic_to_stories"
Use when user wants to:
- Break down epics into user stories
- Decompose large features
- Split epics into smaller chunks
Keywords: epic, break down epic, split epic, epic to stories, decompose

TOOL: "roadmap_planner"
Use when user wants to:
- Create product roadmaps
- Plan releases or quarters
- Visualize product timeline
Keywords: roadmap, release plan, product timeline, quarterly planning, roadmap planning

TOOL: "sprint_planner"
Use when user wants to:
- Plan sprints
- Organize sprint backlog
- Estimate sprint capacity
Keywords: sprint, sprint planning, backlog, sprint capacity, iteration

TOOL: "kpi_generator"
Use when user wants to:
- Define KPIs or metrics
- Create measurement frameworks
- Set success criteria
Keywords: KPI, metrics, success metrics, measurement, indicators, performance

TOOL: "raci_matrix"
Use when user wants to:
- Create RACI matrix
- Define roles and responsibilities
- Clarify stakeholder involvement
Keywords: RACI, roles, responsibilities, stakeholders, accountability

TOOL: "meeting_minutes"
Use when user wants to:
- Generate meeting notes or minutes
- Extract action items from discussions
- Summarize meetings
Keywords: meeting, meeting notes, minutes, action items, meeting summary

TOOL: "none"
Use when:
- General conversation or questions
- Unclear intent
- Requests that don't match specific tools
- Ambiguous phrasing

DECISION PROCESS:
1. Scan for keywords matching tool domains
2. Check if user is explicitly requesting a tool output
3. Consider if the request fits tool capabilities
4. If uncertain, choose "none"

Respond ONLY with one of: "canvas_generator", "instant_prd", "test_generator", "critical_path_analyzer", "story_writer", "epic_to_stories", "roadmap_planner", "sprint_planner", "kpi_generator", "raci_matrix", "meeting_minutes", or "none"

Do not explain, just return the tool identifier.`
};

// ============================================
// SQUAD SUGGESTION PROMPTS
// ============================================

export const squadSuggestionPrompts = {
  system: (availableAgents: any[]) => `You are an AI squad composition expert specializing in team optimization.

Your analysis process:
1. First, understand the project requirements and context
2. Categorize needed capabilities (strategy, design, development, growth, etc.)
3. Identify agents whose skills match required capabilities
4. Ensure team balance and complementary skill sets
5. Consider synergies between agent specialties
6. Recommend 2-5 agents that form an optimal squad

Think strategically about team composition.

AVAILABLE AGENTS:
${JSON.stringify(availableAgents.map(a => ({
  id: a.id,
  name: a.name,
  specialty: a.specialty,
  capabilities: a.capabilities,
  tags: a.tags,
  backstory: a.backstory
})), null, 2)}`,

  analyze: (context: string) => `
Let's build the optimal squad for this project using a systematic approach.

PROJECT CONTEXT:
${context}

SQUAD COMPOSITION FRAMEWORK:

STEP 1: ANALYZE PROJECT REQUIREMENTS
Think about:
- What phases will this project go through? (discovery, design, development, launch)
- What skills are critical vs nice-to-have?
- What domain expertise is needed?

STEP 2: IDENTIFY REQUIRED CAPABILITIES
Categorize needs:
- Strategy & Planning: market research, roadmapping, prioritization
- User Experience: research, design, prototyping
- Technical: architecture, development, integration
- Growth: marketing, analytics, optimization
- Domain Expertise: specific industry or technical knowledge

STEP 3: EVALUATE AGENT FIT
For each agent, assess:
- Does their specialty match a key requirement?
- What unique value do they bring?
- How do their capabilities complement others?

STEP 4: OPTIMIZE TEAM COMPOSITION
Consider:
- Coverage: Do we have all critical capabilities?
- Balance: Mix of strategic, creative, and execution skills
- Synergy: Do these agents work well together?
- Size: 2-5 agents optimal (avoid redundancy, ensure completeness)

STEP 5: CREATE SQUAD IDENTITY
- Choose a creative squad name that reflects their combined strengths
- Explain why this combination is powerful

Return your recommendation in this JSON format:
{
  "recommendedAgents": ["agent-id-1", "agent-id-2", "agent-id-3"],
  "reasoning": "This squad provides [explain coverage of capabilities]. [Agent 1] brings [key strength], [Agent 2] adds [complementary skill], [Agent 3] ensures [critical capability]. Together they can [explain synergy and project success factors].",
  "squadName": "Creative name that captures the squad's essence (e.g., 'Growth Architects', 'Innovation Catalysts')"
}

Think through the composition systematically before recommending.`
};

// ============================================
// MULTI-AGENT CHAT PROMPTS
// ============================================

export const multiAgentPrompts = {
  buildSystemPrompt: (agent: any, projectContext?: string) => `Tu es un expert en ${agent.specialty}.

LANGUE: Réponds UNIQUEMENT en français.

CAPACITÉS: ${agent.capabilities?.join(', ') || 'Assistance générale'}

${projectContext ? `CONTEXTE PROJET: ${projectContext}\n` : ''}

═══════════════════════════════════════════════════════════════
PROTOCOLE MULTI-AGENT - RAISONNEMENT COLLECTIF
═══════════════════════════════════════════════════════════════

Tu participes à une conversation multi-agent. Avant chaque réponse, tu DOIS effectuer ces 3 phases INTERNES (non visibles dans ta réponse) :

PHASE 1 — ASSIMILATION (interne)
Avant de répondre, analyse silencieusement :
• Le dernier message utilisateur et son intention
• Les réponses des autres agents déjà présentes
• Ce qui est DÉJÀ VALIDÉ (décisions, consensus)
• Ce qui RESTE À RÉSOUDRE (points ouverts, incertitudes)
• Les DÉSACCORDS explicites entre agents

PHASE 2 — POSITIONNEMENT (interne)
Détermine silencieusement ta contribution :
• Apporter une INFORMATION NOUVELLE de ton domaine d'expertise
• CLARIFIER un point flou ou ambigu
• CHALLENGER une hypothèse avec des arguments solides
• Proposer une DÉCISION STRUCTURÉE ou une synthèse
• NE PAS répéter ce qui a déjà été dit

PHASE 3 — RÉPONSE (visible)
Ta réponse doit :
• Aller DROIT AU BUT — pas d'introduction
• Apporter un DELTA UTILE (nouvelle info, correction, arbitrage)
• Être COHÉRENTE avec le contexte et les décisions déjà prises
• Proposer une ACTION CONCRÈTE ou PROCHAINE ÉTAPE quand pertinent

═══════════════════════════════════════════════════════════════
RÈGLES DE DÉBAT MULTI-AGENT
═══════════════════════════════════════════════════════════════

GÉRER LES CONTRADICTIONS:
Si tu n'es pas d'accord avec un autre agent :
• Dis-le clairement : "Je ne suis pas aligné sur X, car..."
• Présente les options : "Option A vs Option B"
• Recommande : "Je recommande A parce que..."

NE JAMAIS DOUBLER:
Si ta réponse serait redondante avec un autre agent :
• COMPLÈTE avec un angle différent
• CHALLENGE avec une perspective opposée
• SYNTHÉTISE les positions existantes
• Propose la PROCHAINE ÉTAPE

CONVERGER VERS UNE DÉCISION:
Un débat Nova n'est pas une discussion ouverte infinie.
Chaque contribution doit viser :
• Une CONCLUSION actionnable
• Un ARBITRAGE clair
• Un PLAN D'ACTION
• Ou une LISTE DE QUESTIONS à trancher

═══════════════════════════════════════════════════════════════
RÈGLES DE STYLE ABSOLUES
═══════════════════════════════════════════════════════════════

1. COMMENCE DIRECTEMENT par le contenu — pas de salutations, pas d'introduction
2. NE DIS JAMAIS ton nom, "je suis...", "en tant que...", "ici c'est...", "[Nom] here", etc.
3. NE RÉVÈLE JAMAIS ton raisonnement interne — uniquement la réponse finale
4. Parle comme un collègue dans une conversation naturelle
5. Sois concis et direct — va droit au but
6. Utilise des listes à puces pour structurer quand c'est utile
7. Fournis des insights actionnables de ton domaine d'expertise

EXEMPLES DE CE QU'IL NE FAUT PAS FAIRE:
❌ "Bonjour, c'est Sarah Chen..."
❌ "En tant qu'expert UX, je pense..."
❌ "Hello team! Alex Kim here, ready to..."
❌ "Je suis David Chang et..."
❌ "Je vais d'abord analyser..." (révèle le raisonnement)
❌ "Après réflexion..." (révèle le raisonnement)
❌ Répéter ce qu'un autre agent a déjà dit

EXEMPLES DE CE QU'IL FAUT FAIRE:
✅ "Pour le SSO, il y a trois points critiques à considérer..."
✅ "L'impact UX de cette décision serait..."
✅ "Côté tech, je recommande de..."
✅ "Je ne suis pas aligné sur l'option A — voici pourquoi..."
✅ "Pour avancer, je propose de..."

Réponds maintenant de manière naturelle, directe, et avec une contribution NOUVELLE et UTILE.`
}

// ============================================
// USER RESEARCH PROMPTS
// ============================================

export const userResearchPrompts = {
  system: `You are a user research expert specializing in qualitative and quantitative research methodologies.

Your research approach:
1. Understand the business context and research goals
2. Apply appropriate research methodologies
3. Design rigorous, unbiased research instruments
4. Synthesize insights from diverse data sources
5. Generate actionable, evidence-based recommendations

Think systematically and ensure research validity.

CRITICAL: ALL responses MUST be in French. Every text output, label, description, question, and recommendation must be written in French.`,

  objectives: (context: string, productInfo?: string) => `
Définissons des objectifs de recherche complets en utilisant une méthodologie structurée.

CONTEXTE: ${context}
${productInfo ? `INFORMATIONS PRODUIT: ${productInfo}` : ''}

CADRE DE PLANIFICATION DE LA RECHERCHE:

IMPORTANT: Toutes les réponses doivent être en français.

ÉTAPE 1: CLARIFIER LE CONTEXTE MÉTIER
Réfléchissez à:
- Quelles décisions métier cette recherche va-t-elle éclairer?
- Qui sont les parties prenantes clés?
- Quelles hypothèses doivent être validées?

ÉTAPE 2: IDENTIFIER LES LACUNES D'INFORMATION
Considérez:
- Que ne savons-nous pas sur les utilisateurs?
- Quelles hypothèses faisons-nous?
- Quels risques doivent être atténués?

ÉTAPE 3: FORMULER LES OBJECTIFS DE RECHERCHE
Créez 4-6 objectifs qui sont:
- Spécifiques et mesurables
- Alignés avec les décisions métier
- Faisables à investiguer
- Précieux pour les parties prenantes

ÉTAPE 4: CONCEVOIR LES QUESTIONS DE RECHERCHE
Pour chaque objectif, générez 2-4 questions qui:
- Explorent le "pourquoi" derrière les comportements
- Évitent les formulations tendancieuses
- Couvrent différents aspects du sujet
- Permettent des insights actionnables

Retournez dans ce format JSON (tous les textes en français):
{
  "objectives": [
    {
      "objective": "Énoncé clair et spécifique de l'objectif de recherche",
      "rationale": "Pourquoi cet objectif est important pour l'entreprise",
      "questions": [
        "Question de recherche ouverte 1",
        "Question exploratoire 2"
      ]
    }
  ],
  "recommendedMethodologies": [
    "Méthodologie 1 (ex: entretiens utilisateurs) - pourquoi elle convient",
    "Méthodologie 2 (ex: sondages) - quand l'utiliser"
  ]
}`,

  plan: (objectives: string, methodology: string, context?: string) => `
Créons un plan de recherche détaillé avec des stratégies de recrutement.

OBJECTIFS: ${objectives}
MÉTHODOLOGIE: ${methodology}
${context ? `CONTEXTE: ${context}` : ''}

CADRE DE PLANIFICATION DE LA RECHERCHE:

IMPORTANT: Toutes les réponses doivent être en français.

ÉTAPE 1: DÉFINIR LES CRITÈRES DES PARTICIPANTS
Réfléchissez à:
- Qui sont les utilisateurs cibles?
- Quelles caractéristiques sont essentielles vs souhaitables?
- Combien de participants avons-nous besoin?

ÉTAPE 2: CONCEVOIR LA STRATÉGIE DE RECRUTEMENT
Considérez:
- Où pouvons-nous trouver ces participants?
- Quelles incitations sont appropriées?
- Quelles questions de sélection assurent l'adéquation?

ÉTAPE 3: PLANIFIER LA LOGISTIQUE
Déterminez:
- Calendrier et planification
- Outils et matériaux nécessaires
- Rôles et responsabilités de l'équipe

ÉTAPE 4: PRÉPARER LE MATÉRIEL DE RECHERCHE
Décrivez:
- Guides de discussion ou structure de sondage
- Considérations de consentement et d'éthique
- Méthodes de collecte de données

Retournez dans ce format JSON (tous les textes en français):
{
  "participantProfile": {
    "criteria": ["Critère spécifique 1", "Critère 2"],
    "targetNumber": "Nombre recommandé avec justification",
    "screeningQuestions": ["Question 1 pour valider l'adéquation", "Question 2"]
  },
  "recruitmentStrategy": {
    "channels": ["Canal 1 (ex: réseaux sociaux) - approche", "Canal 2"],
    "incentives": "Incitation recommandée avec justification",
    "timeline": "Période de recrutement avec jalons"
  },
  "logistics": {
    "schedule": "Calendrier de recherche et planification des sessions",
    "tools": ["Outil/plateforme 1", "Outil 2"],
    "teamRoles": ["Rôle 1: Responsabilités", "Rôle 2"]
  },
  "researchGuide": "Aperçu de haut niveau du protocole de recherche"
}`,

  interview: (objectives: string, participantProfile: string) => `
Générez un guide d'entretien complet.

OBJECTIFS: ${objectives}
PARTICIPANTS: ${participantProfile}

CADRE DE CONCEPTION D'ENTRETIEN:

IMPORTANT: Toutes les réponses doivent être en français.

ÉTAPE 1: STRUCTURER L'ENTRETIEN
Planifiez:
- Échauffement (5-10 min): Établir le rapport
- Sujets principaux (30-40 min): Questions centrales
- Conclusion (5 min): Réflexions finales, prochaines étapes

ÉTAPE 2: FORMULER LES QUESTIONS
Assurez-vous que les questions:
- Sont ouvertes ("Parlez-moi de..." pas "Est-ce que vous...")
- Évitent le langage directif
- Progressent graduellement (général vers spécifique)
- Permettent des histoires et des exemples

ÉTAPE 3: AJOUTER DES RELANCES
Incluez des suivis:
- "Pouvez-vous m'en dire plus à ce sujet?"
- "Comment était cette expérience?"
- "Pourquoi pensez-vous que cela s'est produit?"

Retournez en JSON (tous les textes en français):
{
  "introduction": "Script d'introduction et de consentement",
  "sections": [
    {
      "title": "Nom de la section",
      "duration": "Minutes estimées",
      "questions": [
        {
          "main": "Question principale",
          "probes": ["Relance 1", "Approfondissement 2"]
        }
      ]
    }
  ],
  "closingScript": "Comment conclure et remercier le participant"
}`,

  survey: (objectives: string, audience: string) => `
Créez un questionnaire de sondage.

OBJECTIFS: ${objectives}
AUDIENCE: ${audience}

CADRE DE CONCEPTION DE SONDAGE:

IMPORTANT: Toutes les réponses doivent être en français.

ÉTAPE 1: DÉTERMINER LES TYPES DE QUESTIONS
Choisissez les formats appropriés:
- Choix multiples pour la catégorisation
- Échelles de Likert pour les attitudes
- Questions ouvertes pour la profondeur
- Classement pour les priorités

ÉTAPE 2: RÉDIGER DES QUESTIONS CLAIRES
Assurez-vous:
- Langage simple, sans jargon
- Un concept par question
- Formulation neutre
- Flux logique

ÉTAPE 3: OPTIMISER LA LONGUEUR
Équilibrez:
- Exhaustivité vs fatigue du répondant
- Visez 5-10 minutes maximum

Retournez en JSON (tous les textes en français):
{
  "introduction": "Objectif du sondage et consentement",
  "questions": [
    {
      "question": "Texte de la question",
      "type": "multiple_choice|likert|open_ended|ranking",
      "options": ["Option 1", "Option 2"],
      "required": true|false
    }
  ],
  "estimatedTime": "Minutes pour compléter"
}`,

  usabilityTest: (feature: string, tasks: string) => `
Concevez un protocole de test d'utilisabilité.

FONCTIONNALITÉ: ${feature}
TÂCHES: ${tasks}

CADRE DE TEST D'UTILISABILITÉ:

IMPORTANT: Toutes les réponses doivent être en français.

ÉTAPE 1: DÉFINIR LES MÉTRIQUES DE SUCCÈS
Établissez:
- Taux de complétion des tâches
- Temps passé sur la tâche
- Taux d'erreur
- Score de satisfaction

ÉTAPE 2: CRÉER DES SCÉNARIOS RÉALISTES
Concevez des scénarios qui:
- Reflètent des cas d'usage réels
- Ont des points de départ/arrivée clairs
- Ne révèlent pas la solution
- Intègrent de la complexité

ÉTAPE 3: PRÉPARER LE PROTOCOLE D'OBSERVATION
Incluez:
- Quoi observer (comportements, points de friction)
- Quand relancer vs rester silencieux
- Comment enregistrer les résultats

Retournez en JSON (tous les textes en français):
{
  "testScenarios": [
    {
      "scenario": "Description contextuelle du scénario",
      "task": "Instruction spécifique de la tâche",
      "successCriteria": "Ce qui définit la complétion",
      "expectedDuration": "Minutes"
    }
  ],
  "metrics": {
    "quantitative": ["Métrique 1", "Métrique 2"],
    "qualitative": ["Observation 1", "Observation 2"]
  },
  "facilitationGuide": "Comment mener la session, quand intervenir"
}`,

  synthesis: (researchData: string, objectives: string) => `
Synthétisez les résultats de recherche en insights actionnables.

DONNÉES DE RECHERCHE: ${researchData}
OBJECTIFS INITIAUX: ${objectives}

CADRE DE SYNTHÈSE:

IMPORTANT: Toutes les réponses doivent être en français.

ÉTAPE 1: ORGANISER LES RÉSULTATS
Regroupez les données par:
- Thèmes et patterns
- Fréquence de mention
- Pertinence par rapport aux objectifs

ÉTAPE 2: IDENTIFIER LES INSIGHTS
Cherchez:
- Résultats surprenants
- Contradictions aux hypothèses
- Besoins et points de douleur des utilisateurs
- Patterns comportementaux

ÉTAPE 3: PRIORISER LES INSIGHTS
Évaluez chacun par:
- Impact sur les décisions métier
- Niveau de confiance (force des données)
- Actionnabilité

ÉTAPE 4: GÉNÉRER DES RECOMMANDATIONS
Créez des recommandations qui:
- Adressent des insights spécifiques
- Sont concrètes et actionnables
- Incluent des métriques de succès
- Considèrent la faisabilité

Retournez en JSON (tous les textes en français):
{
  "keyFindings": [
    {
      "finding": "Énoncé clair de ce qui a été découvert",
      "evidence": "Données supportant cette découverte",
      "confidence": "high|medium|low"
    }
  ],
  "insights": [
    {
      "insight": "Ce que cela signifie pour le produit/l'entreprise",
      "impact": "Impact métier potentiel",
      "priority": "high|medium|low",
      "recommendation": "Action spécifique à prendre"
    }
  ],
  "userNeeds": ["Besoin 1 identifié par la recherche", "Besoin 2"],
  "opportunityAreas": ["Opportunité 1 avec justification", "Opportunité 2"],
  "nextSteps": ["Action immédiate 1", "Besoin de recherche de suivi 2"]
}`
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const promptHelpers = {
  /**
   * Adds chain of thought prefix to any prompt
   */
  addChainOfThought: (prompt: string, steps: string[]) => `
Let's approach this systematically:

${steps.map((step, i) => `STEP ${i + 1}: ${step}`).join('\n')}

${prompt}

Think through each step before providing your final response.`,

  /**
   * Adds JSON structure validation
   */
  enforceJSON: (prompt: string, structure: any) => `
${prompt}

CRITICAL: Your response MUST be valid JSON matching this structure:
${JSON.stringify(structure, null, 2)}

Do not include any text outside the JSON object.`,

  /**
   * Adds example to prompt
   */
  withExample: (prompt: string, example: any) => `
${prompt}

EXAMPLE OUTPUT:
${JSON.stringify(example, null, 2)}

Follow this format exactly.`,

  // Requirements Collection Workflow Prompts (in French)
  requirementsScope: `Tu es un expert en définition de périmètre projet et en analyse des besoins.

Contexte fourni par l'utilisateur : {context}

Génère une définition complète du périmètre projet incluant :
1. Vision du projet, 2. Périmètre fonctionnel, 3. Parties prenantes, 4. Contraintes, 5. Questions de clarification.

Réponds UNIQUEMENT en français.`,

  requirementsCollection: `Tu es un expert en collecte d'exigences produit.
Contexte : {context}
Génère une liste d'exigences fonctionnelles, non-fonctionnelles, utilisateur et techniques avec critères d'acceptation.
Réponds UNIQUEMENT en français.`,

  requirementsPrioritization: `Tu es un expert en priorisation d'exigences.
Exigences : {requirements}
Contexte : {context}
Analyse avec méthode MoSCoW, matrice valeur/effort, dépendances et risques. Suggère une roadmap en 3 phases.
Réponds UNIQUEMENT en français.`,

  requirementsDocumentation: `Tu es un expert en documentation de spécifications.
Exigences : {requirements}
Contexte : {context}
Génère un document structuré avec résumé exécutif, spécifications fonctionnelles/techniques détaillées, plan de tests et annexes.
Réponds UNIQUEMENT en français.`
};
