import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthStore } from "../stores/authStore"; // Firebase Auth Store
import CustomText from "../components/CustomText";

export default function EventDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, groupId, date, time, host } = route.params as {eventId: string; groupId: string; date: string; time: string; host: string;};
  const currentUser = useAuthStore((state) => state.user); // Aktueller Benutzer
  const userId = currentUser?.uid || ""; // Benutzer-ID 
  // Zustände für Spiele & Essen mit Voting-Daten
  const [games, setGames] = useState<{ name: string; votes: number; votedBy: string[] }[]>([]);
  const [food, setFood] = useState<{ name: string; votes: number; votedBy: string[] }[]>([]);
  const [newGame, setNewGame] = useState("");
  const [newFood, setNewFood] = useState("");
  // Zustände, um zu tracken, ob der Benutzer schon abgestimmt hat
  const [userVotedGame, setUserVotedGame] = useState(false); 
  const [userVotedFood, setUserVotedFood] = useState(false);

  type EventData = {
    games: { name: string; votes: number; votedBy: string[] }[];
    food: { name: string; votes: number; votedBy: string[] }[];
  };

  /*
  Lädt die Event-Daten aus Firestore, wenn Screen geöffnet wird.
  Prüft, ob der aktuelle Nutzer bereits abgestimmt hat
  */
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
          setUserVotedGame(eventData.games.some((item) => item.votedBy?.includes(userId)));
          setUserVotedFood(eventData.food.some((item) => item.votedBy?.includes(userId)));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Event-Daten:", error);
      }
    };
    if (userId) {
      fetchEventDetails();
    }
  }, [eventId, groupId, userId]);
  
  // Ein neues Spiel zur Liste hinzufügen und in Firestore speichern.
  const handleAddGame = async () => {
    if (!newGame) return;
    const updatedGames = [...games, { name: newGame, votes: 0, votedBy: [] }];
    setGames(updatedGames);
    setNewGame("");
    await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { games: updatedGames });
  };

  // Neues Essen hinzufügen und in Firestore speichern.
  const handleAddFood = async () => {
    if (!newFood) return;
    const updatedFood = [...food, { name: newFood, votes: 0, votedBy: [] }];
    setFood(updatedFood);
    setNewFood("");
    await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { food: updatedFood });
  };

  // Abstimmung für ein Spiel oder Essen durchführen.
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

    // Zustand aktualisieren und Kateorien für weitere Abstimmugn sperren 
    if (category === "games") {
      setGames(updatedList);
      setUserVotedGame(true); 
    } else {
      setFood(updatedList);
      setUserVotedFood(true); 
    }
    // Firestore aktualisieren
    await updateDoc(doc(db, `groups/${groupId}/events`, eventId), { [category]: updatedList });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <CustomText style={styles.title}>Event Details</CustomText>
      </View>

      <View style={styles.card}>
        <CustomText style={styles.cardTitle}>Datum: {date}</CustomText>
        <CustomText style={styles.cardText}>Uhrzeit: {time}</CustomText>
        <CustomText style={styles.cardText}>Bei: {host}</CustomText>
      </View>

      <View style={styles.voteCard}>
        <CustomText style={styles.voteCardTitle}>Für Essen und Spiele abstimmen:</CustomText>

        {/* Spiele */}
        <View style={styles.card}>
          <CustomText style={styles.cardTitle}>Spiele</CustomText>
          <FlatList
            data={games}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.voteRow}
                onPress={() => handleVote("games", index)}
                disabled={userVotedGame} // Nutzer kann nur einmal abstimmen
              >
                <CustomText style={styles.listItem}>{item.name}</CustomText>
                <View style={styles.voteDisplay}>
                  <CustomText style={styles.voteCount}>{item.votes}</CustomText>
                  {!userVotedGame && <AntDesign name="pluscircleo" size={18} color="green" />}
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { width: "91%", fontFamily: "SpaceMono", fontSize: styles.placeholderText.fontSize }]}
              placeholder="Spiel hinzufügen"
              value={newGame}
              onChangeText={setNewGame}
            />
            <TouchableOpacity onPress={handleAddGame} style={styles.addButton}>
              <AntDesign name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Essen */}
        <View style={styles.card}>
          <CustomText style={styles.cardTitle}>Essen</CustomText>
          <FlatList
            data={food}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.voteRow}
                onPress={() => handleVote("food", index)}
                disabled={userVotedFood} // Nutzer kann nur einmal abstimmen
              >
                <CustomText style={styles.listItem}>{item.name}</CustomText>
                <View style={styles.voteDisplay}>
                  <CustomText style={styles.voteCount}>{item.votes}</CustomText>
                  {!userVotedFood && <AntDesign name="pluscircleo" size={18} color="green" />}
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { width: "91%", fontFamily: "SpaceMono", fontSize: styles.placeholderText.fontSize }]}
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
  container: { 
    flex: 1, 
    backgroundColor: "#1C313B", 
    padding: 10 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 15 
  },
  backButton: { 
    position: "absolute", 
    left: 15 
  },
  backText: { 
    fontSize: 24, 
    color: "#C7E85D" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "white" 
  },
  placeholderText: {
    fontSize: 16,
    color: "#A9A9A9",
    fontFamily: "SpaceMono",
  },
  card: { 
    width: "95%", 
    backgroundColor: "#E5E5E5", 
    borderRadius: 10, 
    padding: 20, 
    marginBottom: 10, 
    alignSelf: "center" 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  input: { 
    flex: 1, 
    backgroundColor: "white", 
    borderRadius: 5, 
    padding: 8, 
    marginTop: 5 
  },
  cardText: { 
    fontSize: 16, 
    color: "#666" 
  },
  listItem: { 
    fontSize: 16, 
    color: "black" 
  },
  voteRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingVertical: 5, 
  },
  voteDisplay: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 },
  voteCount: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  addRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10 
  },
  addButton: { 
    backgroundColor: "#C7E85D", 
    borderRadius: 5, 
    padding: 9, 
    marginLeft: 10, 
    marginTop: 4.5 
  },
  voteCard: { 
    width: "95%", 
    backgroundColor: "#C7E85D", 
    borderRadius: 10, 
    padding: 5, 
    marginBottom: 10, 
    alignSelf: "center", 
    alignItems: "center" 
  },
  voteCardTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "black", 
    paddingVertical: 15, 
  },
});
