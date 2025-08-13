// src/lib/firebase/userService.ts
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { UserProfile } from "@/types/user";

// Create a new user profile
export async function createUserProfile(
  userData: UserProfile
): Promise<string> {
  const userRef = doc(db, "users", userData.uid);
  const dataToSave = {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(userRef, dataToSave, { merge: false });
  return userRef.id; // equals uid
}

// Get user profile by UID
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const data = snap.data() as Record<string, any>;
  const toDate = (v: any) =>
    v && typeof v.toDate === "function" ? v.toDate() : undefined;

  return {
    id: snap.id,
    ...data,
    createdAt: toDate(data.createdAt) || new Date(),
    updatedAt: toDate(data.updatedAt) || new Date(),
    lastLoginAt: toDate(data.lastLoginAt) || new Date(),
  } as UserProfile;
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Update last login time
export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  });
}

// Note: user existence can be inferred by `getUserProfile(uid) !== null`.

// // Get user creation date to determine if they're new
// export async function isNewUser(uid: string): Promise<boolean> {
//   const user = await getUserProfile(uid);
//   if (!user) return true; // If user doesn't exist, they're new

//   // Check if user was created in the last 24 hours
//   const oneDayAgo = new Date();
//   oneDayAgo.setDate(oneDayAgo.getDate() - 1);

//   return user.createdAt! > oneDayAgo;
// }
