/*
 installed zustand and firebase:
 npm install firebase
 npm install zustand
 npm install date-fns
 importing dependencies
 zustand manages state, Firestore handles database operations
 - nico
*/
import { create } from "zustand";
import { db } from "../services/firebaseConfig";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import { useUserStore } from "./userStore";
import { collection, doc, addDoc, deleteDoc, getDocs, getDoc, updateDoc } from "firebase/firestore";

/*
 defining the event type
 stores only IDs for efficiency and references group ownership
 - nico
*/
export type Event = {
  id?: string;
  host: string;
  date: string;
  time: string;
  games: string[];
  food: string[];
  groupId: string;
  completed: boolean;
};

/*
 defining the zustand store
 manages events and syncs with Firestore
 - nico
*/
type EventStore = {
  events: Event[];
  addEvent: (event: Event) => Promise<void>;
  loadGroupEvents: (groupId: string) => Promise<void>;
  removeEvent: (eventId: string, groupId: string) => Promise<void>;
  markEventsAsCompleted: () => Promise<void>;
};

/*
creating the zustand store
zustand updates state and keeps data in sync
- nico
*/
export const useEventStore = create<EventStore>((set) => ({
  events: [],

  /*
  Function to check and mark expired events as completed
  - nico
  */
  markEventsAsCompleted: async () => {
    try {
      const now = new Date();

      const groupsSnapshot = await getDocs(collection(db, "groups"));
      for (const groupDoc of groupsSnapshot.docs) {
        const groupId = groupDoc.id;
        const eventsRef = collection(db, `groups/${groupId}/events`);
        const eventsSnapshot = await getDocs(eventsRef);

        for (const eventDoc of eventsSnapshot.docs) {
          const eventData = eventDoc.data() as Event;

          let eventDateTime;
          try {
            const eventDate = parse(eventData.date, "dd.MM.yyyy", new Date(), { locale: de });
            eventDateTime = new Date(eventDate);
          } catch (error) {
            console.error(`Invalid date format for event ${eventDoc.id}:`, eventData.date);
            continue;
          }

          const [hours, minutes] = eventData.time.split(":").map(Number);
          eventDateTime.setHours(hours, minutes, 0, 0);

          if (!eventData.completed && eventDateTime < now) {
            await updateDoc(doc(db, `groups/${groupId}/events`, eventDoc.id), {
              completed: true,
            });

            set((state) => ({
              events: state.events.map((event) =>
                event.id === eventDoc.id ? { ...event, completed: true } : event
              ),
            }));

            console.log(`Event ${eventDoc.id} marked as completed.`);
          }
        }
      }
    } catch (error) {
      console.error("Error marking events as completed:", error);
    }
  },

  /*
   load all events for a specific group from Firestore
   - nico
  */
  loadGroupEvents: async (groupId) => {
    try {
      await useEventStore.getState().markEventsAsCompleted();

      const eventsSnapshot = await getDocs(collection(db, `groups/${groupId}/events`));
      const groupEvents = await Promise.all(
        eventsSnapshot.docs.map(async (doc) => {
          const eventData = doc.data() as Event;
          const hostData = await useUserStore.getState().getUser(eventData.host);
          if(!hostData){
            console.error("eventStore: Error loading host:");
          }
          const hostName = hostData ? hostData.name : "Unknown";
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
      const hostData = await useUserStore.getState().getUser(event.host);
      if(!hostData){
        console.error("eventStore: Error loading host:");
      }
      const hostName = hostData ? hostData.name : "Unknown";
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
