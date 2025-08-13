// src/lib/firebase/chatService.ts
import {
  doc,
  setDoc,
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
