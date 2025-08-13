// src/app/login/page.tsx
"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  // Handle Google login
  const handleGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    router.replace("/");
  };

  // Show loading state while checking auth state
  if (loading) return null;

  // Show login button if user is not logged in
  return (
    <main style={{ display: "grid", placeItems: "center", height: "100dvh" }}>
      <button onClick={handleGoogle}>Continue with Google</button>
    </main>
  );
}
