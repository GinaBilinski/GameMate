import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthStore } from "../stores/authStore"; // Firebase Auth Store

export default function EventDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, groupId, date, time, host } = route.params as {
    eventId: string;
    groupId: string;
    date: string;
    time: string;
    host: string;
  };

  const currentUser = useAuthStore((state) => state.user); // Aktueller Benutzer
  const userId = currentUser?.uid || ""; // Benutzer-ID 
  const [games, setGames] = useState<{ name: string; votes: number; votedBy: string[] }[]>([]);
  const [food, setFood] = useState<{ name: string; votes: number; votedBy: string[] }[]>([]);
  const [newGame, setNewGame] = useState("");
  const [newFood, setNewFood] = useState("");
  const [userVotedGame, setUserVotedGame] = useState(false);
  const [userVotedFood, setUserVotedFood] = useState(false);

  type EventData = {
    games: { name: string; votes: number; votedBy: string[] }[];
    food: { name: string; votes: number; votedBy: string[] }[];
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventRef = doc(db, `groups/${groupId}/events`, eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          const eventData = eventSnap.data() as EventData;
          const formatItems = (items: any) =>
            items.map((item: any) =>
              typeof item === "string" ? { name: item, votes: 0, votedBy: [] } : item
            );
          setGames(formatItems(eventData.games || []));
          setFood(formatItems(eventData.food || []));
          // Prüfen, ob der Benutzer bereits für eine Kategorie gewählt hat
          setUserVotedGame(eventData.games.some((item) => item.votedBy.includes(userId)));
          setUserVotedFood(eventData.food.some((item) => item.votedBy.includes(userId)));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Event-Daten:", error);
      }
    };
    if (userId) {
      fetchEventDetails();
    }
  }, [eventId, groupId, userId]);

  const handleAddGame = async () => {
    if (!newGame) return;
    const updatedGames = [...games, { name: newGame, votes: 0, votedBy: [] }];
    setGames(updatedGames);
    setNewGame("");
    await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { games: updatedGames });
  };

  const handleAddFood = async () => {
    if (!newFood) return;
    const updatedFood = [...food, { name: newFood, votes: 0, votedBy: [] }];
    setFood(updatedFood);
    setNewFood("");
    await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { food: updatedFood });
  };

  const handleVote = async (category: "games" | "food", index: number) => {
    if (!currentUser) {
      alert("Du musst angemeldet sein, um abzustimmen!");
      return;
    }
    if (category === "games" && userVotedGame) {
      alert("Du hast bereits ein Spiel gewählt!");
      return;
    }
    if (category === "food" && userVotedFood) {
      alert("Du hast bereits ein Essen gewählt!");
      return;
    }

    const updatedList = category === "games" ? [...games] : [...food];

    updatedList[index].votes += 1;
    updatedList[index].votedBy.push(userId);

    if (category === "games") {
      setGames(updatedList);
      setUserVotedGame(true); // Sperrt weitere Abstimmungen in dieser Kategorie
    } else {
      setFood(updatedList);
      setUserVotedFood(true); // Sperrt weitere Abstimmungen in dieser Kategorie
    }

    await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { [category]: updatedList });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Event Details</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datum: {date}</Text>
        <Text style={styles.cardText}>Uhrzeit: {time}</Text>
        <Text style={styles.cardText}>Bei: {host}</Text>
      </View>

      <View style={styles.voteCard}>
        <Text style={styles.voteCardTitle}>Für Essen und Spiele abstimmen:</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spiele</Text>
          <FlatList
            data={games}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.voteRow}
                onPress={() => handleVote("games", index)}
                disabled={userVotedGame} // Nutzer kann nur einmal abstimmen
              >
                <Text style={styles.listItem}>{item.name}</Text>
                <View style={styles.voteDisplay}>
                  <Text style={styles.voteCount}>{item.votes}</Text>
                  {!userVotedGame && <AntDesign name="pluscircleo" size={20} color="green" />}
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Spiel hinzufügen"
              value={newGame}
              onChangeText={setNewGame}
            />
            <TouchableOpacity onPress={handleAddGame} style={styles.addButton}>
              <AntDesign name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Essen</Text>
          <FlatList
            data={food}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.voteRow}
                onPress={() => handleVote("food", index)}
                disabled={userVotedFood} // Nutzer kann nur einmal abstimmen
              >
                <Text style={styles.listItem}>{item.name}</Text>
                <View style={styles.voteDisplay}>
                  <Text style={styles.voteCount}>{item.votes}</Text>
                  {!userVotedFood && <AntDesign name="pluscircleo" size={20} color="green" />}
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Essen hinzufügen"
              value={newFood}
              onChangeText={setNewFood}
            />
            <TouchableOpacity onPress={handleAddFood} style={styles.addButton}>
              <AntDesign name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C313B", padding: 10 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15 },
  backButton: { position: "absolute", left: 15 },
  backText: { fontSize: 24, color: "white" },
  title: { fontSize: 22, fontWeight: "bold", color: "white" },
  card: { width: "95%", backgroundColor: "#E5E5E5", borderRadius: 10, padding: 20, marginBottom: 10, alignSelf: "center" },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  input: { flex: 1, backgroundColor: "white", borderRadius: 5, padding: 8, marginTop: 5 },
  cardText: { fontSize: 16, color: "#666" },
  listItem: { fontSize: 16, color: "black" },
  voteRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  voteDisplay: { flexDirection: "row", alignItems: "center", gap: 10 },
  voteCount: { fontSize: 16, fontWeight: "bold" },
  addRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  addButton: { backgroundColor: "#C7E85D", borderRadius: 5, padding: 9, marginLeft: 10, marginTop: 4.5 },
  voteCard: { width: "95%", backgroundColor: "#C7E85D", borderRadius: 10, padding: 5, marginBottom: 10, alignSelf: "center", alignItems: "center" },
  voteCardTitle: { fontSize: 18, fontWeight: "bold", color: "black", paddingVertical: 15, },
});
