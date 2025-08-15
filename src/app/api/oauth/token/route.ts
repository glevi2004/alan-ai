import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/google/googleOauth";
import { TokenService } from "@/lib/firebase/googleTokenStorage";

export async function GET(request: NextRequest) {
  console.log("🔑 [Token API] Getting access token...");
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.log("❌ [Token API] No user ID provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("👤 [Token API] Getting tokens for user:", userId);

    // Get tokens from database
    const tokens = await TokenService.getTokens(userId);

    if (!tokens) {
      console.log("❌ [Token API] No tokens found for user:", userId);
      return NextResponse.json(
        { error: "User not connected to Google Calendar" },
        { status: 404 }
      );
    }

    console.log("✅ [Token API] Tokens found, checking expiry...");

    // Check if access token is expired
    if (TokenService.isTokenExpired(tokens)) {
      console.log("🔄 [Token API] Access token expired, refreshing...");

      // Refresh the access token
      const newCredentials = await refreshAccessToken(tokens.refresh_token);

      // Update tokens in database
      await TokenService.updateTokens(userId, {
        access_token: newCredentials.access_token!,
        expiry_date: newCredentials.expiry_date ?? undefined,
      });

      console.log("✅ [Token API] Token refreshed successfully");

      return NextResponse.json({
        access_token: newCredentials.access_token,
        expires_in: newCredentials.expiry_date
          ? newCredentials.expiry_date - Date.now()
          : 3600,
      });
    }

    console.log("✅ [Token API] Returning valid access token");

    return NextResponse.json({
      access_token: tokens.access_token,
      expires_in: tokens.expiry_date ? tokens.expiry_date - Date.now() : 3600,
    });
  } catch (error) {
    console.error("❌ [Token API] Error getting access token:", error);
    return NextResponse.json(
      { error: "Failed to get access token" },
      { status: 500 }
    );
  }
}
