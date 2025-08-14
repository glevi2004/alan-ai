import { X, Search, Plus, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserChats } from "@/lib/firebase/chatService";
import { Chat } from "@/types/chat";
import { useAuth } from "@/components/auth/AuthProvider";

interface ChatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSearchModal({ isOpen, onClose }: ChatSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  // Load chats when modal opens
  useEffect(() => {
    if (isOpen && user?.uid) {
      getUserChats(user.uid).then(setChats);
    }
  }, [isOpen, user?.uid]);

  // Filter chats based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  // Group chats by date
  const groupChatsByDate = (chats: Chat[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent = chats.filter((chat) => chat.updatedAt >= sevenDaysAgo);
    const older = chats.filter(
      (chat) => chat.updatedAt < sevenDaysAgo && chat.updatedAt >= thirtyDaysAgo
    );
    const muchOlder = chats.filter((chat) => chat.updatedAt < thirtyDaysAgo);

    return {
      recent,
      older,
      muchOlder,
    };
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    onClose();
  };

  const handleNewChat = () => {
    router.push("/?new=true");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const { recent, older, muchOlder } = groupChatsByDate(filteredChats);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-xl p-0 w-full max-w-md mx-4 shadow-xl">
        {/* Search Header */}
        <div className="flex items-center p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-10 py-2 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* New Chat Option */}
          <div className="border-b border-border">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <Plus className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">New chat</span>
            </button>
          </div>

          {/* Chat Groups */}
          {recent.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Previous 7 Days
              </div>
              {recent.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className="w-full flex items-center px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <MessageCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}

          {older.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Previous 30 Days
              </div>
              {older.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className="w-full flex items-center px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <MessageCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}

          {muchOlder.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Older
              </div>
              {muchOlder.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className="w-full flex items-center px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <MessageCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}

          {filteredChats.length === 0 && searchQuery && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No chats found matching "{searchQuery}"</p>
            </div>
          )}

          {filteredChats.length === 0 && !searchQuery && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">Start a new chat to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
