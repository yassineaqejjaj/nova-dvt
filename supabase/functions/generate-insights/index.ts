import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch user's recent analytics
    const { data: events, error: eventsError } = await supabaseClient
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (eventsError) throw eventsError;

    // Analyze patterns and generate insights
    const insights = [];

    // Insight 1: Framework diversity
    const workflows = events?.filter(e => e.event_type.includes('workflow')) || [];
    if (workflows.length >= 3) {
      const uniqueWorkflows = new Set(workflows.map(w => w.event_type));
      const diversityScore = uniqueWorkflows.size / workflows.length;
      
      if (diversityScore < 0.4) {
        insights.push({
          user_id: userId,
          insight_type: 'diversity',
          title: 'Diversify Your Workflows',
          description: `Your last ${workflows.length} squads used 70% of the same frameworks. Try exploring different workflow types for better outcomes.`,
          data: { diversityScore, workflows: Array.from(uniqueWorkflows) },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Insight 2: Efficiency gains
    const completedWorkflows = events?.filter(
      e => e.event_type.includes('workflow') && e.event_data?.status === 'completed'
    ) || [];
    
    if (completedWorkflows.length > 0) {
      const avgLatency = completedWorkflows.reduce(
        (sum, w) => sum + (w.event_data?.latency || 0), 0
      ) / completedWorkflows.length;
      
      const timeSaved = Math.round((120 - avgLatency / 60) * completedWorkflows.length);
      
      if (timeSaved > 0) {
        insights.push({
          user_id: userId,
          insight_type: 'efficiency',
          title: 'Time Saved This Week',
          description: `Nova saved you ~${Math.round(timeSaved / 60)}h this week compared to manual PRD creation.`,
          data: { timeSaved, workflows: completedWorkflows.length },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Insight 3: Agent usage trend
    const agentConversations = events?.filter(e => e.event_type === 'agent_conversation') || [];
    if (agentConversations.length >= 5) {
      const recentWeek = agentConversations.slice(0, Math.floor(agentConversations.length / 2));
      const olderWeek = agentConversations.slice(Math.floor(agentConversations.length / 2));
      
      const trend = ((recentWeek.length - olderWeek.length) / olderWeek.length) * 100;
      
      if (Math.abs(trend) > 20) {
        insights.push({
          user_id: userId,
          insight_type: 'trend',
          title: trend > 0 ? 'Growing Engagement' : 'Lower Activity',
          description: trend > 0 
            ? `Your agent interactions are up ${Math.round(trend)}% this week. Keep up the momentum!`
            : `Agent interactions dropped ${Math.round(Math.abs(trend))}%. Consider exploring new workflows.`,
          data: { trend, recentCount: recentWeek.length, olderCount: olderWeek.length },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Insert new insights
    if (insights.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('insights')
        .insert(insights);

      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
