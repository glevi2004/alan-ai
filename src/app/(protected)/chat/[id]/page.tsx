"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Chat } from "@/components/ui/chat";
import {
  getChat,
  getChatMessages,
  saveMessage,
} from "@/lib/firebase/chatService";
import { Chat as ChatType, ChatMessage } from "@/types/chat";

export default function ChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const chatId = params.id as string;

  useEffect(() => {
    if (chatId && user?.uid) {
      // Load chat and messages
      Promise.all([getChat(chatId), getChatMessages(chatId)])
        .then(([chatData, messagesData]) => {
          setChat(chatData);
          setMessages(messagesData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading chat:", error);
          setLoading(false);
        });
    }
  }, [chatId, user?.uid]);

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    if (!input.trim() || !user?.uid || !chatId) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      chatId: chatId,
      role: "user",
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
      // Save user message to Firestore
      await saveMessage(chatId, "user", currentInput);

      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: currentInput }],
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
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        chatId: chatId,
        role: "assistant",
        content: assistantResponse,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

  if (loading) {
    return <div>Loading chat...</div>;
  }

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return (
    <div className="flex-1">
      <Chat
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isGenerating}
        className="min-h-[80vh] p-8"
      />
    </div>
  );
}
