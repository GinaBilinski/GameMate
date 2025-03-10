/*
  importing dependencies
  zustand manages state, Firestore handles database operations
  - nico
*/
import { create } from "zustand";
import { db } from "../services/firebaseConfig";
import { collection, doc, addDoc, getDoc, deleteDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
  usedHosts?: string[]
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
  getGroupMembers: (groupId: string) => Promise<string[]>;
  addMember: (userId: string, groupId: string) => Promise<void>;
  removeMember: (userId: string, groupId: string) => Promise<void>;
  updateUsedHosts: (groupId: string, newUsedHosts: string[]) => Promise<void>; // <--- hinzufügen
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
      if (!currentUserId) {
        console.error("groupStore => No user with the Id found", authId);
        return;
      }
      const groupsRef = collection(db, "groups");
      const groupsSorted = query(groupsRef, where("memberIds", "array-contains", currentUserId));
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

  /*
    Function to retrieve the member IDs of a group from Firestore.
    - nico
  */
  getGroupMembers: async (groupId: string) => {
    try {
      const groupDocRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupDocRef);

      if (!groupDoc.exists()) {
        console.error("getGroupMembers => Group not found:", groupId);
        return [];
      }

      // Retrieve and return the member IDs from the group document
      const groupData = groupDoc.data() as { memberIds: string[] };
      const memberIds = groupData.memberIds ?? [];

      if (memberIds.length === 0) {
        console.error("groupStore/getGroupMembers => No members found");
        return [];
      }

      return memberIds;
    } catch (error) {
      console.error("groupStore/getGroupMembers => Error fetching group member IDs:", error);
      return [];
    }
  },

/*
    Function to add a member to a group
    - nico
  */
    addMember: async (userId: string, groupId: string) => {
      try {
        const groupDocRef = doc(db, "groups", groupId);
        const groupDoc = await getDoc(groupDocRef);
        
        if (!groupDoc.exists()) {
          console.error("groupStore/addMember => Group not found:", groupId);
          return;
        }
  
        const groupData = groupDoc.data() as Group;
        if (groupData.memberIds.includes(userId)) {
          console.warn("groupStore/addMember => User is already a member of this group.");
          return;
        }
  
        await updateDoc(groupDocRef, {
          memberIds: arrayUnion(userId),
        });
  
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? { ...group, memberIds: [...group.memberIds, userId] }
              : group
          ),
        }));
      } catch (error) {
        console.error("groupStore/addMember => Error adding member:", error);
      }
    },
  
    /*
      Function to remove a member from a group
      - nico
    */
    removeMember: async (userId: string, groupId: string) => {
      try {
        const groupDocRef = doc(db, "groups", groupId);
        const groupDoc = await getDoc(groupDocRef);
  
        if (!groupDoc.exists()) {
          console.error("groupStore/removeMember => Group not found:", groupId);
          return;
        }
  
        const groupData = groupDoc.data() as Group;
        if (!groupData.memberIds.includes(userId)) {
          console.warn("groupStore/removeMember => User is not a member of this group.");
          return;
        }
  
        await updateDoc(groupDocRef, {
          memberIds: arrayRemove(userId),
        });
  
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? { ...group, memberIds: group.memberIds.filter((id) => id !== userId) }
              : group
          ),
        }));
      } catch (error) {
        console.error("groupStore/removeMember => Error removing member:", error);
      }
    },
    
  /*
  Aktualisiert die Gastgeber-Rotationsliste (usedHosts) für eine Gruppe.
  Damit wird sichergestellt, dass die Reihenfolge der Gastgeber im UI korrekt wiedergegeben wird.
  */
  updateUsedHosts: async (groupId: string, newUsedHosts: string[]) => {
    try {
      // Firestore aktualisieren
      await updateDoc(doc(db, "groups", groupId), { usedHosts: newUsedHosts });
      
      // Zustand im Store anpassen
      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId
            ? { ...g, usedHosts: newUsedHosts }
            : g
        ),
      }));
    } catch (error) {
      console.error("groupStore => Error updating usedHosts:", error);
    }
  },

}));
