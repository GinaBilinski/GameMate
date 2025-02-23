/*
 Zustand store for user management with Firebase Firestore
 - nico
*/
import { create } from "zustand";
import { db } from "../services/firebaseConfig";
import { setDoc, getDoc, doc } from "firebase/firestore";
import { useAuthStore } from "./authStore";

/*
 Defines the User type with essential details
 - nico
*/
type User = {
  email: string;
  name: string;
};

/*
 Defines the UserStore type which includes an array of users and methods for user operations
 - nico
*/
type UserStore = {
  users: User[];
  addUser: (user: User) => Promise<void>;
  getUser: (authId: string) => Promise<User | null>;
  getUserId: (authId: string) => Promise<string | null>;
};

/*
 Creates the Zustand store to manage user data and synchronize with Firestore
 - nico
*/
export const useUserStore = create<UserStore>((set) => ({
  users: [],

  /*
   Adds a user to Firestore using the authenticated user's ID.
   - nico
  */
  addUser: async (user) => {
    try {
      const authId = useAuthStore.getState().user?.uid;  
      if (!authId) {
        console.error("userStore => No authId found, cannot add user.");
        return;
      }
      await setDoc(doc(db, "users", authId), user); 
      set((state) => ({ users: [...state.users, user] })); 
    } catch (error) {
      console.error("userStore => Failed to save user:", error);
    }
  },
  
  /*
   Retrieves the user data from Firestore for a given authId.
   - nico
  */
  getUser: async (authId: string) => {
    try {
      const userDocRef = doc(db, "users", authId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log("userStore => User found:", userData);
        return userData;
      } else {
        console.log("userStore => No user found with authId:", authId);
        return null;
      }
    } catch (error) {
      console.error("userStore => Failed to get user:", error);
      return null;
    }
  },

  /*
   Retrieves the document ID from Firestore for a given authId.
   - nico
  */
  getUserId: async (authId: string) => {
    try {
      const userDocRef = doc(db, "users", authId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.id;
      } else {
        console.log("userStore => No user found with authId:", authId);
        return null;
      }
    } catch (error) {
      console.error("userStore => Failed to get user id:", error);
      return null;
    }    
  }
}));
