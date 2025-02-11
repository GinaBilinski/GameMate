/*
 installed zustand and firebase:
 npm install firebase
 npm install zustand
 importing dependencies
 zustand manages state, Firestore handles database operations
 - nico
*/
import { create } from "zustand"
import { db } from "../services/firebaseConfig";
import { collection, doc, addDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";

/*
 defining the event type
 stores only IDs for efficiency and references group ownership
 - nico
*/
type Event = {
  id?: string;
  host: string;
  date: string;
  games: string[];
  food: string[];
  groupId: string;
};

/*
 defining the zustand store
 manages events and syncs with Firestore
 - nico
*/
type EventStore = {
  events: Event[];
  addEvent: (event: Event) => Promise<void>;
  loadEventsByGroup: (groupId: string) => Promise<void>;
};

/*
 creating the zustand store
 zustand updates state and keeps data in sync
 - nico
*/
export const useEventStore = create<EventStore>((set) => ({
  events: [],

  /*
   load all events for a specific group from Firestore
   - nico
  */
  loadEventsByGroup: async (groupId) => {
    try {
      const q = query(collection(db, "events"), where("groupId", "==", groupId));
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
      set({ events });
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  },

  /*
   add a new event to Firestore and update state
   - nico
  */
  addEvent: async (event) => {
    try {
      const docRef = await addDoc(collection(db, "events"), event);
      set((state) => ({ events: [...state.events, { ...event, id: docRef.id }] }));
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  },
    /*
  remove an event from Firestore and update state
  - nico
  */
  removeEvent: async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "events", eventId)); // Delete from Firestore
      set((state) => ({ events: state.events.filter((event) => event.id !== eventId) })); // Update Zustand state
    } catch (error) {
      console.error("Failed to remove event:", error);
    }
  },
}));
