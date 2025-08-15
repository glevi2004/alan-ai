import { useState } from "react";

export const useGoogleOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAuthUrl = async () => {
    console.log("🔗 [Hook] Generating auth URL...");
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔗 [Hook] Fetching from /api/oauth/generate-url...");
      const response = await fetch("/api/oauth/generate-url");
      const data = await response.json();
      console.log("🔗 [Hook] Response received:", {
        status: response.status,
        hasAuthUrl: !!data.authUrl,
      });

      if (data.authUrl) {
        console.log("✅ [Hook] Auth URL generated successfully");
        return data.authUrl;
      } else {
        console.log("❌ [Hook] Failed to generate auth URL:", data.error);
        throw new Error(data.error || "Failed to generate auth URL");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.log("❌ [Hook] Error in generateAuthUrl:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeCodeForTokens = async (code: string) => {
    console.log("🔄 [Hook] Exchanging code for tokens...");

    // Prevent multiple calls with the same code
    if (isLoading) {
      console.log("🔄 [Hook] Already loading, skipping duplicate call");
      throw new Error("Token exchange already in progress");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 [Hook] Sending POST to /api/oauth/exchange-token...");
      const response = await fetch("/api/oauth/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log("🔄 [Hook] Response received:", {
        status: response.status,
        hasTokens: !!data.tokens,
      });

      if (!response.ok) {
        console.log("❌ [Hook] Exchange failed:", data.error);
        throw new Error(data.error || "Failed to exchange code for tokens");
      }

      console.log("✅ [Hook] Token exchange successful");
      return data.tokens;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.log("❌ [Hook] Error in exchangeCodeForTokens:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAuthUrl,
    exchangeCodeForTokens,
    isLoading,
    error,
  };
};
