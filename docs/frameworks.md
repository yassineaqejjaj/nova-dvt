# PM Frameworks Documentation

## Overview

The PM Frameworks feature allows users to filter workflows, tools, and deliverables based on their preferred project management methodology. This helps teams align their work with their chosen delivery framework.

## Supported Frameworks

### 🧩 Scrum — L'agilité cadencée
- **Philosophy**: Itération courte, feedback continu, valeur incrémentale
- **Key Deliverables**: Product Backlog, Sprint Backlog, Burndown Chart, Definition of Done, Sprint Review
- **Best For**: Petites/moyennes équipes, produits évolutifs, forte collaboration
- **Team Size**: 5-9 personnes
- **Cadence**: 1-4 semaines
- **Tools**: canvas, story, sprint, impact, kpi

### 🚀 SAFe — L'agilité à grande échelle
- **Philosophy**: Coordination d'équipes multiples autour d'objectifs partagés
- **Key Deliverables**: PI Objectives, ART, Portfolio Kanban, Solution Intent, Lean Business Case
- **Best For**: Grands programmes, gouvernance forte, alignement stratégique
- **Team Size**: 50-125+ personnes
- **Cadence**: 8-12 semaines (PI)
- **Tools**: roadmap, kpi, impact, canvas, sprint

### 🧱 Waterfall — La méthode séquentielle
- **Philosophy**: Processus linéaire, planification complète avant exécution
- **Key Deliverables**: Cahier des charges, Gantt Chart, Design Documents, Test Plans
- **Best For**: Projets stables, réglementés, à contraintes contractuelles
- **Team Size**: Variable
- **Cadence**: Phases séquentielles (mois/années)
- **Tools**: roadmap, design, code, launch

### 🌍 LeSS — La simplicité à l'échelle
- **Philosophy**: Extension de Scrum à plusieurs équipes sans lourdeur
- **Key Deliverables**: Product Backlog unique, Sprint commun, Overall Retrospective, Feature Teams
- **Best For**: Organisations déjà agiles souhaitant scaler simplement
- **Team Size**: 2-8 équipes (10-50 personnes)
- **Cadence**: 1-4 semaines
- **Tools**: canvas, story, sprint, impact

### 🧬 Spotify Model — La culture des tribus
- **Philosophy**: Structure décentralisée favorisant autonomie et innovation
- **Key Deliverables**: Squad Mission, Tribe Board, Health Check, Chapter Guidelines
- **Best For**: Entreprises produits tech, scale-ups, forte culture d'innovation
- **Team Size**: Squads (5-9), Tribes (40-150)
- **Cadence**: Autonome par squad
- **Tools**: canvas, story, roadmap, kpi, impact

### ⚙️ Lean — La philosophie du flux et de la valeur
- **Philosophy**: Maximiser la valeur, minimiser le gaspillage
- **Key Deliverables**: Value Stream Map, Kanban Board, A3 Report, Kaizen Plan, 5 Whys
- **Best For**: Environnements orientés amélioration continue, optimisation du flux
- **Team Size**: Variable
- **Cadence**: Continu
- **Tools**: canvas, impact, kpi, roadmap

## Usage

### Filtering Workflows

1. Navigate to the PM Workflows section
2. Open the Framework Filter in the sidebar
3. Select one or more frameworks
4. The workflow list will automatically filter to show relevant workflows
5. Workflows without specified frameworks are shown regardless of filter

### Multi-Select

- Click any framework to toggle selection
- Use the "Select All" button (✓) to select all frameworks
- Use the "Clear All" button (×) to deselect all frameworks
- Hover over the info icon (ℹ️) to see detailed framework information

### Tool Recommendations

When frameworks are selected, the system automatically recommends:
- **Tools**: PM tools compatible with selected frameworks
- **Deliverables**: Key artifacts expected for selected frameworks
- **Metrics**: Dashboard KPIs aligned with framework practices

## Tool Mappings

| Tool | Scrum | SAFe | Waterfall | LeSS | Spotify | Lean |
|------|-------|------|-----------|------|---------|------|
| Canvas | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| Story | ✓ | - | - | ✓ | ✓ | - |
| Sprint | ✓ | ✓ | - | ✓ | - | - |
| Impact | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| KPI | ✓ | ✓ | - | - | ✓ | ✓ |
| Roadmap | - | ✓ | ✓ | - | ✓ | ✓ |
| Design | - | - | ✓ | - | - | - |
| Code | - | - | ✓ | - | - | - |
| Launch | - | - | ✓ | - | - | - |

## Adding New Frameworks

To add a new framework:

1. **Update frameworks.json**:
```json
{
  "id": "new-framework",
  "name": "New Framework",
  "shortName": "NF",
  "emoji": "🎯",
  "philosophy": "Core principles...",
  "description": "Short tagline",
  "deliverables": ["Item 1", "Item 2"],
  "tools": ["canvas", "story"],
  "rituals": ["Ceremony 1", "Ceremony 2"],
  "best_for": "Context where this excels",
  "team_size": "X-Y people",
  "cadence": "Time period",
  "color": "agent-blue"
}
```

2. **Tag workflows** with the new framework ID in `frameworks` array

3. The framework will automatically appear in the filter UI

## Technical Architecture

### Files Structure
```
src/
├── data/
│   └── frameworks.json          # Framework definitions
├── hooks/
│   └── useFrameworkFilter.ts    # Filtering logic
├── components/
│   ├── FrameworkFilter.tsx      # Filter UI component
│   └── Workflows.tsx            # Main workflows with filter integration
└── docs/
    └── frameworks.md            # This documentation
```

### Key Functions

- `useFrameworkFilter()`: Main hook for framework filtering
  - `toggleFramework(id)`: Toggle framework selection
  - `filterWorkflows(workflows)`: Filter workflows by selected frameworks
  - `getRecommendedTools()`: Get tool recommendations
  - `getRecommendedDeliverables()`: Get deliverable recommendations

### State Management

Framework selection is managed locally in the Workflows component. It persists during the user session but resets on page refresh. Future enhancement could persist to localStorage or user preferences.

## Mobile Responsiveness

The framework filter is optimized for mobile:
- Stacks vertically on small screens
- Touch-friendly checkbox targets
- Collapsible card design
- Tooltip adapts to screen size

## Future Enhancements

- [ ] Persist framework selection to user preferences
- [ ] Framework-specific dashboard templates
- [ ] Auto-suggest frameworks based on project type
- [ ] Framework comparison view
- [ ] Custom framework creation for enterprise users
- [ ] Integration with workspace settings
