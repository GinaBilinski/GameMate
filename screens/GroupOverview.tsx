import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { useGroupStore } from "../stores/groupStore";
import { RootStackParamList } from "../navigation/Navigation";

/*
 Screen Gruppenübersicht
 - gina
*/
// Dummy-Daten für geplante Events
const futureEvents = [
  { id: "1", date: "20.02.2025", time: "18:00", host: "Max Mustermann" },
  { id: "2", date: "27.02.2025", time: "19:30", host: "Lisa Schmidt" },
];

export default function GroupOverviewScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const group = useGroupStore((state) => state.groups.find((g) => g.id === groupId));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{group?.name}</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("NextEvents", { groupId })}>
        <Text style={styles.cardTitle}>Geplante Events</Text>
        {futureEvents.length > 0 ? (
          <>
            <Text style={styles.cardText}>Nächstes Event:</Text>
            <Text style={styles.cardText}>Bei: Max Mustermann</Text>
            <Text style={styles.cardText}>Datum: 20.02.2025 - 18:00</Text>
          </>
        ) : (
          <Text style={styles.cardText}>Keine geplanten Events</Text>
        )}
      </TouchableOpacity>

      {/* Gruppenmitglieder */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("GroupMembers", { groupId })}>
        <Text style={styles.cardTitle}>Gruppenmitglieder</Text>
      </TouchableOpacity>

      {/* Chat */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Chat", { groupId })}>
        <Text style={styles.cardTitle}>Chat</Text>
      </TouchableOpacity>

      {/* Event Planen */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("CreateEvent", { groupId })}>
        <Text style={styles.cardTitle}>Event Planen</Text>
      </TouchableOpacity>

      {/* Vergangene Events */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("PastEvents", { groupId })}>
        <Text style={styles.cardTitle}>Vergangene Events</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C313B",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 15,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  backText: {
    fontSize: 24,
    color: "white",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  card: {
    width: "95%", 
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
  cardText: {
    fontSize: 16,
    color: "#666",
  },
});
