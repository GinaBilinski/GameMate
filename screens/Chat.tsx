import React, { useState, useEffect, useRef } from "react";
import { View,Text,TextInput,StyleSheet,TouchableOpacity,FlatList,Keyboard,Platform,} from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuthStore } from "../stores/authStore";
import { useGroupStore } from "../stores/groupStore";
import { useUserStore } from "../stores/userStore"; 
import CustomText from "../components/CustomText";

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const currentUser = useAuthStore((state) => state.user);
  const group = useGroupStore((state) => state.groups.find((g) => g.id === groupId));
  const { users } = useUserStore(); 
  const [messages, setMessages] = useState<{ id: string; senderId: string; text: string; timestamp: number }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const chatRef = collection(db, `groups/${groupId}/chats`);
    const q = query(chatRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any;
      setMessages(loadedMessages);
      scrollToBottom(); 
    });
    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        scrollToBottom(); 
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    await addDoc(collection(db, `groups/${groupId}/chats`), {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: Date.now(),
    });
    setNewMessage("");
    scrollToBottom(); 
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  };

  // Funktion zur Berechnung der Höhe jeder Nachricht
  const getItemLayout = (data: any, index: number) => {
    const itemHeight = 100; 
    return { length: itemHeight, offset: itemHeight * index, index };
  };

  // Funktion, um den Namen des Absenders zu ermitteln
  const getSenderName = (senderId: string) => {
    const sender = users.find((user) => user.id === senderId);
    return sender ? sender.name : "Unbekannt";
  };

  return (
    <View style={styles.container}>
      {/* Header bleibt fixiert */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <CustomText style={styles.title}>{group?.name || "Chat"}</CustomText>
      </View>

      {/* Flatlist für Nachrichten */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isSameSender = index > 0 && messages[index - 1].senderId === item.senderId;
          const showSenderName = !isSameSender && item.senderId !== currentUser?.uid;

          return (
            <View style={[styles.messageContainer, item.senderId === currentUser?.uid ? styles.sentMessage : styles.receivedMessage]}>
              {showSenderName && (
                <CustomText style={styles.senderName}>{getSenderName(item.senderId)}</CustomText>
              )}
              <CustomText style={styles.messageText}>{item.text}</CustomText>
              <CustomText style={styles.timestamp}>{formatDate(item.timestamp)}</CustomText>
            </View>
          );
        }}
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
        style={styles.messageList}
        initialScrollIndex={messages.length > 0 ? messages.length - 1 : 0} 
        getItemLayout={getItemLayout} 
        onContentSizeChange={() => scrollToBottom()} 
        onLayout={() => scrollToBottom()} 
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToEnd({ animated: false }); 
        }}
      />

      {/* Eingabefeld bleibt unten fixiert */}
      <View style={[styles.inputContainer, { marginBottom: keyboardHeight }]}>
        <TextInput
          style={styles.input}
          placeholder="Nachricht schreiben..."
          placeholderTextColor="#666"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <AntDesign name="arrowright" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1C313B" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 70,
    paddingBottom: 20,
    position: "relative",
    backgroundColor: "#1C313B",
  },
  backButton: { 
    position: "absolute", 
    left: 15, 
    paddingTop: 50, 
  },
  backText: { 
    fontSize: 24, 
    color: "white" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "white" 
  },
  messageList: { 
    flex: 1 
  },
  flatListContent: { 
    flexGrow: 1, 
    paddingTop: 10, 
    paddingHorizontal: 10 
  }, 

  /* Nachricht */
  messageContainer: { 
    maxWidth: "75%", 
    padding: 10, 
    borderRadius: 15, 
    marginVertical: 5 
  },
  sentMessage: { 
    backgroundColor: "#C7E85D", 
    alignSelf: "flex-end", 
    marginRight: 10 
  },
  receivedMessage: { 
    backgroundColor: "#E5E5E5", 
    alignSelf: "flex-start", 
    marginLeft: 10 
  },
  senderName: { 
    fontSize: 12, 
    color: "#666", 
    marginBottom: 5 
  }, 
  messageText: { 
    fontSize: 16, 
    color: "black" },
  timestamp: { 
    fontSize: 12, 
    color: "#666", 
    marginTop: 5, 
    textAlign: "right" },

  /* Eingabefeld bleibt unten fixiert */
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#C7E85D",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: { 
    flex: 1, 
    backgroundColor: "white", 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    fontSize: 16, 
    fontFamily: "SpaceMono", 
  },
  sendButton: { 
    backgroundColor: "#A3D33D", 
    borderRadius: 20, 
    padding: 10, 
    marginLeft: 10 
  },
});