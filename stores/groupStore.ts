/*
 importing dependencies
 zustand manages state, Firestore handles database operations
 - nico
*/
import { create } from "zustand";
import { db } from "../services/firebaseConfig";
import { collection, doc, addDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "./userStore";

/*
 defining the group type
 stores only IDs for efficiency
 - nico
*/
type Group = {
  id?: string;
  name: string;
  memberIds: string[];
  eventIds?: string[]; 
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
  removeGroup: (groupId: string) => Promise<void>;
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
      const authId = useAuthStore.getState().user?.uid;
      if (authId == null) {
        console.error("groupStore => No user is logged in or user data is not available.");
        return;
      }
      const currentUserId = await useUserStore.getState().getUserId(authId);
      if(!currentUserId) {
        console.error("groupStore => No user with the Id found", authId);
        return;
      }
      const groupsRef = collection(db, "groups");
      const groupsSorted  = query(groupsRef, where("memberIds", "array-contains", currentUserId))
      const querySnapshot = await getDocs(groupsSorted);
      const groups = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Group[];
      set({ groups });
    } catch (error) {
      console.error("groupStore => Error loading groups:", error);
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
      console.error("groupStore => Error adding group:", error);
    }
  },

  /*
   remove a group from Firestore and update state
   - nico
  */
  removeGroup: async (groupId: string) => {
    try {
      await deleteDoc(doc(db, "groups", groupId));
      set((state) => ({ groups: state.groups.filter((group) => group.id !== groupId) }));
    } catch (error) {
      console.error("groupStore => Error deleting groups:", error);
    }
  },
}));
