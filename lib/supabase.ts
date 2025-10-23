import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SupabaseDatabase = Record<string, never>;

export function getSupabaseServiceRoleClient(): SupabaseClient<SupabaseDatabase> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient<SupabaseDatabase>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
