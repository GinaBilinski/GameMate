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
import { useAuthStore } from "./authStore";
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
  hostRatings?: number[];
  foodRatings?: number[];
  overallRatings?: number[];
  ratedUsers?: string[];
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
  submitRating: (eventId: string, groupId: string, hostRating: number, foodRating: number, overallRating: number) => Promise<void>;
  isRatedUser: (eventId: string, groupId: string) => Promise<boolean>;
};

/*
creating the zustand store
zustand updates state and keeps data in sync
- nico
*/
export const useEventStore = create<EventStore>((set) => ({
  events: [],
  
  isRatedUser: async (eventId: string, groupId: string) => {
    try {
      const authId = useAuthStore.getState().user?.uid;
      if (!authId) {
        console.error("eventStore => No user is logged in.");
        return true;
      }
      const eventRef = doc(db, `groups/${groupId}/events`, eventId);
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        console.error("eventStore => Event not found:", eventId);
        return true;
      }
      const eventData = eventDoc.data() as Event;
      if (eventData.ratedUsers?.includes(authId)) {
        return true;
      }
      return false;
    } 
    catch (error) {
      console.error("eventStore => Error checking rated user:", error);
      return true;
    }
  },

  /*
  Function to submit ratings for an event
  - nico
  */
  submitRating: async (eventId: string, groupId: string, hostRating: number, foodRating: number, overallRating: number) => {
    try {
      const authId = useAuthStore.getState().user?.uid;
      if (!authId) {
        console.error("eventStore => No user is logged in.");
        return;
      }

      const eventRef = doc(db, `groups/${groupId}/events`, eventId);
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        console.error("eventStore => Event not found:", eventId);
        return;
      }

      const eventData = eventDoc.data() as Event;
      if (eventData.ratedUsers?.includes(authId)) {
        console.warn("eventStore => User has already rated this event.");
        return;
      }

      await updateDoc(eventRef, {
        hostRatings: [...(eventData.hostRatings || []), hostRating],
        foodRatings: [...(eventData.foodRatings || []), foodRating],
        overallRatings: [...(eventData.overallRatings || []), overallRating],
        ratedUsers: [...(eventData.ratedUsers || []), authId],
      });

      set((state) => ({
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                hostRatings: [...(event.hostRatings || []), hostRating],
                foodRatings: [...(event.foodRatings || []), foodRating],
                overallRatings: [...(event.overallRatings || []), overallRating],
                ratedUsers: [...(event.ratedUsers || []), authId],
              }
            : event
        ),
      }));

      console.log("eventStore => Rating submitted successfully.");
    } catch (error) {
      console.error("eventStore => Error submitting rating:", error);
    }
  },
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

export const calculateAverageRating = (ratings?: number[]): number => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
}
