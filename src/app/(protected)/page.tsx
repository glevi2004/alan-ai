"use client";

import { ChatBot } from "@/components/Chat";
import Navbar from "@/components/nav/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* <div className="mb-6">
        <Navbar />
      </div> */}

      <main className="flex-col items-center justify-center max-w-6xl mx-auto">
        <div className="border rounded-md p-4">
          <ChatBot />
        </div>
      </main>
    </div>
  );
}
