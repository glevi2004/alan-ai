import { NextRequest, NextResponse } from "next/server";
import { GoogleCalendarService } from "@/lib/google/googleCalendarService";

export async function POST(request: NextRequest) {
  console.log("📅 [Calendar Events API] Creating calendar event...");
  console.log("🌐 [Calendar Events API] Request URL:", request.url);
  console.log("📋 [Calendar Events API] Request method:", request.method);
  console.log(
    "🔗 [Calendar Events API] Request headers:",
    Object.fromEntries(request.headers.entries())
  );
  console.log(
    "⏰ [Calendar Events API] Request timestamp:",
    new Date().toISOString()
  );

  try {
    const body = await request.json();
    console.log(
      "📦 [Calendar Events API] Request body:",
      JSON.stringify(body, null, 2)
    );
    const {
      userId,
      summary,
      description,
      startDateTime,
      endDateTime,
      timeZone,
      attendees,
    } = body;

    // Validate required fields
    if (!userId || !summary || !startDateTime || !endDateTime) {
      console.log("❌ [Calendar Events API] Missing required fields");
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, summary, startDateTime, endDateTime",
        },
        { status: 400 }
      );
    }

    console.log("👤 [Calendar Events API] Creating event for user:", userId);
    console.log("📝 [Calendar Events API] Event summary:", summary);
    console.log("📅 [Calendar Events API] Event details:");
    console.log("  - Start:", startDateTime);
    console.log("  - End:", endDateTime);
    console.log("  - Timezone:", timeZone || "UTC");
    console.log("  - Attendees:", attendees?.length || 0);

    // Prepare event data
    const eventData = {
      summary,
      description: description || "",
      start: {
        dateTime: startDateTime,
        timeZone: timeZone || "",
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone || "",
      },
      attendees: attendees || [],
    };

    // Create the event
    console.log(
      "🚀 [Calendar Events API] Calling GoogleCalendarService.createEvent..."
    );
    const event = await GoogleCalendarService.createEvent(userId, eventData);

    console.log("✅ [Calendar Events API] Event created successfully");
    console.log("🆔 [Calendar Events API] Event ID:", event.id);
    console.log("🔗 [Calendar Events API] Event HTML Link:", event.htmlLink);
    console.log("📅 [Calendar Events API] Event start:", event.start);
    console.log("📅 [Calendar Events API] Event end:", event.end);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink,
      },
    });
  } catch (error: any) {
    console.error("❌ [Calendar Events API] Error creating event:", error);

    // Handle specific errors
    if (error.message?.includes("User not connected")) {
      return NextResponse.json(
        { error: "User not connected to Google Calendar" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log("📅 [Calendar Events API] Getting calendar events...");
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!userId) {
      console.log("❌ [Calendar Events API] No user ID provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("👤 [Calendar Events API] Getting events for user:", userId);

    // Get events
    const events = await GoogleCalendarService.getEvents(
      userId,
      timeMin || undefined,
      timeMax || undefined
    );

    console.log("✅ [Calendar Events API] Retrieved", events.length, "events");

    return NextResponse.json({
      success: true,
      events: events.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink,
      })),
    });
  } catch (error: any) {
    console.error("❌ [Calendar Events API] Error getting events:", error);

    // Handle specific errors
    if (error.message?.includes("User not connected")) {
      return NextResponse.json(
        { error: "User not connected to Google Calendar" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get calendar events" },
      { status: 500 }
    );
  }
}
