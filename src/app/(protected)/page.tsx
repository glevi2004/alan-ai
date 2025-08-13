"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Chat } from "@/components/ui/chat";
import { createChat, saveMessage } from "@/lib/firebase/chatService";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  // Clear messages when "new" parameter is present
  useEffect(() => {
    const isNewChat = searchParams.get("new");
    if (isNewChat === "true") {
      setMessages([]);
      setInput("");
      setIsGenerating(false);
      // Remove the "new" parameter from URL without triggering a page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    if (!input.trim() || !user?.uid) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: "user" as const,
      content: input.trim(),
      createdAt: new Date(),
    };

    // 1. Add user message to UI immediately (optimistic update)
    setMessages((prev) => [...prev, userMessage]);

    // 3. Clear input and set generating state
    const currentInput = input;
    setInput("");
    setIsGenerating(true);

    try {
      // Create new chat with first message as title
      const title =
        currentInput.length > 50
          ? currentInput.substring(0, 50) + "..."
          : currentInput;

      const chatId = await createChat(user.uid, title);

      // Save user message to Firestore
      await saveMessage(chatId, "user", currentInput);

      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: currentInput }],
          chatId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const assistantResponse = await response.text();

      // Save assistant message to Firestore
      await saveMessage(chatId, "assistant", assistantResponse);

      // 4. Add assistant response to messages
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: assistantResponse,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Don't navigate automatically - let user stay on main page
      // The chat will appear in sidebar and they can click to navigate
    } catch (error) {
      console.error("Error sending message:", error);
      // 5. Handle error - no need to remove anything since we don't add loading message
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex-1">
      <Chat
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isGenerating}
        setMessages={setMessages}
        className="min-h-[80vh] p-8"
      />
    </div>
  );
}
