import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
    try {
        // getting token for authentication supabase
        const token = request.headers.get("authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        // Validate environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing Supabase environment variables");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Creating a Supabase client
        const supabaseServer = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            }
        );

        //  Get the user from the token
        const { data: userData, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !userData?.user) {
            console.error("User authentication failed:", userError?.message);
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const user = userData.user;

        // get the profile from the database
        const { data, error } = await supabaseServer
            .from("Student Profile")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Profile query failed:", error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (err) {
        console.error("Unhandled error in /api/profile:", err);
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Internal server error"
        }, { status: 500 });
    }
}
