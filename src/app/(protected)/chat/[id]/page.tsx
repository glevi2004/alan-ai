"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Chat } from "@/components/ui/chat";
import { getChat, getChatMessages } from "@/lib/firebase/chatService";
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
    // Your chat submission logic here
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
        className="min-h-[80vh]"
      />
    </div>
  );
}
