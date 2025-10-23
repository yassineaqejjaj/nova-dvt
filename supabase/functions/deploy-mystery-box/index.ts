import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeployRequest {
  box_type: 'common' | 'rare' | 'epic' | 'legendary';
  expires_in_hours?: number;
  campaign_name?: string;
}

interface DeploymentReport {
  success: boolean;
  campaign_name?: string;
  box_type: string;
  expires_at: string | null;
  deployment: {
    total_users: number;
    boxes_deployed: number;
    errors: number;
    failed_user_ids: string[];
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Admin role check
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🎁 Starting mystery box deployment...');

    const { box_type, expires_in_hours = 72, campaign_name }: DeployRequest = await req.json();

    // Validate box_type
    const validTypes = ['common', 'rare', 'epic', 'legendary'];
    if (!validTypes.includes(box_type)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid box_type. Must be one of: ${validTypes.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const expiresAt = expires_in_hours 
      ? new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString()
      : null;

    console.log(`📦 Box Type: ${box_type}`);
    console.log(`⏰ Expires At: ${expiresAt || 'Never'}`);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      throw new Error('Failed to fetch users');
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No users to deploy boxes to',
          deployment: {
            total_users: 0,
            boxes_deployed: 0,
            errors: 0,
            failed_user_ids: []
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`👥 Found ${profiles.length} users`);

    const mysteryBoxes = profiles.map(profile => ({
      user_id: profile.user_id,
      box_type,
      opened: false,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    }));

    const { data: insertedBoxes, error: insertError } = await supabase
      .from('mystery_boxes')
      .insert(mysteryBoxes)
      .select();

    const failedUserIds: string[] = [];
    let successCount = 0;

    if (insertError) {
      console.error('❌ Batch insert error');
      
      for (const box of mysteryBoxes) {
        const { error: individualError } = await supabase
          .from('mystery_boxes')
          .insert(box);
        
        if (individualError) {
          failedUserIds.push(box.user_id);
        } else {
          successCount++;
        }
      }
    } else {
      successCount = insertedBoxes?.length || 0;
      console.log(`✅ Successfully deployed ${successCount} mystery boxes`);
    }

    const report: DeploymentReport = {
      success: true,
      campaign_name,
      box_type,
      expires_at: expiresAt,
      deployment: {
        total_users: profiles.length,
        boxes_deployed: successCount,
        errors: failedUserIds.length,
        failed_user_ids: failedUserIds,
      },
    };

    return new Response(
      JSON.stringify(report),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Deployment failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
