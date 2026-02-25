# Analyse d'Impact — Documentation Technique

> **Impact-as-a-Service** : Chaque modification d'artefact produit est automatiquement évaluée pour ses risques sur l'ensemble de l'écosystème — code, tests, données, KPIs et documentation liée.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture technique](#2-architecture-technique)
3. [Schéma de données](#3-schéma-de-données)
4. [Edge Functions](#4-edge-functions)
5. [Composants UI](#5-composants-ui)
6. [Flux automatique](#6-flux-automatique)
7. [Smart Auto-Linking](#7-smart-auto-linking)
8. [Types de changements détectés](#8-types-de-changements-détectés)
9. [Scoring](#9-scoring)
10. [Livrables exportables](#10-livrables-exportables)
11. [Guide d'utilisation](#11-guide-dutilisation)

---

## 1. Vue d'ensemble

### Objectif

L'Analyse d'Impact permet aux équipes produit de **comprendre instantanément les conséquences** d'une modification de document (PRD, Epic, User Story, Spec, Canvas…) sur l'ensemble de l'écosystème :

- **Documentation** liée (autres artefacts dans le même contexte)
- **Code source** (fichiers mappés via `feature_code_map`)
- **Tests** (indexés via `test_index`)
- **Données & KPIs** (tables et métriques via `feature_data_map`)

### Philosophie

Le système fonctionne en **mode continu et proactif** : il ne faut pas demander une analyse, elle se déclenche automatiquement dès qu'un artefact est modifié. L'utilisateur est notifié en temps réel et peut consulter les résultats quand il le souhaite.

### Positionnement dans Nova

L'Analyse d'Impact est accessible via l'onglet dédié dans le workspace. Un **badge de notification** dans la sidebar indique le nombre d'impacts non revus (fenêtre glissante de 7 jours).

---

## 2. Architecture technique

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUX COMPLET                                │
│                                                                     │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────┐              │
│  │ Artifact │───▶│ DB Trigger    │───▶│ impact_queue │              │
│  │  Save    │    │ (PostgreSQL)  │    │ (debounce    │              │
│  └──────────┘    └───────────────┘    │  30 sec)     │              │
│                                       └──────┬───────┘              │
│                                              │                      │
│                                    Supabase Realtime                │
│                                              │                      │
│                                       ┌──────▼───────┐              │
│                                       │  Frontend    │              │
│                                       │  Listener    │              │
│                                       └──────┬───────┘              │
│                                              │                      │
│                                       ┌──────▼───────────┐          │
│                                       │ auto-impact-     │          │
│                                       │ check (EF)       │          │
│                                       └──────┬───────────┘          │
│                                              │                      │
│                                       ┌──────▼───────────┐          │
│                                       │ analyze-impact   │          │
│                                       │ (EF + LLM)       │          │
│                                       └──────┬───────────┘          │
│                                              │                      │
│                          ┌───────────────────┼───────────────┐      │
│                          │                   │               │      │
│                   ┌──────▼──────┐  ┌─────────▼────┐  ┌──────▼────┐ │
│                   │ impact_runs │  │ impact_items  │  │ link_     │ │
│                   │             │  │               │  │suggestions│ │
│                   └──────┬──────┘  └───────────────┘  └───────────┘ │
│                          │                                          │
│                   Supabase Realtime                                 │
│                          │                                          │
│                   ┌──────▼──────────────────────────────────┐       │
│                   │              UI                          │       │
│                   │  Feed │ Executive │ Technical │ Data     │       │
│                   │  Actions │ Diff │ Suggestions │ Liens   │       │
│                   └─────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

### Composants techniques

| Couche | Technologie | Rôle |
|---|---|---|
| Trigger DB | PostgreSQL Function + Trigger | Détecte les `UPDATE` sur `artifacts`, insère dans `impact_queue` |
| Queue | Table `impact_queue` | File d'attente avec debounce de 30 secondes (`scheduled_at`) |
| Realtime | Supabase Realtime (postgres_changes) | Notifie le frontend des nouveaux items en queue et des runs complétés |
| Orchestrateur | Frontend React (useEffect) | Écoute la queue, attend `scheduled_at`, puis invoque `auto-impact-check` |
| Processeur | Edge Function `auto-impact-check` | Traite les items de la queue en batch (max 10) |
| Analyseur | Edge Function `analyze-impact` | Classification LLM, propagation, génération des impact items |
| LLM | Gemini 2.5 Flash via AI Gateway | Classification des changements et extraction d'entités |
| UI | React Components (8 vues) | Visualisation, revue, export |

---

## 3. Schéma de données

### Tables principales

#### `impact_queue`
File d'attente pour les analyses automatiques.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `artefact_id` | uuid (FK → artifacts) | Artefact modifié |
| `user_id` | uuid | Propriétaire |
| `status` | text | `pending` → `processing` → `completed` / `skipped` |
| `scheduled_at` | timestamptz | Heure planifiée (now() + 30s par défaut) |
| `impact_run_id` | uuid (FK → impact_runs) | Run résultant (après complétion) |
| `created_at` | timestamptz | Date de création |

#### `impact_runs`
Un run d'analyse complet pour un artefact donné.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `artefact_id` | uuid (FK → artifacts) | Artefact analysé |
| `artefact_version_id` | uuid (FK → artefact_versions) | Version créée pendant l'analyse |
| `trigger_change_set_id` | uuid (FK → change_sets) | Change set déclencheur |
| `impact_score` | numeric | Score global (0–100) |
| `summary` | jsonb | Résumé structuré (voir ci-dessous) |
| `status` | text | `pending` / `running` / `completed` / `failed` |
| `user_id` | uuid | Propriétaire |
| `created_at` | timestamptz | Début de l'analyse |
| `completed_at` | timestamptz | Fin de l'analyse |

**Structure du `summary`** :
```json
{
  "total_changes": 5,
  "type_breakdown": { "business_rule_update": 2, "scope_change": 1, ... },
  "high_severity_count": 1,
  "linked_artefacts": 3,
  "manual_links": 2,
  "code_files_impacted": 8,
  "tests_impacted": 4,
  "data_tables_impacted": 2,
  "data_kpis_impacted": 1
}
```

#### `impact_items`
Chaque élément impacté par un changement.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `impact_run_id` | uuid (FK → impact_runs) | Run parent |
| `item_name` | text | Nom de l'élément impacté (titre d'artefact, chemin de fichier, nom de table…) |
| `item_type` | text | `documentation` / `backlog` / `spec` / `code` / `test` / `data` / `kpi` |
| `impact_score` | numeric | Score d'impact individuel (0–5) |
| `impact_reason` | text | Explication textuelle de l'impact |
| `review_status` | text | `pending` / `review_required` / `reviewed` / `ignored` |
| `related_artefact_id` | uuid | Artefact lié (si applicable) |
| `metadata` | jsonb | Métadonnées contextuelles (change_type, entity, file_path, coupling, impact_type…) |

#### `link_suggestions`
Suggestions de liens automatiques générées par le LLM.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `artefact_id` | uuid (FK → artifacts) | Artefact source |
| `suggested_target_type` | text | `code` / `data` / `artefact` / `test` |
| `suggested_target_id` | text | Identifiant de la cible (file_path, table_name, ou artifact UUID) |
| `suggested_link_type` | text | Type de lien (`depends_on`, `implements`, `uses_data`…) |
| `confidence` | numeric | Score de confiance (0–1) |
| `reasoning` | text | Explication du LLM |
| `status` | text | `pending` / `accepted` / `rejected` |
| `user_id` | uuid | Propriétaire |

### Tables de versioning

#### `artefact_versions`
Historique versionné du contenu des artefacts.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant |
| `artefact_id` | uuid (FK → artifacts) | Artefact parent |
| `version_number` | integer | Numéro de version incrémental |
| `content` | jsonb | Snapshot complet du contenu |
| `previous_version_id` | uuid (FK → self) | Version précédente |
| `author_id` | uuid | Auteur de la modification |

#### `change_sets`
Ensemble de changements classifiés par le LLM entre deux versions.

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant |
| `artefact_version_id` | uuid (FK → artefact_versions) | Version associée |
| `changes_json` | jsonb | Array de changements classifiés (voir [section 8](#8-types-de-changements-détectés)) |

### Tables de liaison

#### `artefact_links`
Liens manuels entre artefacts et autres entités.

| Colonne | Type | Description |
|---|---|---|
| `source_id` | uuid (FK → artifacts) | Artefact source |
| `target_type` | text | `artefact` / `code` / `test` / `kpi` |
| `target_id` | text | Identifiant de la cible |
| `link_type` | text | `depends_on` / `implements` / `tests` / `tracks`… |
| `confidence_score` | numeric | Score de confiance |

### Tables d'indexation

#### `code_index`
Index des fichiers code du projet.

| Colonne | Type | Description |
|---|---|---|
| `file_path` | text | Chemin du fichier |
| `symbols` | text[] | Symboles exportés (fonctions, classes…) |
| `description` | text | Description du fichier |
| `language` | text | Langage de programmation |
| `last_commit` | text | Dernier commit |

#### `feature_code_map`
Lien entre un artefact (feature) et des fichiers code.

| Colonne | Type | Description |
|---|---|---|
| `feature_id` | uuid (FK → artifacts) | Artefact/feature |
| `file_path` | text | Chemin du fichier |
| `confidence` | numeric | Confiance du lien (0–1) |
| `link_source` | text | `manual` / `ai_suggested` |
| `code_index_id` | uuid (FK → code_index) | Entrée d'index liée |

#### `test_index`
Index des tests du projet.

| Colonne | Type | Description |
|---|---|---|
| `test_file` | text | Chemin du fichier test |
| `test_name` | text | Nom du test |
| `test_type` | text | `unit` / `integration` / `e2e` |
| `related_feature_id` | uuid (FK → artifacts) | Feature liée |
| `related_file_path` | text | Fichier source testé |

#### `data_index`
Index des tables de données du projet.

| Colonne | Type | Description |
|---|---|---|
| `table_name` | text | Nom de la table |
| `columns` | text[] | Colonnes |
| `description` | text | Description |
| `source_type` | text | `postgres` / `api` / `event_stream` |
| `used_by_dashboards` | text[] | Dashboards utilisant cette table |

#### `feature_data_map`
Lien entre un artefact et des données/KPIs.

| Colonne | Type | Description |
|---|---|---|
| `feature_id` | uuid (FK → artifacts) | Artefact/feature |
| `table_name` | text | Table liée |
| `event_name` | text | Événement associé (optionnel) |
| `kpi_name` | text | KPI associé (optionnel) |
| `confidence` | numeric | Confiance du lien (0–1) |

---

## 4. Edge Functions

### `analyze-impact`

**Fichier** : `supabase/functions/analyze-impact/index.ts`  
**JWT** : `verify_jwt = false` (appelé en interne par `auto-impact-check` avec `SERVICE_ROLE_KEY`)

#### Entrées

```typescript
{
  artefactId: string;          // UUID de l'artefact
  newContent: any;             // Contenu actuel (JSON)
  previousContent?: any;       // Contenu précédent (optionnel)
  userId: string;              // UUID de l'utilisateur
  generateLinkSuggestions?: boolean; // Active le Smart Auto-Linking
}
```

#### Pipeline de traitement

1. **Versioning** : Crée une nouvelle `artefact_version` (incrémente `version_number`)
2. **Classification LLM** : Envoie les deux versions au LLM (Gemini 2.5 Flash) pour classifier les changements
3. **Sauvegarde** : Insère le `change_set` avec les changements classifiés
4. **Collecte des liens** : Requête parallèle sur `artefact_links`, `feature_code_map`, `test_index`, `feature_data_map` + artefacts dans le même `product_context`
5. **Calcul du score** : Somme des scores de sévérité (low=1, medium=3, high=5), plafonné à 100
6. **Création du run** : Insère dans `impact_runs` avec le summary
7. **Génération des items** : Crée les `impact_items` pour chaque élément impacté (avec déduplication par clé `type:id`)
8. **Smart Auto-Linking** (si `generateLinkSuggestions=true`) : Appel LLM supplémentaire pour matcher le contenu avec `code_index` et `data_index`

#### Sorties

```typescript
{
  impactRun: ImpactRun;
  changes: Change[];
  itemCount: number;
  codeImpacts: number;
  testImpacts: number;
  dataImpacts: number;
  kpiImpacts: number;
  linkSuggestions: number;
}
```

### `auto-impact-check`

**Fichier** : `supabase/functions/auto-impact-check/index.ts`  
**JWT** : `verify_jwt = false`

#### Rôle
Processeur de queue qui traite les items `pending` de `impact_queue` dont le `scheduled_at` est passé.

#### Pipeline

1. Récupère jusqu'à 10 items `pending` dont `scheduled_at ≤ now()`
2. Pour chaque item :
   - Marque comme `processing`
   - Récupère le contenu de l'artefact
   - Appelle `analyze-impact` avec `SERVICE_ROLE_KEY`
   - Marque comme `completed` avec le `impact_run_id` résultant
3. Retourne `{ processed, errors, total }`

---

## 5. Composants UI

### Vue d'ensemble des 8 vues

| Vue | Composant | Description |
|---|---|---|
| **Fil (Feed)** | `ImpactFeed` | Chronologie de tous les runs, avec tendance (hausse/baisse/stable) |
| **Exécutif** | `ExecutiveView` | Dashboard de risque : score global, zones critiques, progression de revue |
| **Technique** | `TechnicalView` | Items groupés par type (Documentation, Backlog, Spec, Code, Tests) avec actions de revue |
| **Données** | `DataView` | Tables impactées, KPIs à risque, gestion des mappings data |
| **Actions** | `ActionLayer` | Génération de livrables (Checklist, Plan de test, Rapport complet) |
| **Diff** | `ImpactDiffView` | Comparaison entre deux runs (Nouveaux / Résolus / Persistants) |
| **Auto-liens** | `LinkSuggestions` | Suggestions de liens IA avec validation humaine (Accepter/Rejeter) |
| **Liens** | Code-Tests view | Gestion manuelle des liens Code, Tests et Données |

### `ImpactNotificationBadge`

**Fichier** : `src/components/impact-analysis/ImpactNotificationBadge.tsx`

Badge rouge affiché dans la sidebar. Compte les `impact_items` avec `review_status = 'pending'` créés dans les 7 derniers jours. Se met à jour en temps réel via Supabase Realtime sur `impact_queue`.

### `ImpactFeed`

**Fichier** : `src/components/impact-analysis/ImpactFeed.tsx`

Fil chronologique des runs complétés. Affiche :
- Titre de l'artefact et type
- Score d'impact avec code couleur (≥15 rouge, ≥8 ambre, <8 vert)
- Nombre de changements et de critiques
- Tendance : compare la moyenne des 5 derniers runs vs les 5 précédents

Mode `compact` disponible pour l'intégration dans le Dashboard.

### `ExecutiveView`

**Fichier** : `src/components/impact-analysis/views/ExecutiveView.tsx`

Dashboard de synthèse pour les décideurs :
- **Score global** avec niveau de risque (Critique/Élevé/Modéré/Faible)
- **Changements détectés** (total + haute sévérité)
- **Éléments impactés** (total + à revoir)
- **Progression de revue** (barre de progression)
- **Zones critiques** (Documentation / Technique / Données)
- **Alertes haute sévérité** (top 5)
- **Répartition des changements** par type

### `TechnicalView`

**Fichier** : `src/components/impact-analysis/views/TechnicalView.tsx`

Vue détaillée avec tabs par type d'item :
- Chaque item affiche nom, raison, sévérité (Critique/Modéré/Faible), statut de revue
- Actions : Marquer comme revu ✓, Ignorer ✕, Détails 👁
- Détails extensibles : type de changement, entité, fichier, couplage

### `DataView`

**Fichier** : `src/components/impact-analysis/views/DataView.tsx`

Vue dédiée aux données et KPIs :
- Gestion des mappings `feature_data_map` (ajout/suppression)
- Tables impactées avec détails (impact_type, couplage)
- KPIs à risque avec code couleur

### `ActionLayer`

**Fichier** : `src/components/impact-analysis/views/ActionLayer.tsx`

Génération de livrables exportables en Markdown :
- **Checklist** : Items à revoir, code impacté, tests, données, KPIs
- **Plan de test** : Tests à revalider + code à couvrir
- **Rapport complet** : Résumé exécutif + détail par catégorie

### `ImpactDiffView`

**Fichier** : `src/components/impact-analysis/ImpactDiffView.tsx`

Comparaison entre deux runs d'analyse :
- Sélection de deux runs (Avant/Après)
- Delta de score avec indicateur visuel
- Trois colonnes : Nouveaux impacts / Résolus / Persistants

### `LinkSuggestions`

**Fichier** : `src/components/impact-analysis/LinkSuggestions.tsx`

Interface de validation des suggestions IA :
- Bouton "Générer" pour lancer l'extraction d'entités via LLM
- Chaque suggestion affiche : type (code/data/artefact), cible, type de lien, confiance, raisonnement
- Actions : Accepter (crée le lien réel) / Rejeter

---

## 6. Flux automatique

### Séquence complète

```
1. L'utilisateur modifie un artefact (UPDATE sur artifacts)
         │
2. Trigger PostgreSQL `trg_enqueue_impact_on_artifact_update`
   → INSERT INTO impact_queue (artefact_id, user_id, scheduled_at = now() + 30s)
         │
3. Supabase Realtime notifie le frontend (canal 'impact-auto-trigger')
         │
4. Frontend détecte un item avec status='pending'
   → Calcule le délai restant avant scheduled_at
   → setTimeout(() => invoke('auto-impact-check'), delay)
         │
5. auto-impact-check récupère les items pending dont scheduled_at ≤ now()
   → Pour chaque item : marque 'processing', récupère l'artefact, appelle analyze-impact
         │
6. analyze-impact exécute le pipeline complet (versioning → LLM → propagation → items)
         │
7. auto-impact-check marque l'item 'completed' avec l'impact_run_id
         │
8. Supabase Realtime notifie le frontend (canal 'impact-notifications')
   → ImpactNotificationBadge se met à jour
   → ImpactFeed se rafraîchit
   → Toast "Nova a détecté de nouveaux impacts"
```

### Debounce (30 secondes)

Le trigger DB insère dans `impact_queue` avec `scheduled_at = now() + 30s`. Si l'utilisateur fait plusieurs modifications rapides, seule la dernière version sera analysée car le frontend attend le `scheduled_at` avant de déclencher.

---

## 7. Smart Auto-Linking

### Principe

Le Smart Auto-Linking utilise un LLM pour **extraire les entités** mentionnées dans un artefact et les **matcher** avec les fichiers code (`code_index`) et tables de données (`data_index`) de l'utilisateur.

### Pipeline

1. **Déclenchement** : L'utilisateur clique "Générer" dans la vue Auto-liens, ou le flag `generateLinkSuggestions=true` est passé à `analyze-impact`
2. **Collecte du contexte** : Récupération de `code_index` et `data_index` de l'utilisateur (max 50 entrées chacun)
3. **Prompt LLM** : Le contenu de l'artefact et les index disponibles sont envoyés au LLM avec une instruction de matching
4. **Parsing** : Le LLM retourne un array JSON de suggestions avec `target_type`, `target_id`, `link_type`, `confidence`, `reasoning`
5. **Insertion** : Les suggestions sont insérées dans `link_suggestions` avec `status = 'pending'`
6. **Validation humaine** : L'utilisateur voit les suggestions dans l'UI et peut :
   - **Accepter** → Crée le lien réel (`feature_code_map`, `feature_data_map`, ou `artefact_links`)
   - **Rejeter** → Marque comme `rejected`

### Types de liens suggérés

| Target Type | Lien créé | Table cible |
|---|---|---|
| `code` | Fichier code lié | `feature_code_map` |
| `data` | Table de données liée | `feature_data_map` |
| `artefact` | Dépendance entre artefacts | `artefact_links` |

---

## 8. Types de changements détectés

Le LLM classifie chaque changement dans l'une des 9 catégories suivantes :

| Type | Description | Exemple |
|---|---|---|
| `business_rule_update` | Modification d'une règle métier | "La remise passe de 10% à 15% pour les commandes > 100€" |
| `data_field_added` | Ajout d'un champ de données | "Ajout du champ `loyalty_tier` au profil utilisateur" |
| `data_field_modified` | Modification d'un champ existant | "Le champ `status` accepte maintenant la valeur `suspended`" |
| `nfr_change` | Changement d'exigence non-fonctionnelle | "Le temps de réponse API passe de 500ms à 200ms" |
| `scope_change` | Modification du périmètre | "Ajout du marché allemand au scope du projet" |
| `persona_change` | Modification d'un persona | "Le persona `Admin` gagne des droits d'export" |
| `kpi_change` | Modification d'un KPI | "L'objectif de conversion passe de 3% à 5%" |
| `timeline_change` | Modification du planning | "La date de livraison passe du 15 mars au 1er avril" |
| `dependency_change` | Modification d'une dépendance | "Migration de Stripe v2 vers v3" |

Chaque changement a une **sévérité** : `low`, `medium`, ou `high`.

---

## 9. Scoring

### Score global (Impact Run)

```
score = Σ severity_value(change)    (plafonné à 100)
```

| Sévérité | Valeur |
|---|---|
| `low` | 1 |
| `medium` | 3 |
| `high` | 5 |

### Score individuel (Impact Item)

Le score d'un item dépend de sa source :

#### Artefacts liés (documentation, backlog, spec)
```
score = severity_value    (1, 3, ou 5)
```

#### Code
```
score = min(severity_value × coupling, 5)
```
Où `coupling` = confiance du lien dans `feature_code_map` (0–1).

#### Tests
```
score = severity_value    (ajusté : high=4, medium=2, low=1)
```

#### Données
```
score = min(severity_value × coupling × data_multiplier, 5)
```
- `data_multiplier` = 1.5 si le changement est de type `data_field_added` ou `data_field_modified`

#### KPIs
```
score = min(severity_value × kpi_multiplier, 5)
```
- `kpi_multiplier` = 2 si le changement est de type `kpi_change`

### Niveaux de risque (UI)

| Score global | Niveau | Couleur |
|---|---|---|
| ≥ 15 | Critique | Rouge |
| ≥ 8 | Élevé | Ambre |
| ≥ 3 | Modéré | Jaune |
| < 3 | Faible | Vert |

### Statuts de revue

| Statut | Déclencheur |
|---|---|
| `review_required` | Sévérité `high`, ou changement data non-low, ou lien manuel |
| `pending` | Défaut pour les items de sévérité low/medium |
| `reviewed` | Action utilisateur (bouton ✓) |
| `ignored` | Action utilisateur (bouton ✕) |

---

## 10. Livrables exportables

La vue **Actions** permet de générer 3 types de documents Markdown :

### Checklist d'Impact
```markdown
# Checklist d'Impact — Score: 12
Date: 25/02/2026
Changements: 5

## À revoir
- [ ] [CODE] src/services/pricing.ts — Review Required: Business rule update
- [ ] [TEST] pricing.test.ts — Revalidation Required

## Code impacté
- [ ] src/services/pricing.ts (score: 4.5)

## Tests à revalider
- [ ] pricing.test.ts (score: 4)

## Données à vérifier
- [ ] public.orders — Schema Risk: data_field_added

## KPIs à surveiller
- [ ] Taux de conversion — KPI Drift Risk: kpi_change
```

### Plan de Test
Détaille les tests à revalider, le code à couvrir par de nouveaux tests, et les données à valider.

### Rapport Complet
Résumé exécutif avec tous les compteurs, puis détail par catégorie avec statuts de revue.

---

## 11. Guide d'utilisation

### Pré-requis

1. **Créer des artefacts** (PRD, Epics, Stories…) dans un Contexte Produit
2. **Lier du code** : Onglet "Liens" → Ajouter des fichiers code via `feature_code_map`
3. **Lier des tests** : Onglet "Liens" → Ajouter des tests via `test_index`
4. **Lier des données** : Vue "Données" → Ajouter des tables/KPIs via `feature_data_map`
5. **Indexer le code** : Peupler `code_index` (manuellement ou via import Git)

### Utilisation quotidienne

1. **Modifier un artefact** → L'analyse se déclenche automatiquement après 30s
2. **Vérifier le badge** dans la sidebar → Nombre d'impacts non revus
3. **Consulter le Fil** → Vue chronologique de tous les impacts récents
4. **Examiner la vue Exécutif** → Score global et zones critiques
5. **Passer en vue Technique** → Revoir chaque item impacté
6. **Vérifier les Données** → S'assurer que les tables et KPIs ne sont pas en risque
7. **Utiliser le Diff** → Comparer deux analyses pour voir l'évolution
8. **Générer des suggestions** → Vue Auto-liens pour enrichir les mappings
9. **Exporter** → Vue Actions pour générer Checklist, Plan de test, ou Rapport

### Analyse manuelle

En plus du flux automatique, vous pouvez lancer une analyse à la demande via le bouton **"Lancer l'analyse"** dans l'en-tête de la page.

---

## Annexes

### Sécurité (RLS)

Toutes les tables sont protégées par Row Level Security :
- `impact_queue` : `auth.uid() = user_id`
- `impact_runs` : `auth.uid() = user_id`
- `impact_items` : Via sous-requête sur `impact_runs.user_id`
- `link_suggestions` : `auth.uid() = user_id`
- `artefact_links` : `auth.uid() = user_id`
- `feature_code_map` : `auth.uid() = user_id`
- `test_index` : `auth.uid() = user_id`
- `feature_data_map` : `auth.uid() = user_id`

### Realtime

Les tables suivantes sont ajoutées à la publication Supabase Realtime :
- `impact_queue`
- `impact_runs`
- `impact_items`

### Configuration Edge Functions

| Fonction | `verify_jwt` | Raison |
|---|---|---|
| `analyze-impact` | `false` | Appelé en interne par `auto-impact-check` avec `SERVICE_ROLE_KEY` |
| `auto-impact-check` | `false` | Appelé par le frontend (anon) et en interne |
