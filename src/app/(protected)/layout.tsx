// src/app/(protected)/layout.tsx
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { redirect } from "next/navigation";

// Protected layout component
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) redirect("/login");

  return <>{children}</>;
}
