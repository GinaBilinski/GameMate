import React, { useState, useEffect } from "react";
import {View, SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Platform,} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useAuthStore } from "../stores/authStore";
import CustomText from "../components/CustomText";
import { useEventStore } from "../stores/eventStore";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Unsubscribe } from "firebase/firestore"; 

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
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.uid || "";
  const { currentEvent, loadEventDetails, addGame, addFood, vote } = useEventStore();
  const [newGame, setNewGame] = useState("");
  const [newFood, setNewFood] = useState("");

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    (async () => {
      if (userId) {
        unsubscribe = (await loadEventDetails(groupId, eventId)) as Unsubscribe | undefined;
      }
    })();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [eventId, groupId, userId]);
  
  

  const userVotedGame = currentEvent?.games.some((item) => item.votedBy.includes(userId));
  const userVotedFood = currentEvent?.food.some((item) => item.votedBy.includes(userId));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixer Header außerhalb des scrollbaren Bereichs */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <CustomText style={styles.title}>Event Details</CustomText>
      </View>

      {/* Scrollbarer Bereich für den restlichen Inhalt */}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        extraHeight={100}
        enableOnAndroid={true}
      >
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
              data={currentEvent?.games || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.voteRow}
                  onPress={() => vote(groupId, eventId, "games", index)}
                  disabled={userVotedGame}
                >
                  <CustomText style={styles.listItem}>{item.name}</CustomText>
                  <View style={styles.voteDisplay}>
                    <CustomText style={styles.voteCount}>{item.votes}</CustomText>
                    {!userVotedGame && <AntDesign name="pluscircleo" size={18} color="green" />}
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
            <View style={styles.addRow}>
              <TextInput
                style={[
                  styles.input,
                  { width: "87%", fontFamily: "SpaceMono", fontSize: styles.placeholderText.fontSize },
                ]}
                placeholder="Spiel hinzufügen"
                value={newGame}
                onChangeText={setNewGame}
                autoCorrect={true}
                autoCapitalize="sentences"
                keyboardType="default"
                textContentType="none"
              />
              <TouchableOpacity
                onPress={() => {
                  addGame(groupId, eventId, newGame);
                  setNewGame("");
                }}
                style={styles.addButton}
              >
                <AntDesign name="plus" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Essen */}
          <View style={styles.card}>
            <CustomText style={styles.cardTitle}>Essen</CustomText>
            <FlatList
              data={currentEvent?.food || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.voteRow}
                  onPress={() => vote(groupId, eventId, "food", index)}
                  disabled={userVotedFood}
                >
                  <CustomText style={styles.listItem}>{item.name}</CustomText>
                  <View style={styles.voteDisplay}>
                    <CustomText style={styles.voteCount}>{item.votes}</CustomText>
                    {!userVotedFood && <AntDesign name="pluscircleo" size={18} color="green" />}
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
            <View style={styles.addRow}>
              <TextInput
                style={[
                  styles.input,
                  { width: "87%", fontFamily: "SpaceMono", fontSize: styles.placeholderText.fontSize },
                ]}
                placeholder="Essen hinzufügen"
                value={newFood}
                onChangeText={setNewFood}
                autoCorrect={true}
                autoCapitalize="sentences"
                keyboardType="default"
                textContentType="none"
              />
              <TouchableOpacity
                onPress={() => {
                  addFood(groupId, eventId, newFood);
                  setNewFood("");
                }}
                style={styles.addButton}
              >
                <AntDesign name="plus" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1C313B",
  },
  scrollContent: {
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#1C313B",
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  backText: {
    fontSize: 24,
    color: "#C7E85D",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  placeholderText: {
    fontSize: 16,
    color: "#A9A9A9",
    fontFamily: "SpaceMono",
  },
  card: {
    width: "99%",
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    alignSelf: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 7.5,
    marginTop: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#666",
  },
  listItem: {
    fontSize: 16,
    color: "black",
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
    gap: 10,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#C7E85D",
    borderRadius: 5,
    padding: 9,
    marginLeft: 7,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  voteCard: {
    width: "99%",
    backgroundColor: "#C7E85D",
    borderRadius: 10,
    padding: 5,
    marginBottom: 10,
    alignSelf: "center",
    alignItems: "center",
  },
  voteCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    paddingVertical: 15,
  },
});
