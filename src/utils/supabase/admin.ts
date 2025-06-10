import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABSE_SERVICE_ROLE_KEY as string,
  {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    }
  }
)

export default supabaseAdmin;
