// src/components/auth/AuthProvider.tsx
"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "../../../firebase/firebaseConfig";
import {
  createUserProfile,
  getUserProfile,
  updateLastLogin,
} from "@/lib/firebase/userService";

type AuthValue = { user: User | null; loading: boolean };
const AuthContext = createContext<AuthValue>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // Ensure Firestore user profile exists and update last login
  useEffect(() => {
    if (!user) return;

    const syncUserProfile = async () => {
      try {
        const existing = await getUserProfile(user.uid);

        if (!existing) {
          await createUserProfile({
            uid: user.uid,
            email: user.email ?? "",
            displayName:
              user.displayName ??
              (user.email ? user.email.split("@")[0] : "User"),
            photoURL: user.photoURL ?? "",
          });
        } else {
          await updateLastLogin(user.uid);
        }
      } catch (error) {
        console.error("Failed to sync user profile", error);
      }
    };

    void syncUserProfile();
  }, [user]);

  // Handle redirects based on auth state
  useEffect(() => {
    if (!loading) {
      // If user is authenticated and on login page, redirect to home
      if (user && pathname === "/login") {
        router.push("/");
      }
      // If user is not authenticated and on protected page, redirect to login
      else if (!user && pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
