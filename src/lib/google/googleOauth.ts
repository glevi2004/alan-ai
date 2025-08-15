import { OAuth2Client } from "google-auth-library";

// Google OAuth configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri:
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth/redirect",
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
};

// Create OAuth2 client
export const createOAuth2Client = () => {
  return new OAuth2Client(
    GOOGLE_OAUTH_CONFIG.clientId,
    GOOGLE_OAUTH_CONFIG.clientSecret,
    GOOGLE_OAUTH_CONFIG.redirectUri
  );
};

// Generate authorization URL
export const generateAuthUrl = (state?: string) => {
  console.log("🔧 [OAuth] Creating OAuth2 client...");
  const oauth2Client = createOAuth2Client();
  console.log(
    "🔧 [OAuth] Client ID configured:",
    !!GOOGLE_OAUTH_CONFIG.clientId
  );
  console.log(
    "🔧 [OAuth] Client Secret configured:",
    !!GOOGLE_OAUTH_CONFIG.clientSecret
  );
  console.log("🔧 [OAuth] Redirect URI:", GOOGLE_OAUTH_CONFIG.redirectUri);
  console.log("🔧 [OAuth] Scopes:", GOOGLE_OAUTH_CONFIG.scopes);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // This is crucial for getting refresh tokens
    scope: GOOGLE_OAUTH_CONFIG.scopes,
    prompt: "consent", // Force consent screen to ensure refresh token
    state: state || "default",
  });

  console.log("🔧 [OAuth] Generated auth URL with state:", state || "default");
  return authUrl;
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  console.log("🔄 [OAuth] Starting token exchange...");
  const oauth2Client = createOAuth2Client();

  try {
    console.log("🔄 [OAuth] Calling Google OAuth API...");
    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ [OAuth] Token exchange successful");
    console.log("🔄 [OAuth] Token response keys:", Object.keys(tokens));
    return tokens;
  } catch (error) {
    console.error("❌ [OAuth] Error exchanging code for tokens:", error);
    throw error;
  }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};
