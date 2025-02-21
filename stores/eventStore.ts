/*
 installed zustand and firebase:
 npm install firebase
 npm install zustand
 importing dependencies
 zustand manages state, Firestore handles database operations
 - nico
*/
import { create } from "zustand";
import { db } from "../services/firebaseConfig";
import { collection, doc, addDoc, deleteDoc, getDocs, getDoc, query } from "firebase/firestore";

export const getUserNameById = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().name; 
    }
  } catch (error) {
    console.error(`Fehler beim Abrufen des Benutzers mit ID ${userId}:`, error);
  }
  return "Unbekannt"; 
};

/*
 defining the event type
 stores only IDs for efficiency and references group ownership
 - nico
*/
type Event = {
  id?: string;
  host: string;
  date: string;
  time: string;
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
  loadAllGroupEvents: () => Promise<void>;
  addEvent: (event: Event) => Promise<void>;
  loadEventsByGroup: (groupId: string) => Promise<void>;
  removeEvent: (eventId: string, groupId: string) => Promise<void>;
};

/*
 creating the zustand store
 zustand updates state and keeps data in sync
 - nico
*/
export const useEventStore = create<EventStore>((set) => ({
  events: [],

  loadAllGroupEvents: async () => {
    try {
      const groupsSnapshot = await getDocs(collection(db, "groups"));
      let allEvents: Event[] = [];
      
      for (const groupDoc of groupsSnapshot.docs) {
        const groupId = groupDoc.id;
        const eventsSnapshot = await getDocs(collection(db, `groups/${groupId}/events`));

        const groupEvents = await Promise.all(
          eventsSnapshot.docs.map(async (doc) => {
            const eventData = doc.data() as Event;
            const hostName = await getUserNameById(eventData.host);
            return { id: doc.id, ...eventData, host: hostName, groupId };
          })
        );
        allEvents = [...allEvents, ...groupEvents];
      }
      set({ events: allEvents }); 
    } catch (error) {
      console.error("Fehler beim Laden aller Gruppen-Events:", error);
    }
  },

  /*
   load all events for a specific group from Firestore
   - nico
  */
  loadEventsByGroup: async (groupId) => {
    try {
      const eventsSnapshot = await getDocs(collection(db, `groups/${groupId}/events`));
      const groupEvents = await Promise.all(
        eventsSnapshot.docs.map(async (doc) => {
          const eventData = doc.data() as Event;
          const hostName = await getUserNameById(eventData.host);
          return { id: doc.id, ...eventData, host: hostName, groupId };
        })
      );

      set((state) => ({
        events: [...state.events.filter((e) => e.groupId !== groupId), ...groupEvents],
      }));
    } catch (error) {
      console.error("Fehler beim Laden der Gruppen-Events:", error);
    }
  },

  /*
  add a new event to Firestore and update state
  - nico
 */
  addEvent: async (event) => {
    try {
      const docRef = await addDoc(collection(db, `groups/${event.groupId}/events`), event);
      const hostName = await getUserNameById(event.host); // Namen abrufen
      set((state) => ({
        events: [...state.events, { ...event, id: docRef.id, host: hostName }],
      }));
    } catch (error) {
      console.error("Fehler beim Speichern des Events:", error);
    }
  },

  /*
  remove an event from Firestore and update state
  - nico
  */
  removeEvent: async (eventId, groupId) => {
    try {
      await deleteDoc(doc(db, `groups/${groupId}/events`, eventId));
      set((state) => ({
        events: state.events.filter((event) => event.id !== eventId),
      }));
    } catch (error) {
      console.error("Fehler beim Löschen des Events:", error);
    }
  },
}));
