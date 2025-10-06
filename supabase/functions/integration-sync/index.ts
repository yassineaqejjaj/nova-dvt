import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { integration_id, action, data } = await req.json();

    if (!integration_id || !action) {
      return new Response(
        JSON.stringify({ error: 'integration_id and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get integration config
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError) throw integrationError;

    if (!integration.is_active) {
      return new Response(
        JSON.stringify({ error: 'Integration is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (integration.integration_type) {
      case 'jira':
        result = await syncJira(integration.config, action, data);
        break;
      case 'slack':
        result = await syncSlack(integration.config, action, data);
        break;
      case 'figma':
        result = await syncFigma(integration.config, action, data);
        break;
      default:
        throw new Error(`Unsupported integration type: ${integration.integration_type}`);
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing integration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncJira(config: any, action: string, data: any) {
  const { domain, email, api_token, project_key } = config;
  const auth = btoa(`${email}:${api_token}`);

  if (action === 'create_issue') {
    const response = await fetch(`https://${domain}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: project_key },
          summary: data.title,
          description: data.description,
          issuetype: { name: 'Task' },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API error: ${error}`);
    }

    return await response.json();
  }

  throw new Error(`Unsupported Jira action: ${action}`);
}

async function syncSlack(config: any, action: string, data: any) {
  const { webhook_url } = config;

  if (action === 'send_message') {
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: data.message,
        attachments: data.attachments || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return { sent: true };
  }

  throw new Error(`Unsupported Slack action: ${action}`);
}

async function syncFigma(config: any, action: string, data: any) {
  const { access_token, team_id } = config;

  if (action === 'get_files') {
    const response = await fetch(`https://api.figma.com/v1/teams/${team_id}/projects`, {
      headers: {
        'X-Figma-Token': access_token,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.statusText}`);
    }

    return await response.json();
  }

  throw new Error(`Unsupported Figma action: ${action}`);
}