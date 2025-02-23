/*
 Zustand store for authentication with Firebase
 - nico
*/
import { create } from "zustand";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User, UserCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { updateProfile } from "firebase/auth";
import { useUserStore } from "../stores/userStore";

/*
 Defines the auth store for managing user state
 - nico
*/
type AuthStore = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  /*
   Firebase login with email and password
   - nico
  */
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user });
    } catch (error) {
      console.error("Login failed:", error);
    }
  },

  /*
   Firebase logout
   - nico
  */
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  /*
   Registering a new user
   - nico
  */
  register: async (email: string, password: string, displayName: string) => {
    try {
      const emailLowerCase = email.toLowerCase();

      const userCredential = await createUserWithEmailAndPassword(auth, emailLowerCase, password);
      const firebaseUser = userCredential.user;

      await useUserStore.getState().addUser({
        email: emailLowerCase,
        name: displayName,
      });

      set({ user: firebaseUser });
    } catch (error) {
      console.error("Registration failed:", error);
    }
  },

  /*
   Sets the user state (e.g., after login)
   - nico
  */
  setUser: (user) => {
    set({ user });
  },
}));

// Observes the Firebase auth state and updates the store
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
