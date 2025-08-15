import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { TokenService } from "@/lib/firebase/googleTokenStorage";
import { refreshAccessToken } from "./googleOauth";

export class GoogleCalendarService {
  private static getOAuth2Client(refreshToken: string): OAuth2Client {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return oauth2Client;
  }

  static async getEvents(userId: string, timeMin?: string, timeMax?: string) {
    try {
      // Get tokens from database
      const tokens = await TokenService.getTokens(userId);

      if (!tokens) {
        throw new Error("User not connected to Google Calendar");
      }

      // Check if tokens are expired and refresh if needed
      if (TokenService.isTokenExpired(tokens)) {
        const newCredentials = await refreshAccessToken(tokens.refresh_token);
        await TokenService.updateTokens(userId, {
          access_token: newCredentials.access_token!,
          expiry_date: newCredentials.expiry_date ?? undefined,
        });
        tokens.access_token = newCredentials.access_token!;
        tokens.expiry_date = newCredentials.expiry_date ?? undefined;
      }

      const oauth2Client = this.getOAuth2Client(tokens.refresh_token);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const params: any = {
        calendarId: "primary",
        timeMin: timeMin || new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      };

      if (timeMax) {
        params.timeMax = timeMax;
      }

      const response = await calendar.events.list(params);
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      throw error;
    }
  }

  static async createEvent(userId: string, eventData: any) {
    console.log("📅 [GoogleCalendarService] Creating event for user:", userId);
    console.log(
      "📋 [GoogleCalendarService] Event data:",
      JSON.stringify(eventData, null, 2)
    );

    try {
      // Get tokens from database
      console.log("🔑 [GoogleCalendarService] Getting tokens from database...");
      const tokens = await TokenService.getTokens(userId);

      if (!tokens) {
        console.log(
          "❌ [GoogleCalendarService] No tokens found for user:",
          userId
        );
        throw new Error("User not connected to Google Calendar");
      }

      console.log(
        "✅ [GoogleCalendarService] Tokens found, checking expiry..."
      );

      // Check if tokens are expired and refresh if needed
      if (TokenService.isTokenExpired(tokens)) {
        console.log("🔄 [GoogleCalendarService] Tokens expired, refreshing...");
        const newCredentials = await refreshAccessToken(tokens.refresh_token);
        await TokenService.updateTokens(userId, {
          access_token: newCredentials.access_token!,
          expiry_date: newCredentials.expiry_date ?? undefined,
        });
        tokens.access_token = newCredentials.access_token!;
        tokens.expiry_date = newCredentials.expiry_date ?? undefined;
        console.log("✅ [GoogleCalendarService] Tokens refreshed successfully");
      } else {
        console.log("✅ [GoogleCalendarService] Tokens are valid");
      }

      console.log("🔧 [GoogleCalendarService] Creating OAuth2 client...");
      const oauth2Client = this.getOAuth2Client(tokens.refresh_token);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      console.log("✅ [GoogleCalendarService] Calendar client created");

      console.log(
        "📋 [GoogleCalendarService] Preparing event data for Google Calendar..."
      );
      const event = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start.dateTime,
          timeZone: eventData.start.timeZone || "UTC",
        },
        end: {
          dateTime: eventData.end.dateTime,
          timeZone: eventData.end.timeZone || "UTC",
        },
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      console.log(
        "📅 [GoogleCalendarService] Event data prepared:",
        JSON.stringify(event, null, 2)
      );
      console.log("🚀 [GoogleCalendarService] Calling Google Calendar API...");

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      console.log(
        "✅ [GoogleCalendarService] Google Calendar API response received"
      );
      console.log(
        "🆔 [GoogleCalendarService] Created event ID:",
        response.data.id
      );
      console.log(
        "🔗 [GoogleCalendarService] Event HTML Link:",
        response.data.htmlLink
      );

      return response.data;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }

  // Remove placeholder methods as we now use TokenService
}
