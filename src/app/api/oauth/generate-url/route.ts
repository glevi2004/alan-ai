import { NextRequest, NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/google/googleOauth";

export async function GET(request: NextRequest) {
  console.log("🔗 [OAuth] Generating auth URL...");
  try {
    const authUrl = generateAuthUrl();
    console.log(
      "✅ [OAuth] Auth URL generated successfully:",
      authUrl.substring(0, 100) + "..."
    );
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("❌ [OAuth] Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
