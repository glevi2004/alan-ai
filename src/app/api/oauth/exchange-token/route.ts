import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google/googleOauth";

export async function POST(request: NextRequest) {
  console.log("🔄 [OAuth] Exchanging code for tokens...");
  try {
    const { code } = await request.json();
    console.log(
      "📝 [OAuth] Received authorization code:",
      code ? code.substring(0, 20) + "..." : "NO CODE"
    );

    if (!code) {
      console.log("❌ [OAuth] No authorization code provided");
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const tokens = await exchangeCodeForTokens(code);
    console.log("✅ [OAuth] Tokens received successfully");
    console.log("🔑 [OAuth] Access token present:", !!tokens.access_token);
    console.log("🔄 [OAuth] Refresh token present:", !!tokens.refresh_token);
    console.log("⏰ [OAuth] Token expiry:", tokens.expiry_date);

    return NextResponse.json({ tokens });
  } catch (error: any) {
    console.error("❌ [OAuth] Error exchanging code for tokens:", error);

    // Handle specific OAuth errors
    if (error.message?.includes("invalid_grant")) {
      return NextResponse.json(
        { error: "Authorization code has expired or already been used" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to exchange authorization code" },
      { status: 500 }
    );
  }
}
