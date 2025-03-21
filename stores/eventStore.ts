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
import { onSnapshot, Unsubscribe } from "firebase/firestore";

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
 Definiert Eintrag für Spiele, Essen und Anzahl der Stimmnen.
 - gina
*/
export type EventItem = {
  name: string;
  votes: number;
  votedBy: string[];
};

/*
 Um Events mit zusätzlichen Details zu verwalten
 - gina
*/
export type EventDetails = {
  id?: string;
  host: string;
  date: string;
  time: string;
  games: EventItem[];
  food: EventItem[];
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
  currentEvent?: EventDetails;
  addEvent: (event: Event) => Promise<void>;
  loadGroupEvents: (groupId: string) => Promise<void>;
  removeEvent: (eventId: string, groupId: string) => Promise<void>;
  markEventsAsCompleted: () => Promise<void>;
  submitRating: (
    eventId: string,
    groupId: string,
    hostRating: number,
    foodRating: number,
    overallRating: number
  ) => Promise<void>;
  isRatedUser: (eventId: string, groupId: string) => Promise<boolean>;
  loadEventDetails: (groupId: string, eventId: string) => Promise<void | Unsubscribe>;

  addGame: (groupId: string, eventId: string, newGame: string) => Promise<void>;
  addFood: (groupId: string, eventId: string, newFood: string) => Promise<void>;
  vote: (groupId: string, eventId: string, category: "games" | "food", index: number) => Promise<void>;
};

/*
 creating the zustand store
 zustand updates state and keeps data in sync
 - nico
*/
export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  currentEvent: undefined,

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
    } catch (error) {
      console.error("eventStore => Error checking rated user:", error);
      return true;
    }
  },

  /*
  Function to submit ratings for an event
  - nico
  */
  submitRating: async (
    eventId: string,
    groupId: string,
    hostRating: number,
    foodRating: number,
    overallRating: number
  ) => {
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
  loadGroupEvents: async (groupId: string) => {
    try {
      await get().markEventsAsCompleted();

      const eventsSnapshot = await getDocs(collection(db, `groups/${groupId}/events`));
      const groupEvents = await Promise.all(
        eventsSnapshot.docs.map(async (doc) => {
          const eventData = doc.data() as Event;
          const hostData = await useUserStore.getState().getUser(eventData.host);
          if (!hostData) {
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
  addEvent: async (event: Event) => {
    try {
      const docRef = await addDoc(collection(db, `groups/${event.groupId}/events`), event);
      const hostData = await useUserStore.getState().getUser(event.host);
      if (!hostData) {
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
  removeEvent: async (eventId: string, groupId: string) => {
    try {
      await deleteDoc(doc(db, `groups/${groupId}/events`, eventId));
      set((state) => ({
        events: state.events.filter((event) => event.id !== eventId),
      }));
    } catch (error) {
      console.error("Fehler beim Löschen des Events:", error);
    }
  },

  /*
  Lade die Event-Details für den EventDetailsScreen - wandelt die Spiele- und Essensdaten
  in Objekte um, um Abstimmungsinformationen einzubinden.
  - gina
  */
  
  loadEventDetails: async (groupId: string, eventId: string): Promise<void | Unsubscribe> => {
    try {
      const eventRef = doc(db, `groups/${groupId}/events`, eventId);
  
      const unsubscribe: Unsubscribe = onSnapshot(eventRef, (eventSnap) => {
        if (eventSnap.exists()) {
          const eventData = eventSnap.data();
          const transformItems = (items: any): EventItem[] =>
            items.map((item: any) =>
              typeof item === "string"
                ? { name: item, votes: 0, votedBy: [] }
                : item
            );
  
          const currentEvent: EventDetails = {
            id: eventSnap.id,
            host: eventData.host,
            date: eventData.date,
            time: eventData.time,
            groupId: eventData.groupId,
            completed: eventData.completed,
            games: transformItems(eventData.games || []),
            food: transformItems(eventData.food || []),
          };
  
          set({ currentEvent });
        }
      });

      // Optional: Speichere das unsubscribe, um den Listener beim Verlassen des Screens zu entfernen
      return unsubscribe;
    } catch (error) {
      console.error("Error loading event details:", error);
    }
  },

  /*
  Fügt ein neues Spiel zum Event hinzu - aktualisiert Firestore und den lokalen Zustand.
  - gina
  */
  addGame: async (groupId: string, eventId: string, newGame: string) => {
    if (!newGame) return;
    const { currentEvent } = get();
    if (!currentEvent) return;
    const updatedGames = [
      ...currentEvent.games,
      { name: newGame, votes: 0, votedBy: [] },
    ];
    try {
      await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { games: updatedGames });
      set((state) => ({
        currentEvent: state.currentEvent ? { ...state.currentEvent, games: updatedGames } : state.currentEvent,
      }));
    } catch (error) {
      console.error("Error adding game:", error);
    }
  },

  /*
  Fügt ein neues Essen zum Event hinzu - aktualisiert Firestore und den lokalen Zustand.
  - gina
  */
  addFood: async (groupId: string, eventId: string, newFood: string) => {
    if (!newFood) return;
    const { currentEvent } = get();
    if (!currentEvent) return;
    const updatedFood = [
      ...currentEvent.food,
      { name: newFood, votes: 0, votedBy: [] },
    ];
    try {
      await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { food: updatedFood });
      set((state) => ({
        currentEvent: state.currentEvent ? { ...state.currentEvent, food: updatedFood } : state.currentEvent,
      }));
    } catch (error) {
      console.error("Error adding food:", error);
    }
  },

  /*
  Abstimmungsfunktion für Spiele oder Essen.
  - prüft, ob  Nutzer in jeweiligen Kategorie bereits abgestimmt hat,
  erhöht  Stimmenzähler, fügt  Nutzer-ID zur Liste der Abstimmenden hinzu und aktualisiert Firestore.
  - gina
  */
  vote: async (groupId: string, eventId: string, category: "games" | "food", index: number) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      alert("Du musst angemeldet sein, um abzustimmen!");
      return;
    }
    const { currentEvent } = get();
    if (!currentEvent) return;
    const userId = currentUser.uid;
    const items = category === "games" ? currentEvent.games : currentEvent.food;
    const hasVoted = items.some((item) => item.votedBy.includes(userId));
    if (hasVoted) {
      alert(`Du hast bereits für ${category === "games" ? "Spiele" : "Essen"} abgestimmt!`);
      return;
    }
    const updatedItems = [...items];
    updatedItems[index].votes += 1;
    updatedItems[index].votedBy.push(userId);
    try {
      await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { [category]: updatedItems });
      set((state) => ({
        currentEvent: state.currentEvent ? { ...state.currentEvent, [category]: updatedItems } : state.currentEvent,
      }));
    } catch (error) {
      console.error("Error voting:", error);
    }
  },
}));

/*
  Berechnet den durchschnittlichen Bewertungswert aus einem Array von Bewertungen.
  Gibt 0 zurück, falls keine Bewertungen vorhanden sind.
*/
export const calculateAverageRating = (ratings?: number[]): number => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
};
