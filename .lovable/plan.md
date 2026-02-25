

# Plan : Documentation de la fonctionnalité Analyse d'Impact

## Objectif
Créer un fichier `docs/impact-analysis.md` contenant la documentation complète de la fonctionnalité, couvrant l'architecture, le flux de données, les composants UI, les tables DB, les edge functions, et le guide d'utilisation.

## Contenu du document

Le fichier documentera :

1. **Vue d'ensemble** : Objectif, philosophie ("Impact-as-a-Service"), et positionnement dans Nova
2. **Architecture technique** : Diagramme ASCII du flux complet (Artifact Save → Trigger → Queue → Realtime → Edge Function → LLM → Impact Items → UI)
3. **Schéma de données** : Les 10 tables impliquées (`impact_queue`, `impact_runs`, `impact_items`, `link_suggestions`, `artefact_versions`, `change_sets`, `artefact_links`, `code_index`/`feature_code_map`, `test_index`, `data_index`/`feature_data_map`)
4. **Edge Functions** : `analyze-impact` (classification LLM, propagation, auto-linking) et `auto-impact-check` (traitement de la queue)
5. **Composants UI** : Les 8 vues (Feed, Executive, Technical, Data, Actions, Diff, Auto-liens, Liens) + NotificationBadge
6. **Flux automatique** : Trigger DB → debounce 30s → Realtime → frontend orchestration → edge function
7. **Smart Auto-Linking** : Extraction d'entités LLM, matching code/data index, validation humaine
8. **Types de changements détectés** : 9 catégories (business_rule_update, data_field_added, etc.)
9. **Scoring** : Logique de calcul des scores (sévérité × couplage × multiplicateurs)
10. **Livrables exportables** : Checklist, Plan de test, Rapport complet (Markdown)

## Fichier à créer
- `docs/impact-analysis.md`

## Aucun changement fonctionnel
Documentation pure, aucune modification de code.

