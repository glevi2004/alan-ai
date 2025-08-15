import { NextRequest } from "next/server";
import { GoogleCalendarService } from "@/lib/google/googleCalendarService";

// Your n8n webhook URL - replace with your actual webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;

export async function POST(req: NextRequest) {
  const { messages, chatId, userId } = await req.json();

  // Get the last user message
  const last = [...messages].filter((m: any) => m.role === "user").pop();
  if (!last) return new Response("No user message", { status: 400 });

  // Fetch user's timezone if userId is provided
  let userTimeZone = null;
  if (userId) {
    try {
      console.log("🌍 [Chat API] Fetching timezone for user:", userId);
      const calendarSettings = await GoogleCalendarService.getCalendarSettings(
        userId
      );
      userTimeZone = calendarSettings.timeZone;
      console.log("🌍 [Chat API] User's timezone:", userTimeZone);
    } catch (error) {
      console.log("⚠️ [Chat API] Could not fetch user timezone:", error);
      // Continue without timezone if there's an error
    }
  }

  // Create n8n message format with app identification and timezone
  const n8nMessage = {
    app_source: "alan-ai-webapp",
    user_id: userId || "user-123",
    chat_id: chatId || `chat_${Date.now()}`,
    conversation_id: chatId || `conv_${userId}_${Date.now()}`,
    message: last.content,
    timestamp: Date.now().toString(),
    message_id: `msg_${Date.now()}`,
    user_timezone: userTimeZone,
  };

  // Send the message to n8n
  const r = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n8nMessage),
  });

  // Accept either JSON or text from n8n
  const ct = r.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await r.json()
    : await r.text();
  const text =
    typeof data === "string"
      ? data
      : data.response || data.message || data.content || "OK";

  console.log("🔍 n8n response:", text);

  // Return the response to the client (chat component expects text)
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
