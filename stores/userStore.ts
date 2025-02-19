/*
 importing dependencies
 zustand manages state, Firestore handles database operations
 - nico
*/
import { create } from "zustand"
import { db } from "../services/firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

/*
 defining the user type
 stores only IDs for efficiency and references group and event memberships
 - nico
*/
type User = {
  id: string;
  email: string;
  name: string;
  groupIds: string[];
  eventIds: string[];
};

/*
 defining the zustand store
 manages users and syncs with Firestore
 - nico
*/
type UserStore = {
  users: User[];
  addUser: (user: User) => Promise<void>;
  loadUsers: () => Promise<void>;
};

/*
 creating the zustand store
 zustand updates state and keeps data in sync
 - nico
*/
export const useUserStore = create<UserStore>((set) => ({
  users: [],

  /*
   load all users from Firestore and update state
   - nico
  */
  loadUsers: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      set({ users });
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  },

  /*
   add a new user to Firestore and update state
   - nico
  */
  addUser: async (user) => {
    try {
      const docRef = await addDoc(collection(db, "users"), user);
      set((state) => ({ users: [...state.users, { ...user, id: docRef.id }] }));
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  },
}));
