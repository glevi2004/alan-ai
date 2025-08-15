import { NextRequest, NextResponse } from "next/server";
import { GoogleCalendarService } from "@/lib/google/googleCalendarService";

export async function GET(request: NextRequest) {
  console.log("🔧 [Calendar Settings API] Getting calendar settings...");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.log("❌ [Calendar Settings API] No user ID provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(
      "👤 [Calendar Settings API] Getting settings for user:",
      userId
    );

    // Get calendar settings
    const settings = await GoogleCalendarService.getCalendarSettings(userId);

    console.log("✅ [Calendar Settings API] Retrieved calendar settings");
    console.log(
      "🌍 [Calendar Settings API] User's timezone:",
      settings.timeZone
    );

    return NextResponse.json({
      success: true,
      settings: {
        timeZone: settings.timeZone,
        summary: settings.summary,
        description: settings.description,
      },
    });
  } catch (error: any) {
    console.error("❌ [Calendar Settings API] Error getting settings:", error);

    // Handle specific errors
    if (error.message?.includes("User not connected")) {
      return NextResponse.json(
        { error: "User not connected to Google Calendar" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get calendar settings" },
      { status: 500 }
    );
  }
}
