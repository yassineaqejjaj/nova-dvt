
# Plan d'implémentation : Transformation IA des Artefacts

## Contexte

Les artefacts dans Nova peuvent être transformés en d'autres types via l'IA :
- **Canvas → Epic** : Extraire des Epics stratégiques d'un canvas produit
- **Canvas → Story** : Générer directement des User Stories
- **Epic → Story** : Découper un Epic en User Stories détaillées
- **Epic → Tech Spec** : Générer une spécification technique
- **Story → Impact Analysis** : Analyser l'impact d'une story

L'edge function `chat-ai` existe déjà en mode simple pour les générations textuelles. Le pattern `generate-user-stories` montre comment structurer les prompts pour obtenir du JSON valide.

---

## Architecture de la solution

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Artifacts.tsx                            │
│  handleTransform(artifact, targetType) ─────────────────────►   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TransformArtifactDialog                                │   │
│  │  - Affiche le source                                    │   │
│  │  - Options de configuration                             │   │
│  │  - Preview du résultat                                  │   │
│  │  - Validation et sauvegarde                             │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │  transform-artifact    │   (nouvelle edge function)
           │  Edge Function         │
           │                        │
           │  Modes:                │
           │  • canvas_to_epic      │
           │  • canvas_to_story     │
           │  • epic_to_story       │
           │  • epic_to_tech_spec   │
           │  • story_to_impact     │
           └────────────────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │  Lovable AI Gateway    │
           │  (gemini-2.5-flash)    │
           └────────────────────────┘
```

---

## Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `src/components/artifacts/TransformArtifactDialog.tsx` | Dialog de configuration et preview de la transformation |
| `supabase/functions/transform-artifact/index.ts` | Edge function spécialisée pour les transformations |

## Fichiers à modifier

| Fichier | Modification |
|---------|--------------|
| `src/components/Artifacts.tsx` | Intégrer le dialog et gérer la sauvegarde des artefacts générés |
| `src/components/artifacts/index.ts` | Export du nouveau composant |
| `supabase/config.toml` | Ajouter la nouvelle edge function |

---

## Détails techniques

### 1. Edge Function `transform-artifact`

Prompts spécialisés par type de transformation :

**Canvas → Epic**
```text
Analyse ce Canvas produit et extrais 2-5 Epics stratégiques.
Pour chaque Epic, fournis:
- title: Titre court et actionnable
- description: Description détaillée (2-3 phrases)
- objective: Objectif métier clair
- expectedValue: Valeur attendue mesurable
- indicators: 2-3 indicateurs de succès
- priority: high/medium/low
```

**Epic → Story** (réutilise la logique de `generate-user-stories`)
```text
Découpe cet Epic en 3-7 User Stories.
Pour chaque Story:
- title, story: {asA, iWant, soThat}
- acceptanceCriteria: 2-4 critères
- effortPoints: Fibonacci (1,2,3,5,8)
- priority: high/medium/low
```

**Epic → Tech Spec**
```text
Génère une spécification technique pour cet Epic.
Structure:
- overview: Vue d'ensemble technique
- architecture: Composants et interactions
- dataModel: Modèle de données
- apis: Endpoints nécessaires
- dependencies: Dépendances techniques
- risks: Risques et mitigations
```

### 2. TransformArtifactDialog

Interface en 3 étapes :

1. **Configuration** : 
   - Affichage du contenu source
   - Options spécifiques au type (nombre d'epics, focus areas, etc.)
   
2. **Génération** :
   - Appel à l'edge function
   - Spinner de chargement
   
3. **Preview & Validation** :
   - Affichage des artefacts générés
   - Édition inline possible
   - Sélection des artefacts à sauvegarder
   - Bouton "Sauvegarder X artefacts"

### 3. Sauvegarde des artefacts

Chaque artefact généré est inséré dans `artifacts` avec :
- `user_id` : utilisateur courant
- `artifact_type` : type cible
- `title` : titre généré
- `content` : contenu structuré JSON
- `metadata.source_artifact_id` : ID de l'artefact source (traçabilité)
- `metadata.workflow_source` : "AI Transformation"
- `squad_id` : hérité de l'artefact source si présent
- `product_context_id` : hérité de l'artefact source si présent

---

## Flux utilisateur

1. L'utilisateur clique sur "⋯" sur une carte artefact
2. Sélectionne "Générer des Epics" ou "Découper en Stories"
3. Le dialog s'ouvre avec le contenu source affiché
4. L'utilisateur ajuste les options (nombre, focus areas)
5. Clique sur "Générer"
6. Preview des artefacts générés
7. Peut éditer/désélectionner certains
8. Clique sur "Sauvegarder"
9. Toast de confirmation + refresh de la liste

---

## Prompts JSON stricts

Pour garantir un parsing fiable, chaque prompt inclura :
- Instructions explicites sur le format JSON attendu
- Exemples de structure valide
- Instruction "Return ONLY valid JSON, no prose, no code fences"

Format de réponse de l'edge function :
```json
{
  "success": true,
  "artifacts": [
    {
      "type": "epic",
      "title": "...",
      "content": { ... }
    }
  ]
}
```

---

## Gestion d'erreurs

- Rate limit (429) : Message explicite + retry suggestion
- Payload trop long : Troncature intelligente du contenu source
- JSON invalide : Fallback avec retry et parsing regex
- Échec réseau : Toast d'erreur + bouton retry

---

## Résumé des livrables

| Composant | Fonctionnalité |
|-----------|----------------|
| `TransformArtifactDialog` | Dialog de transformation avec preview |
| `transform-artifact` edge function | Génération IA spécialisée |
| Sauvegarde en batch | Insertion multiple avec traçabilité |
| Gestion d'erreurs | Retry, fallback, messages clairs |
