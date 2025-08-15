import { db } from "../../../firebase/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export class TokenService {
  private static COLLECTION_NAME = "user_tokens";

  // Store tokens for a user
  static async storeTokens(
    userId: string,
    tokens: GoogleTokens
  ): Promise<void> {
    try {
      const tokenRef = doc(db, this.COLLECTION_NAME, userId);
      await setDoc(tokenRef, {
        ...tokens,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error storing tokens:", error);
      throw error;
    }
  }

  // Get tokens for a user
  static async getTokens(userId: string): Promise<GoogleTokens | null> {
    try {
      const tokenRef = doc(db, this.COLLECTION_NAME, userId);
      const tokenDoc = await getDoc(tokenRef);

      if (tokenDoc.exists()) {
        return tokenDoc.data() as GoogleTokens;
      }
      return null;
    } catch (error) {
      console.error("Error getting tokens:", error);
      throw error;
    }
  }

  // Update tokens for a user
  static async updateTokens(
    userId: string,
    tokens: Partial<GoogleTokens>
  ): Promise<void> {
    try {
      const tokenRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(tokenRef, {
        ...tokens,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating tokens:", error);
      throw error;
    }
  }

  // Check if tokens are expired
  static isTokenExpired(tokens: GoogleTokens): boolean {
    if (!tokens.expiry_date) return true;
    return Date.now() >= tokens.expiry_date;
  }
}
