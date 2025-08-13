// src/types/user.ts
export interface UserProfile {
  id?: string; // Optional because it's not available when creating
  email: string;
  displayName: string;
  photoURL: string;
  uid: string; // Firebase Auth UID
  createdAt?: Date; // Optional because it's set by the server
  updatedAt?: Date; // Optional because it's set by the server
  lastLoginAt?: Date; // Optional because it's set by the server
}
