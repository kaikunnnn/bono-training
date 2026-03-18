import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * clear-migrated-flag
 *
 * パスワード再設定完了後に呼び出され、ユーザーの raw_user_meta_data から
 * migrated_from フラグを削除する。
 *
 * これにより、パスワード再設定済みのユーザーがログインに失敗した際に
 * 「パスワード再設定が必要です」という移行ユーザー向けメッセージが
 * 表示されなくなる。
 */
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create Supabase client with user's token to get user info
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get the current user from the token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error("Failed to get user from token:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Clearing migrated_from flag for user: ${user.email} (${user.id})`);

    // Check if user has migrated_from in metadata
    const currentMetadata = user.user_metadata || {};
    if (!currentMetadata.migrated_from) {
      console.log(`User ${user.email} does not have migrated_from flag, skipping`);
      return new Response(
        JSON.stringify({ success: true, message: "No migration flag to clear" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Remove migrated_from from raw_user_meta_data using admin API
    // We need to use SQL to properly remove the key from JSONB
    const { error: updateError } = await supabaseAdmin.rpc('clear_user_migrated_flag', {
      p_user_id: user.id
    });

    if (updateError) {
      console.error("Failed to clear migrated_from flag:", updateError);
      // Don't fail the request - password update was successful
      // Just log the error and return success
      return new Response(
        JSON.stringify({ success: true, message: "Password updated, but failed to clear migration flag", warning: updateError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully cleared migrated_from flag for user: ${user.email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Migration flag cleared successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    // Don't fail the request for unexpected errors
    return new Response(
      JSON.stringify({ success: true, message: "Password updated, but error clearing migration flag", error: String(err) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
