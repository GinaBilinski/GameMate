/*
   Thought: Login Screen asks for name/email and password. With the button the login function is called
   and provides the information to authentication.
   - nico
*/
import { create } from "zustand";
import { getAuth, onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../services/firebaseConfig";

/*
 defining the auth store type
 manages user authentication state
 - nico
*/
type AuthStore = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

/*
 creating the zustand auth store
 zustand updates state and keeps authentication in sync
 - nico
*/
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  /*
   login function calls Firebase Auth to sign in the user
   - nico
  */
  login: async (email, password) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user });
    } catch (error) {
      console.error("Login failed:", error);
    }
  },

  /*
   logout function signs the user out and clears the state
   - nico
  */
  logout: async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
}));

/*
 listening to Firebase authentication state changes
 updates the auth store when a user logs in or out
 - nico
*/
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().login(user?.email || "", user?.uid || ""); // Keeps Zustand in sync
});
