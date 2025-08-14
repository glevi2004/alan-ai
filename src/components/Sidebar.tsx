"use client";

import {
  Calendar,
  ChevronUp,
  CreditCard,
  Edit,
  Home,
  Inbox,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  User2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getUserChats,
  updateChatTitle,
  deleteChat,
} from "@/lib/firebase/chatService";
import { Chat } from "@/types/chat";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // useEffect(() => {
  //   if (user?.uid) {
  //     getUserChats(user.uid).then(setChats);
  //   }
  // }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      console.log("Setting up real-time listener for user:", user.uid);

      const q = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const chats = snapshot.docs.map((doc) => {
            const data = doc.data();
            const toDate = (v: any) =>
              v && typeof v.toDate === "function" ? v.toDate() : new Date();

            return {
              id: doc.id,
              title: data.title,
              userId: data.userId,
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
              messageCount: data.messageCount || 0,
            };
          });

          console.log("Real-time chat update:", chats);
          setChats(chats);
        },
        (error) => {
          console.error("Error in real-time listener:", error);
        }
      );

      // Cleanup function to unsubscribe when component unmounts or user changes
      return () => {
        console.log("Cleaning up real-time listener");
        unsubscribe();
      };
    }
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleRenameChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
    // Use setTimeout to ensure the input is rendered before selecting
    setTimeout(() => {
      const input = document.querySelector(
        `input[data-chat-id="${chatId}"]`
      ) as HTMLInputElement;
      if (input) {
        input.select();
      }
    }, 0);
  };

  const handleSaveRename = async (chatId: string) => {
    const newTitle = editingTitle.trim();
    if (newTitle && newTitle !== chats.find((c) => c.id === chatId)?.title) {
      try {
        await updateChatTitle(chatId, newTitle);
        // The real-time listener will automatically update the UI
      } catch (error) {
        console.error("Error renaming chat:", error);
        alert("Failed to rename chat. Please try again.");
      }
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleCancelRename = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveRename(chatId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const handleDeleteChat = (chatId: string, chatTitle: string) => {
    setChatToDelete({ id: chatId, title: chatTitle });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;

    try {
      await deleteChat(chatToDelete.id);
      // The real-time listener will automatically update the UI
      // If we're currently on this chat, redirect to home
      if (window.location.pathname === `/chat/${chatToDelete.id}`) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please try again.");
    } finally {
      setDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setChatToDelete(null);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/?new=true">
                    <Plus />
                    <span>New Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id} className="chat-item">
                  {editingChatId === chat.id ? (
                    <div className="flex items-center w-full px-3 py-2 bg-accent rounded-md">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                        onBlur={() => handleSaveRename(chat.id)}
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                        data-chat-id={chat.id}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={`/chat/${chat.id}`} className="relative">
                        <MessageCircle />
                        <span>{chat.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity p-2 hover:bg-muted rounded chat-dots"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            className="w-48"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                handleRenameChat(chat.id, chat.title)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteChat(chat.id, chat.title)
                              }
                              data-variant="destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User avatar"
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <User2 />
                    )}
                    <span>{user?.displayName ?? user?.email ?? "User"}</span>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-(--radix-popper-anchor-width) p-0"
                >
                  <DropdownMenuItem asChild className="w-full">
                    <Link href="/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="w-full">
                    <Link href="/billing">
                      <CreditCard />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="w-full"
                    data-variant="destructive"
                    onSelect={handleLogout}
                  >
                    <LogOut />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        chatTitle={chatToDelete?.title || ""}
      />
    </Sidebar>
  );
}
