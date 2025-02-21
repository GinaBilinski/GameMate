/*
 Zustand Store für die Authentifizierung mit Firebase
 - nico
*/
import { create } from "zustand";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User, UserCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { updateProfile } from "firebase/auth";
import { useUserStore } from "../stores/userStore";

/*
 Definiert den Auth-Store, um den Nutzerzustand zu verwalten
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
   Firebase Login mit E-Mail und Passwort
   - nico
  */
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user });
    } catch (error) {
      console.error("Login fehlgeschlagen:", error);
    }
  },

  /*
   Firebase Logout
   - nico
  */
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error("Logout fehlgeschlagen:", error);
    }
  },

  /*
   Registrieren eines neuen Nutzers
   - nico
  */
   register: async (email: string, password: string, displayName: string) => {
    try {
      const emailLowerCase = email.toLowerCase(); // E-Mail in Kleinbuchstaben umwandeln
  
      const userCredential = await createUserWithEmailAndPassword(auth, emailLowerCase, password);
      const firebaseUser = userCredential.user;
  
      await useUserStore.getState().addUser({
        id: firebaseUser.uid,
        email: emailLowerCase, // Hier auch in Kleinbuchstaben speichern
        name: displayName,
        groupIds: [],
        eventIds: [],
      });
  
      set({ user: firebaseUser });
    } catch (error) {
      console.error("Registrierung fehlgeschlagen:", error);
    }
  },
  

  /*
   Setzt den Nutzerzustand (z.B. nach Login)
   - nico
  */
  setUser: (user) => {
    set({ user });
  },
}));

// Beobachtet den Firebase-Auth-Zustand und aktualisiert den Store
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
