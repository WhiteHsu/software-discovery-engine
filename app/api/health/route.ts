import { NextResponse } from "next/server";
import {
  getSupabasePublicConfig,
  SOFTWARE_DISCOVERY_SCHEMA,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { url, publishableKey } = getSupabasePublicConfig();

    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" || !publishableKey.trim()) {
      throw new Error("Invalid Supabase public configuration.");
    }

    return NextResponse.json({
      status: "ok",
      configuration: "valid",
      supabaseHost: parsedUrl.host,
      schema: SOFTWARE_DISCOVERY_SCHEMA,
      databaseProbe: "deferred-until-issue-2",
    });
  } catch {
    return NextResponse.json(
      {
        status: "misconfigured",
        configuration: "invalid",
        schema: SOFTWARE_DISCOVERY_SCHEMA,
      },
      { status: 503 },
    );
  }
}
