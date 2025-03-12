import { create } from "zustand";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
};

type ChatStore = {
  messages: Message[];
  loadMessages: (groupId: string) => void;
  sendMessage: (groupId: string, senderId: string, text: string) => Promise<void>;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  loadMessages: (groupId: string) => {
    const chatRef = collection(db, `groups/${groupId}/chats`);
    const q = query(chatRef, orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      set({ messages: loadedMessages });
    });
  },
  sendMessage: async (groupId: string, senderId: string, text: string) => {
    if (!text.trim()) return;
    await addDoc(collection(db, `groups/${groupId}/chats`), {
      senderId,
      text,
      timestamp: Date.now(),
    });
  },
}));
