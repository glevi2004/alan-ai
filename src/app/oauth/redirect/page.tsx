"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleOAuth } from "@/hooks/useGoogleOAuth";
import { auth } from "../../../../firebase/firebaseConfig";
import { TokenService } from "@/lib/firebase/googleTokenStorage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OAuthRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeCodeForTokens } = useGoogleOAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string>("");
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log("🔄 [OAuth Redirect] Starting OAuth callback handling...");

      // Check if we've already processed this callback
      const processedKey = `oauth_processed_${searchParams.get("code")}`;
      if (
        hasProcessedRef.current ||
        status !== "loading" ||
        sessionStorage.getItem(processedKey)
      ) {
        console.log("🔄 [OAuth Redirect] Already processed, skipping...");
        return;
      }

      // Mark as processed immediately
      hasProcessedRef.current = true;
      sessionStorage.setItem(processedKey, "true");
      console.log("🔄 [OAuth Redirect] Marked as processed, continuing...");

      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const state = searchParams.get("state");

        console.log("📝 [OAuth Redirect] URL parameters:");
        console.log(
          "  - Code:",
          code ? code.substring(0, 20) + "..." : "NO CODE"
        );
        console.log("  - Error:", error || "NO ERROR");
        console.log("  - State:", state || "NO STATE");

        if (error) {
          console.log("❌ [OAuth Redirect] OAuth error received:", error);
          setError(`OAuth error: ${error}`);
          setStatus("error");
          return;
        }

        if (!code) {
          console.log("❌ [OAuth Redirect] No authorization code received");
          setError("No authorization code received");
          setStatus("error");
          return;
        }

        console.log(
          "✅ [OAuth Redirect] Authorization code received, exchanging for tokens..."
        );

        // Exchange code for tokens via API
        const tokens = await exchangeCodeForTokens(code);
        console.log("✅ [OAuth Redirect] Token exchange completed");

        if (tokens.refresh_token && auth.currentUser) {
          console.log("✅ [OAuth Redirect] Refresh token and user present");
          console.log(
            "👤 [OAuth Redirect] Current user:",
            auth.currentUser.uid
          );
          console.log(
            "🔄 [OAuth Redirect] Refresh token length:",
            tokens.refresh_token.length
          );
          console.log(
            "🎉 [OAuth Redirect] SUCCESS! Google Calendar connected!"
          );

          // Save the refresh token for the current user
          try {
            await TokenService.storeTokens(auth.currentUser.uid, tokens);
            console.log(
              "💾 [OAuth Redirect] Tokens saved to database successfully"
            );
          } catch (error) {
            console.error("❌ [OAuth Redirect] Failed to save tokens:", error);
            setError("Connected but failed to save tokens. Please try again.");
            setStatus("error");
            return;
          }

          // For now, we'll just redirect back to connections page
          setStatus("success");
          console.log(
            "✅ [OAuth Redirect] Setting success status, redirecting in 2 seconds..."
          );
          setTimeout(() => {
            router.push("/connections");
          }, 2000);
        } else {
          console.log(
            "❌ [OAuth Redirect] Missing refresh token or user not authenticated"
          );
          console.log("  - Refresh token present:", !!tokens.refresh_token);
          console.log("  - User authenticated:", !!auth.currentUser);
          setError("Failed to get refresh token or user not authenticated");
          setStatus("error");
        }
      } catch (err: any) {
        console.error("❌ [OAuth Redirect] OAuth callback error:", err);

        // Handle specific OAuth errors
        if (err.message?.includes("invalid_grant")) {
          setError(
            "Authorization code has expired or already been used. Please try connecting again."
          );
        } else {
          setError("Failed to complete OAuth flow. Please try again.");
        }
        setStatus("error");
      }
    };

    handleOAuthCallback();

    // Cleanup function to remove session storage item
    return () => {
      const processedKey = `oauth_processed_${searchParams.get("code")}`;
      sessionStorage.removeItem(processedKey);
    };
  }, [searchParams, router, exchangeCodeForTokens, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connecting to Google Calendar</CardTitle>
            <CardDescription>
              Please wait while we complete the connection...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Connection Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <button
              onClick={() => router.push("/connections")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Back to Connections
            </button>
            <button
              onClick={() => {
                setStatus("loading");
                setError("");
                // Force a fresh OAuth flow
                router.push("/connections");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">
            Successfully Connected!
          </CardTitle>
          <CardDescription>
            Your Google Calendar has been connected successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Redirecting you back to the connections page...
          </p>
          <LoadingSpinner />
        </CardContent>
      </Card>
    </div>
  );
}
