import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";

/*
 Screen für geplante Events
 - gina
*/

// Dummy-Daten für geplante Events
const futureEvents = [
  { id: "1", date: "20.02.2025", time: "18:00", host: "Max Mustermann" },
  { id: "2", date: "27.02.2025", time: "19:30", host: "Lisa Schmidt" },
];

export default function NextEventsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Geplante Events</Text>
      </View>

      {futureEvents.length === 0 ? (
        <Text style={styles.noEventsText}>Keine geplanten Events</Text>
      ) : (
        futureEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.card}
            onPress={() => navigation.navigate("EventDetails", { 
              eventId: event.id, 
              groupId, 
              date: event.date, 
              time: event.time, 
              host: event.host 
            })}
          >
            <Text style={styles.cardTitle}>{event.date} - {event.time}</Text>
            <Text style={styles.cardText}>Bei: {event.host}</Text>
          </TouchableOpacity>
        ))
      )}
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
  noEventsText: {
    fontSize: 16,
    color: "#E5E5E5",
    textAlign: "center",
    marginTop: 20,
  },
});
