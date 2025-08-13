// src/app/login/page.tsx
"use client";

import LoginCard from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <LoginCard />
    </main>
  );
}
