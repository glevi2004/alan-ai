"use client";

import { Button } from "@/components/ui/button";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../../firebase/firebaseConfig";
import { useGoogleOAuth } from "@/hooks/useGoogleOAuth";
import { TokenService } from "@/lib/firebase/googleTokenStorage";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ConnectionsPage() {
  const { generateAuthUrl, isLoading, error } = useGoogleOAuth();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Check connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (auth.currentUser) {
        try {
          const tokens = await TokenService.getTokens(auth.currentUser.uid);
          setIsConnected(!!tokens);
        } catch (error) {
          console.error("Error checking connection status:", error);
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
      }
      setCheckingConnection(false);
    };

    checkConnection();
  }, []);

  const handleGoogleCalendar = async () => {
    console.log("🚀 [Connections] Google Calendar connection initiated");
    try {
      // First ensure user is signed in
      if (!auth.currentUser) {
        console.log(
          "🔐 [Connections] User not signed in, triggering sign in..."
        );
        await signInWithPopup(auth, googleProvider);
        console.log("✅ [Connections] User signed in successfully");
      } else {
        console.log(
          "✅ [Connections] User already signed in:",
          auth.currentUser.uid
        );
      }

      // Get Google OAuth URL from API
      console.log("🔗 [Connections] Requesting OAuth URL...");
      const authUrl = await generateAuthUrl();
      console.log("✅ [Connections] OAuth URL received, redirecting...");
      console.log(
        "🔗 [Connections] Redirect URL:",
        authUrl.substring(0, 100) + "..."
      );
      window.location.href = authUrl;
    } catch (error) {
      console.error(
        "❌ [Connections] Google Calendar connection error:",
        error
      );
    }
  };

  const handleDisconnect = async () => {
    if (auth.currentUser) {
      try {
        // Remove tokens from database
        await TokenService.updateTokens(auth.currentUser.uid, {
          access_token: "",
          refresh_token: "",
          scope: "",
          token_type: "",
        });
        setIsConnected(false);
        console.log("✅ [Connections] Google Calendar disconnected");
      } catch (error) {
        console.error("❌ [Connections] Error disconnecting:", error);
      }
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Connections</h1>

        <div className="grid gap-6">
          {/* Google Calendar Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                Google Calendar
              </CardTitle>
              <CardDescription>
                Connect your Google Calendar to sync events and schedule
                meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingConnection ? (
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner />
                  <span>Checking connection...</span>
                </div>
              ) : isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">
                      Connected to Google Calendar
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your Google Calendar is connected and ready for n8n
                    integration.
                  </div>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleGoogleCalendar}
                  className="w-full flex items-center justify-center gap-3"
                  variant="outline"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                  )}
                  {isLoading ? "Connecting..." : "Connect Google Calendar"}
                </Button>
              )}
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>

          {/* Other connections can be added here */}
          <Card>
            <CardHeader>
              <CardTitle>More Integrations</CardTitle>
              <CardDescription>
                Additional integrations coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We're working on adding more integrations to help you be more
                productive.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
