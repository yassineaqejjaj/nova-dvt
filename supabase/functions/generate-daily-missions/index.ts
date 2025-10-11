import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Mission {
  title: string;
  description: string;
  mission_type: string;
  xp_reward: number;
  coins_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string;
}

const missionTemplates: Mission[] = [
  // Easy missions
  {
    title: "Morning Kickstart",
    description: "Ouvre Nova pour commencer ta journée",
    mission_type: "open_app",
    xp_reward: 10,
    coins_reward: 2,
    difficulty: "easy",
    estimated_time: "30 sec"
  },
  {
    title: "Quick PRD",
    description: "Génère 1 PRD via Instant PRD",
    mission_type: "create_prd",
    xp_reward: 50,
    coins_reward: 10,
    difficulty: "easy",
    estimated_time: "2 min"
  },
  {
    title: "Share the Love",
    description: "Partage 1 artefact avec un collègue",
    mission_type: "share_artifact",
    xp_reward: 30,
    coins_reward: 5,
    difficulty: "easy",
    estimated_time: "1 min"
  },
  {
    title: "Feedback Hero",
    description: "Commente 1 PRD d'un teammate",
    mission_type: "give_feedback",
    xp_reward: 20,
    coins_reward: 3,
    difficulty: "easy",
    estimated_time: "3 min"
  },
  {
    title: "Context Master",
    description: "Mets à jour ton contexte projet",
    mission_type: "update_context",
    xp_reward: 25,
    coins_reward: 5,
    difficulty: "easy",
    estimated_time: "2 min"
  },
  // Medium missions
  {
    title: "Workflow Warrior",
    description: "Complète 1 workflow complet",
    mission_type: "complete_workflow",
    xp_reward: 100,
    coins_reward: 20,
    difficulty: "medium",
    estimated_time: "20 min"
  },
  {
    title: "Quality Craftsman",
    description: "Obtiens un Quality Score ≥90 sur 1 artefact",
    mission_type: "quality_score",
    xp_reward: 75,
    coins_reward: 15,
    difficulty: "medium",
    estimated_time: "15 min"
  },
  {
    title: "Collaboration King",
    description: "Invite 1 nouveau user",
    mission_type: "invite_user",
    xp_reward: 150,
    coins_reward: 30,
    difficulty: "medium",
    estimated_time: "5 min"
  },
  // Hard missions
  {
    title: "Triple Threat",
    description: "Crée 3 artefacts différents (Epic, Story, Spec) en 1 jour",
    mission_type: "create_multiple",
    xp_reward: 300,
    coins_reward: 50,
    difficulty: "hard",
    estimated_time: "1h"
  },
  {
    title: "Perfectionist",
    description: "Obtiens 5 artefacts avec Score 95+",
    mission_type: "perfect_score",
    xp_reward: 500,
    coins_reward: 100,
    difficulty: "hard",
    estimated_time: "2h"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('user_id');

    if (profilesError) throw profilesError;

    const today = new Date().toISOString().split('T')[0];
    let generatedCount = 0;

    // Generate missions for each user
    for (const profile of profiles || []) {
      // Check if user already has missions for today
      const { data: existing } = await supabaseClient
        .from('daily_missions')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('mission_date', today)
        .limit(1);

      if (existing && existing.length > 0) {
        continue; // Skip if missions already exist
      }

      // Select missions: 3 easy, 1-2 medium, 0-1 hard
      const easyMissions = missionTemplates.filter(m => m.difficulty === 'easy');
      const mediumMissions = missionTemplates.filter(m => m.difficulty === 'medium');
      const hardMissions = missionTemplates.filter(m => m.difficulty === 'hard');

      const selectedMissions = [
        ...shuffleArray(easyMissions).slice(0, 3),
        ...shuffleArray(mediumMissions).slice(0, Math.random() > 0.5 ? 2 : 1),
        ...(Math.random() > 0.7 ? shuffleArray(hardMissions).slice(0, 1) : [])
      ];

      // Insert missions for user
      const missionsToInsert = selectedMissions.map(mission => ({
        user_id: profile.user_id,
        mission_date: today,
        ...mission
      }));

      const { error: insertError } = await supabaseClient
        .from('daily_missions')
        .insert(missionsToInsert);

      if (insertError) {
        console.error(`Error inserting missions for user ${profile.user_id}:`, insertError);
      } else {
        generatedCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated missions for ${generatedCount} users`,
        date: today
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-daily-missions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
