"use client";

import Navbar from "@/components/nav/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Alan AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent AI assistant is ready to help you with any task.
            Start a conversation or explore the features below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Chat with AI</h3>
              <p className="text-muted-foreground">
                Start a conversation with Alan AI and get intelligent responses.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Document Analysis</h3>
              <p className="text-muted-foreground">
                Upload documents and get AI-powered insights and summaries.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Code Assistant</h3>
              <p className="text-muted-foreground">
                Get help with coding, debugging, and code optimization.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
