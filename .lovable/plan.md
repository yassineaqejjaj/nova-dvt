

# Phase 4 – Analyse d'Impact Automatique & Intelligence Continue

## Constat actuel

Après les Phases 1-3, le moteur d'impact est puissant mais **réactif** : l'utilisateur doit manuellement sélectionner un artefact et cliquer "Lancer l'analyse". La Phase 4 transforme ce système en un **moteur proactif et continu**.

---

## Vision Phase 4 : "Impact-as-a-Service"

Trois piliers :

```text
┌──────────────────────────────────────────────────────┐
│                    PHASE 4                           │
│                                                      │
│  1. AUTO-TRIGGER       2. IMPACT FEED       3. SMART │
│     Sur chaque save       Fil d'alertes        LINKS │
│     d'artefact            temps réel           Auto-  │
│     → analyse auto        → notifications     mapping│
│     → score diff          → historique         LLM    │
│                           → tendances                │
└──────────────────────────────────────────────────────┘
```

---

## Pilier 1 – Auto-Trigger on Save

**Problème** : L'analyse doit être lancée manuellement.

**Solution** : Intercepter chaque sauvegarde d'artefact et déclencher automatiquement l'analyse.

### Implémentation

- **Database trigger** : Un trigger PostgreSQL `AFTER UPDATE` sur la table `artifacts` détecte les changements de `content` et insère un enregistrement dans une nouvelle table `impact_queue` (artefact_id, user_id, status: pending, created_at).
- **Polling ou Realtime** : Le frontend écoute `impact_queue` via Supabase Realtime. Quand un run se termine, une notification toast apparaît : "Nova a détecté 3 impacts sur votre PRD".
- **Debounce** : Si l'artefact est modifié plusieurs fois en < 30 secondes, on ne déclenche qu'une seule analyse (regroupement via un champ `scheduled_at` décalé de 30s).
- **Edge function `auto-impact-check`** : Appelée périodiquement ou par webhook, elle traite les entrées `impact_queue` en status `pending`, appelle `analyze-impact`, puis met à jour le status à `completed`.

### Table `impact_queue`
```text
impact_queue
├── id (uuid)
├── artefact_id (uuid)
├── user_id (uuid)
├── status (pending | processing | completed | skipped)
├── impact_run_id (uuid, nullable) → résultat
├── scheduled_at (timestamptz)
├── created_at (timestamptz)
```

---

## Pilier 2 – Impact Feed & Notifications

**Problème** : Les résultats d'analyse sont isolés dans un onglet dédié, sans visibilité globale.

**Solution** : Un fil d'alertes transversal et un système de notifications.

### Composants UI

1. **Impact Feed** (nouveau composant dans le Dashboard) :
   - Liste chronologique des analyses récentes
   - Chaque entrée : artefact modifié, score, nombre d'items impactés, date
   - Code couleur par sévérité (rouge/jaune/vert)
   - Clic → navigation vers le rapport détaillé

2. **Badge de notification** dans la sidebar :
   - Compteur d'impacts non-revus sur l'icône "Analyse d'Impact"
   - Se met à jour en temps réel via Supabase Realtime

3. **Impact Summary Card** sur le Dashboard principal :
   - "3 analyses récentes, 12 items à revoir"
   - Top 3 alertes haute sévérité
   - Bouton "Voir tout"

4. **Impact Trend** (mini-graphe) :
   - Score d'impact moyen sur les 30 derniers jours
   - Tendance hausse/baisse

---

## Pilier 3 – Smart Auto-Linking (LLM)

**Problème** : Les liens artefact↔code, artefact↔test, artefact↔data sont manuels.

**Solution** : Utiliser le LLM pour suggérer automatiquement des liens lors de la création d'un artefact.

### Logique

- Quand un artefact est créé ou mis à jour significativement :
  1. Extraire les entités clés du contenu (features, data fields, endpoints)
  2. Comparer avec les entrées existantes de `code_index`, `test_index`, `data_index`
  3. Proposer des liens avec un `confidence_score`
  4. Afficher dans l'UI : "Nova suggère de lier cet artefact à 3 fichiers code" avec Accept/Reject
- Les suggestions acceptées deviennent des entrées dans `feature_code_map`, `feature_data_map`, etc. avec `link_source = 'ai_suggested'`.

### Table `link_suggestions`
```text
link_suggestions
├── id (uuid)
├── artefact_id (uuid)
├── suggested_target_type (code | test | data | artefact)
├── suggested_target_id (text)
├── suggested_link_type (text)
├── confidence (numeric)
├── reasoning (text) → explication LLM
├── status (pending | accepted | rejected)
├── user_id (uuid)
├── created_at (timestamptz)
```

---

## Bonus – Impact Diff View

- Quand un artefact a plusieurs `impact_runs`, permettre de **comparer deux analyses** côte à côte :
  - Nouveaux impacts apparus
  - Impacts résolus
  - Score delta
- Utile pour voir si une modification a empiré ou amélioré la situation.

---

## Résumé des fichiers à créer/modifier

| Fichier | Action |
|---|---|
| `supabase/migrations/phase4_*.sql` | Tables `impact_queue`, `link_suggestions` |
| `supabase/functions/auto-impact-check/index.ts` | Edge function de traitement automatique |
| `src/components/impact-analysis/ImpactFeed.tsx` | Fil d'alertes chronologique |
| `src/components/impact-analysis/ImpactNotificationBadge.tsx` | Badge sidebar temps réel |
| `src/components/impact-analysis/ImpactDiffView.tsx` | Comparaison entre runs |
| `src/components/impact-analysis/LinkSuggestions.tsx` | UI suggestions auto-linking |
| `src/components/impact-analysis/ImpactAnalysis.tsx` | Intégration feed + suggestions |
| `src/components/dashboard/ActionDashboard.tsx` | Card résumé impact sur dashboard |
| `src/components/navigation/WorkSidebar.tsx` | Badge notification |
| `supabase/functions/analyze-impact/index.ts` | Appel auto-linking après analyse |
| `supabase/config.toml` | Nouvelle edge function |

---

## Séquence d'implémentation recommandée

1. **Tables & migration** (impact_queue + link_suggestions)
2. **Auto-trigger** (edge function + debounce)
3. **Impact Feed** (composant + intégration dashboard)
4. **Notification badge** (Realtime + sidebar)
5. **Smart Auto-Linking** (LLM suggestions + UI accept/reject)
6. **Impact Diff View** (comparaison entre runs)

