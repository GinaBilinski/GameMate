/*
 importing dependencies
 zustand manages state, Firestore handles database operations
 - nico
*/
import { create } from "zustand"
import { db } from "../services/firebaseConfig";
import { collection, doc, addDoc, deleteDoc, getDocs } from "firebase/firestore";

/*
 defining the group type
 stores only IDs for efficiency
 - nico
*/
type Group = {
  id?: string;
  name: string;
  memberIds: string[];
  eventIds: string[];
};

/*
 defining the zustand store
 manages groups and syncs with Firestore
 - nico
*/
type GroupStore = {
  groups: Group[];
  addGroup: (group: Group) => Promise<void>;
  loadGroups: () => Promise<void>;
};

/*
 creating the zustand store
 zustand updates state and keeps data in sync
 - nico
*/
export const useGroupStore = create<GroupStore>((set) => ({

  groups: [],

  /*
   Currently loading ALL groups. Needs to be refactored,
   so it only loads the groups where the logged-in user is a member!**
   load all groups from Firestore and update state
   - nico
  */
  loadGroups: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "groups"));
      const groups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Group[];
      set({ groups });
    } catch (error) {
      console.error("Failed to load groups:", error);
    }
  },

  /*
   add a new group to Firestore and update state
   - nico
  */
  addGroup: async (group) => {
    try {
      const docRef = await addDoc(collection(db, "groups"), group);
      set((state) => ({ groups: [...state.groups, { ...group, id: docRef.id }] }));
    } catch (error) {
      console.error("Failed to save group:", error);
    }
  },
  /*
   remove a group from Firestore and update state
   - nico
  */
   removeGroup: async (groupId: string) => {
    try {
      await deleteDoc(doc(db, "groups", groupId)); // Delete from Firestore
      set((state) => ({ groups: state.groups.filter((group) => group.id !== groupId) })); // Update Zustand state
    } catch (error) {
      console.error("Failed to remove group:", error);
    }
  },
}));
