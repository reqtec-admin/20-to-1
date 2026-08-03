import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth / email-confirmation callback. Exchanges the auth code for a session
 * and redirects back into the app. Used when email confirmations or social
 * providers are enabled.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
