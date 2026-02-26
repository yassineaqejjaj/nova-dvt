import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { impactRunId, artefactId, artefactTitle, artefactType, impactScore, summary, impactItems, links, userId, productContextName } = await req.json();

    if (!impactRunId || !artefactId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables not configured");
    }

    // Build the prompt with all the data
    const itemsByType: Record<string, any[]> = {};
    for (const item of (impactItems || [])) {
      if (!itemsByType[item.item_type]) itemsByType[item.item_type] = [];
      itemsByType[item.item_type].push(item);
    }

    const riskLevel = impactScore >= 15 ? 'Critique' : impactScore >= 8 ? 'Élevé' : impactScore >= 3 ? 'Modéré' : 'Faible';

    const systemPrompt = `Tu es un consultant senior en Product Management et en analyse d'impact. Tu rédiges des rapports professionnels, structurés et actionnables pour des comités de pilotage et des équipes produit.

Ton rapport doit suivre exactement cette structure :

1. **Résumé Exécutif** (2-3 paragraphes)
   - Contexte du changement analysé
   - Score de risque global et niveau (${riskLevel}, score ${impactScore})
   - Recommandation principale (Go / Go conditionnel / No-Go)

2. **Périmètre de l'Analyse**
   - Artefact analysé et son type
   - Date de l'analyse
   - Nombre total de changements détectés
   - Couverture de l'analyse (documentation, code, tests, données, KPIs)

3. **Cartographie des Impacts** (par zone)
   Pour chaque zone impactée (Documentation, Technique, Données & KPIs), détaille :
   - Les éléments impactés avec leur niveau de sévérité
   - La raison précise de l'impact
   - Le statut de revue actuel

4. **Analyse de Risque**
   - Risques critiques identifiés (score >= 4)
   - Risques modérés (score 2-3)
   - Dépendances et effets de cascade
   - Zones d'ombre ou points insuffisamment couverts

5. **Matrice de Décision**
   - Tableau des impacts par priorité
   - Critères de décision Go/No-Go
   - Conditions préalables à respecter

6. **Plan d'Action Recommandé**
   - Actions immédiates (avant mise en production)
   - Actions à court terme (sprint suivant)
   - Actions à moyen terme (prochain trimestre)
   Chaque action doit avoir : description, responsable suggéré, priorité, effort estimé

7. **Annexes**
   - Liste complète des éléments impactés
   - Relations et dépendances identifiées

Règles de rédaction :
- Langage professionnel, direct, sans jargon inutile
- Chaque section commence par un constat factuel
- Les recommandations sont concrètes et priorisées
- Utilise des listes à puces pour la lisibilité
- Le ton est celui d'un conseil stratégique, pas d'un outil technique
- Rédige en français`;

    const userPrompt = `Génère le rapport complet d'analyse d'impact pour les données suivantes :

**Artefact analysé :** ${artefactTitle || 'Sans titre'} (${artefactType || 'inconnu'})
${productContextName ? `**Contexte produit :** ${productContextName}` : ''}
**Date d'analyse :** ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Score de risque global :** ${impactScore} / 20 — Niveau : ${riskLevel}

**Résumé de l'analyse :**
- Changements totaux : ${summary?.total_changes || 0}
- Haute sévérité : ${summary?.high_severity_count || 0}
- Artefacts liés : ${summary?.linked_artefacts || 0}
- Fichiers code impactés : ${summary?.code_files_impacted || 0}
- Tests impactés : ${summary?.tests_impacted || 0}

**Répartition par type :**
${summary?.type_breakdown ? Object.entries(summary.type_breakdown).map(([t, c]) => `- ${t}: ${c}`).join('\n') : 'Non disponible'}

**Éléments impactés (${(impactItems || []).length} au total) :**
${Object.entries(itemsByType).map(([type, items]) => {
  return `\n### ${type.toUpperCase()} (${items.length} éléments)\n${items.map((i: any) => 
    `- **${i.item_name}** [Score: ${i.impact_score}, Statut: ${i.review_status}]\n  Raison : ${i.impact_reason || 'Non spécifiée'}`
  ).join('\n')}`;
}).join('\n')}

**Relations existantes (${(links || []).length}) :**
${(links || []).map((l: any) => `- ${l.link_type} → ${l.target_type}:${l.target_id}`).join('\n') || 'Aucune relation configurée'}

Rédige maintenant le rapport complet et professionnel.`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits AI insuffisants. Rechargez votre espace de travail." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const reportContent = aiData.choices?.[0]?.message?.content || '';

    if (!reportContent) {
      throw new Error("Le rapport n'a pas pu être généré");
    }

    // Save as artifact
    const reportDate = new Date().toLocaleDateString('fr-FR');
    const artifactTitle = `Rapport d'Impact — ${artefactTitle || 'Analyse'} — ${reportDate}`;

    const { data: artifact, error: insertError } = await fetch(`${SUPABASE_URL}/rest/v1/artifacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        title: artifactTitle,
        artifact_type: "impact_report",
        content: {
          report_markdown: reportContent,
          impact_run_id: impactRunId,
          source_artefact_id: artefactId,
          source_artefact_title: artefactTitle,
          impact_score: impactScore,
          risk_level: riskLevel,
          generated_at: new Date().toISOString(),
          items_count: (impactItems || []).length,
          summary: summary || {},
        },
        metadata: {
          source_artifact_id: artefactId,
          impact_run_id: impactRunId,
          workflow_source: 'impact_analysis_report',
          generated_by: 'nova_ai',
        },
      }),
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text();
        console.error("Insert artifact error:", t);
        return { data: null, error: t };
      }
      const d = await r.json();
      return { data: d[0] || d, error: null };
    });

    if (insertError) {
      console.error("Failed to save artifact:", insertError);
    }

    return new Response(
      JSON.stringify({
        report: reportContent,
        artifactId: artifact?.id || null,
        artifactTitle,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("generate-impact-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
