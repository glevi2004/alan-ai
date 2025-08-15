"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  exchangeCodeForTokens,
  refreshAccessToken,
} from "@/lib/google/googleOauth";
import { TokenService } from "@/lib/firebase/googleTokenStorage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OAuthRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      try {
        // Get the authorization code from URL
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const state = searchParams.get("state");

        if (error) {
          setStatus("error");
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus("error");
          setMessage("No authorization code received");
          return;
        }

        // Wait for user to be authenticated
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              // Exchange code for tokens
              const tokens = await exchangeCodeForTokens(code);

              if (!tokens.refresh_token) {
                throw new Error("No refresh token received. Please try again.");
              }

              // Store tokens in Firebase
              await TokenService.storeTokens(user.uid, tokens as any);

              setStatus("success");
              setMessage("Google Calendar connected successfully!");

              // Redirect to dashboard after 2 seconds
              setTimeout(() => {
                router.push("/");
              }, 2000);
            } catch (error) {
              console.error("Error processing OAuth:", error);
              setStatus("error");
              setMessage(
                "Failed to connect Google Calendar. Please try again."
              );
            }
          } else {
            setStatus("error");
            setMessage("User not authenticated. Please sign in first.");
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error in OAuth redirect:", error);
        setStatus("error");
        setMessage("An unexpected error occurred.");
      }
    };

    handleOAuthRedirect();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className={`text-xl font-bold ${getStatusColor()}`}>
            Google Calendar Connection
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "error" && (
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
