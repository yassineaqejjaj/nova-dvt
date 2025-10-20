import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎁 Starting mystery box deployment...');

    // Parse request body
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

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate expiration date
    const expiresAt = expires_in_hours 
      ? new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString()
      : null;

    console.log(`📦 Box Type: ${box_type}`);
    console.log(`⏰ Expires At: ${expiresAt || 'Never'}`);
    if (campaign_name) {
      console.log(`🎯 Campaign: ${campaign_name}`);
    }

    // Get all user IDs from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      throw new Error(`Failed to fetch users: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️ No users found in profiles table');
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

    // Prepare mystery boxes for all users
    const mysteryBoxes = profiles.map(profile => ({
      user_id: profile.user_id,
      box_type,
      opened: false,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    }));

    // Insert mystery boxes in batch
    const { data: insertedBoxes, error: insertError } = await supabase
      .from('mystery_boxes')
      .insert(mysteryBoxes)
      .select();

    const failedUserIds: string[] = [];
    let successCount = 0;

    if (insertError) {
      console.error('❌ Batch insert error:', insertError);
      // If batch insert fails, try individual inserts
      console.log('🔄 Retrying with individual inserts...');
      
      for (const box of mysteryBoxes) {
        const { error: individualError } = await supabase
          .from('mystery_boxes')
          .insert(box);
        
        if (individualError) {
          console.error(`❌ Failed for user ${box.user_id}:`, individualError.message);
          failedUserIds.push(box.user_id);
        } else {
          successCount++;
        }
      }
    } else {
      successCount = insertedBoxes?.length || 0;
      console.log(`✅ Successfully deployed ${successCount} mystery boxes`);
    }

    // Prepare deployment report
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

    console.log('📊 Deployment Report:', report);

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
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
