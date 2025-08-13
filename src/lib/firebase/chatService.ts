// src/lib/firebase/chatService.ts
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

// Create new chat
export async function createChat(userId: string, title: string) {
  const chatRef = doc(collection(db, "chats"));
  await setDoc(chatRef, {
    title,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return chatRef.id;
}

// Get user's chats
export async function getUserChats(userId: string) {
  const q = query(
    collection(db, "chats"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
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
}

// Get a specific chat by ID
export async function getChat(chatId: string) {
  const chatRef = doc(db, "chats", chatId);
  const snapshot = await getDoc(chatRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  const toDate = (v: any) =>
    v && typeof v.toDate === "function" ? v.toDate() : new Date();

  return {
    id: snapshot.id,
    title: data.title,
    userId: data.userId,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    messageCount: data.messageCount || 0,
  };
}

// Get all messages for a chat
export async function getChatMessages(chatId: string) {
  const q = query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const toDate = (v: any) =>
      v && typeof v.toDate === "function" ? v.toDate() : new Date();

    return {
      id: doc.id,
      chatId: data.chatId,
      role: data.role,
      content: data.content,
      createdAt: toDate(data.createdAt),
    };
  });
}

// Save message
export async function saveMessage(
  chatId: string,
  role: string,
  content: string
) {
  const messageRef = doc(collection(db, "messages"));
  await setDoc(messageRef, {
    chatId,
    role,
    content,
    createdAt: serverTimestamp(),
  });
}
