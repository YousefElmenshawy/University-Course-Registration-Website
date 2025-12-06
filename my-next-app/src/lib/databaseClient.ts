//supabse Client setup to connect to the Database

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client factory (uses service role key)
//  this is used in API routes including AI assitant 
export const createServerClient = (authToken?: string) => {
    return createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        authToken ? {
            global: {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        } : undefined
    );
};
