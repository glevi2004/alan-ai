"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Chat } from "@/components/ui/chat";
import { createChat, saveMessage } from "@/lib/firebase/chatService";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    if (!input.trim() || !user?.uid) return;

    try {
      setIsGenerating(true);

      // Create new chat with first message as title
      const title =
        input.trim().length > 50
          ? input.trim().substring(0, 50) + "..."
          : input.trim();

      const chatId = await createChat(user.uid, title);

      // Save user message
      await saveMessage(chatId, "user", input.trim());

      const currentInput = input;
      setInput("");

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

      // Save assistant message
      await saveMessage(chatId, "assistant", assistantResponse);

      // Navigate to the chat page
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error sending message:", error);
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
        messages={[]}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isGenerating}
        className="min-h-[80vh] p-8"
      />
    </div>
  );
}
