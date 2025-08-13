"use client";

import {
  Calendar,
  ChevronUp,
  CreditCard,
  Home,
  Inbox,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Settings,
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
import { getUserChats } from "@/lib/firebase/chatService";
import { Chat } from "@/types/chat";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

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
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/chat/${chat.id}`}>
                      <MessageCircle />
                      <span>{chat.title}</span>
                    </Link>
                  </SidebarMenuButton>
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
    </Sidebar>
  );
}
