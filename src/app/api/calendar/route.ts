import { NextRequest, NextResponse } from "next/server";
import { GoogleCalendarService } from "@/lib/google/googleCalendarService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const events = await GoogleCalendarService.getEvents(
      userId,
      timeMin || undefined,
      timeMax || undefined
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error in calendar API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const eventData = await request.json();
    const event = await GoogleCalendarService.createEvent(userId, eventData);

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error in calendar API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
