

# Diagnostic : ce qui reste pour un fonctionnement bout-en-bout

Après analyse complète du code, de la base de données et des edge functions, voici l'état actuel et les lacunes identifiées.

---

## Ce qui fonctionne déjà

| Composant | Statut |
|---|---|
| DB trigger `trg_enqueue_impact_on_artifact_update` sur `artifacts` | Actif |
| Tables `impact_queue`, `link_suggestions`, `impact_runs`, `impact_items` | Créées, RLS OK |
| Edge function `analyze-impact` (LLM classification, propagation code/tests/data) | Déployée |
| Edge function `auto-impact-check` (traitement queue) | Déployée |
| UI : vues Executive, Technical, Data, Actions, Feed, Diff, Suggestions, Liens | Implémentées |
| ImpactNotificationBadge dans la sidebar | Présent |
| ImpactFeed dans le dashboard | Présent |

---

## Ce qui ne fonctionne PAS encore (7 points)

### 1. Realtime non activé sur les tables critiques
**Impact** : Les composants `ImpactNotificationBadge` et `ImpactFeed` utilisent `supabase.channel().on('postgres_changes')` sur `impact_queue` et `impact_runs`, mais **ces tables ne sont pas ajoutées à la publication Supabase Realtime**. Aucune notification temps réel ne sera reçue.

**Fix** : Migration SQL pour activer Realtime :
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE impact_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE impact_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE impact_items;
```

### 2. Auto-impact-check n'est jamais appelée automatiquement
Le trigger DB insère bien dans `impact_queue`, mais **personne n'appelle `auto-impact-check`**. L'edge function attend d'être invoquée manuellement ou par un cron, mais il n'y a :
- Aucun cron/scheduler configuré
- Aucun appel frontend après la queue insertion
- Aucun webhook PostgreSQL

**Fix** : Ajouter un appel frontend polling ou un cron. L'approche la plus simple : le frontend, quand il détecte un item `pending` en Realtime (après le fix n°1), appelle `auto-impact-check`. Alternative : appeler `auto-impact-check` depuis le DB trigger via `pg_net` (extension Supabase).

### 3. Le ImpactNotificationBadge ne filtre pas par user_id côté query
Le composant fait un `select('id', { count: 'exact' }).eq('review_status', 'pending')` sans filtre `user_id`. Grâce au RLS c'est filtré, mais le RLS sur `impact_items` utilise une sous-requête sur `impact_runs.user_id`, ce qui est correct. Cependant, le count risque de compter TOUS les pending items de l'utilisateur y compris des anciens runs — pas uniquement les non-revus récents. Ce n'est pas un bug bloquant mais c'est un problème UX.

**Fix** : Ajouter un filtre sur les runs récents ou un champ `viewed` sur `impact_items`.

### 4. LinkSuggestions : le `analyze-impact` ne génère pas de suggestions
Le composant `LinkSuggestions` appelle `analyze-impact` avec `generateLinkSuggestions: true`, mais **l'edge function `analyze-impact` ignore complètement ce paramètre**. Elle ne lit ni `codeIndex`, ni `dataIndex`, et n'insère rien dans `link_suggestions`.

**Fix** : Ajouter la logique de génération de suggestions dans `analyze-impact` (ou créer une edge function dédiée) : 
1. Lire le paramètre `generateLinkSuggestions`
2. Appeler le LLM pour extraire les entités et matcher avec `code_index`/`data_index`
3. Insérer les suggestions dans `link_suggestions`

### 5. ImpactFeed `onNavigateToRun` ne fonctionne pas correctement
Le callback `onNavigateToRun` reçoit un `artefactId`, mais le parent le traite comme `setSelectedArtifact(id); setViewMode('executive')` — sauf que le `id` passé est bien l'artefact ID. C'est correct syntaxiquement, mais le `selectedArtifact` ne se met pas à jour dans le Select sans que l'effet cascade ne se déclenche bien. C'est un point à vérifier fonctionnellement.

### 6. Dashboard `ActionDashboard` : la card Impact Feed est intégrée mais sans lien de navigation vers l'onglet Impact
Le `ImpactFeed compact` est affiché dans le dashboard, mais le `onNavigateToRun` callback doit naviguer vers l'onglet `impact-analysis`. Il faut vérifier que le `onNavigate('impact-analysis')` est bien câblé.

### 7. `auto-impact-check` utilise `SUPABASE_ANON_KEY` pour appeler `analyze-impact`
L'edge function `auto-impact-check` appelle `analyze-impact` avec un `Bearer ${SUPABASE_ANON_KEY}`, mais `analyze-impact` a `verify_jwt = true`. L'anon key produit un JWT valide mais **sans `user_id` dans `auth.uid()`**, ce qui fait que les requêtes RLS échoueront silencieusement dans `analyze-impact` (les inserts avec `user_id` ne correspondront pas à `auth.uid()`). L'edge function `analyze-impact` utilise `SUPABASE_SERVICE_ROLE_KEY` pour ses propres requêtes, donc ça pourrait fonctionner — mais l'auth header du call initial échouera si le JWT n'est pas valide.

**Fix** : Utiliser `SUPABASE_SERVICE_ROLE_KEY` comme Bearer dans l'appel à `analyze-impact` depuis `auto-impact-check`, ou passer `verify_jwt = false` pour `analyze-impact` et valider manuellement l'auth dans le code.

---

## Plan d'implémentation (par priorité)

### Étape 1 — Activer Realtime (migration SQL)
Ajouter `impact_queue`, `impact_runs`, `impact_items` à la publication Realtime.

### Étape 2 — Orchestrer l'auto-trigger
Option A (recommandée) : Le frontend écoute `impact_queue` en Realtime. Quand un item `pending` apparaît et que `scheduled_at` est passé, il appelle `auto-impact-check`.
Option B : Utiliser `pg_net` pour appeler l'edge function directement depuis le trigger DB.

### Étape 3 — Fixer l'auth de `auto-impact-check` → `analyze-impact`
Utiliser le `SERVICE_ROLE_KEY` comme Bearer token pour l'appel inter-functions.

### Étape 4 — Implémenter la génération de `link_suggestions` dans `analyze-impact`
Ajouter la branche LLM qui extrait les entités et propose des liens.

### Étape 5 — Améliorer le badge notification
Filtrer par runs récents (7 derniers jours) pour éviter un compteur qui grossit indéfiniment.

### Étape 6 — Câbler la navigation Dashboard → Impact Analysis
S'assurer que le clic sur le Feed dans le dashboard navigue correctement vers le bon onglet et artefact.

---

## Résumé des fichiers à modifier

| Fichier | Modification |
|---|---|
| `supabase/migrations/new_realtime.sql` | Activer Realtime sur 3 tables |
| `supabase/functions/auto-impact-check/index.ts` | Fix auth token (SERVICE_ROLE_KEY) |
| `supabase/functions/analyze-impact/index.ts` | Ajouter logique `link_suggestions` |
| `src/components/impact-analysis/ImpactAnalysis.tsx` | Ajouter polling/auto-trigger via Realtime |
| `src/components/impact-analysis/ImpactNotificationBadge.tsx` | Filtre temporel sur le count |
| `src/components/dashboard/ActionDashboard.tsx` | Câbler navigation onNavigateToRun |

