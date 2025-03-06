import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { useEffect } from "react";
import { useGroupStore } from "../stores/groupStore";
import { useEventStore } from "../stores/eventStore";
import { RootStackParamList } from "../navigation/Navigation";
import CustomText from "../components/CustomText";

/*
 Screen Gruppenübersicht
 - gina
*/
export default function GroupOverviewScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const group = useGroupStore((state) => state.groups.find((g) => g.id === groupId));
  const { events, loadGroupEvents: loadEventsByGroup } = useEventStore();

  useEffect(() => {
    loadEventsByGroup(groupId);
  }, [groupId]);

  const nextEvent = events
  .filter(event => event.groupId === groupId)
  .map(event => {
    let eventDateTime;
    if (event.date.includes(".") && event.time) { // String in Date umwandeln
      const [day, month, year] = event.date.split(".");
      eventDateTime = new Date(`${year}-${month}-${day}T${event.time}:00`);
    } else {
      eventDateTime = new Date(`${event.date}T${event.time}:00`);
    }
    return { ...event, eventDateTime };
  })
  .filter(event => event.eventDateTime >= new Date()) // Vergangene Events ignorieren
  .sort((a, b) => a.eventDateTime.getTime() - b.eventDateTime.getTime())[0] || null; // Nächstes Event bestimmen


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <CustomText style={styles.title}>{group?.name}</CustomText>
      </View>

      {/* Geplante Events */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("NextEvents", { groupId })}>
        <CustomText style={styles.cardTitle}>Geplante Events</CustomText>
        {nextEvent ? (
          <>
            <CustomText style={styles.cardText}>Nächstes Event:</CustomText>
            <CustomText style={styles.cardText}>Bei: {nextEvent.host}</CustomText>
            <CustomText style={styles.cardText}>Datum: {nextEvent.date} - {nextEvent.time}</CustomText>
          </>
        ) : (
          <CustomText style={styles.cardText}>Keine geplanten Events</CustomText>
        )}
      </TouchableOpacity>

      {/* Gruppenmitglieder */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("GroupMembers", { groupId })}>
        <CustomText style={styles.cardTitle}>Gruppenmitglieder</CustomText>
      </TouchableOpacity>

      {/* Chat */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Chat", { groupId })}>
        <CustomText style={styles.cardTitle}>Chat</CustomText>
      </TouchableOpacity>

      {/* Event Planen */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("CreateEvent", { groupId })}>
        <CustomText style={styles.cardTitle}>Event Planen</CustomText>
      </TouchableOpacity>

      {/* Vergangene Events */}
<<<<<<< HEAD
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("PastEvents", { groupId })}>
        <Text style={styles.cardTitle}>Vergangene Events</Text>
=======
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("PastEvents")}>
        <CustomText style={styles.cardTitle}>Vergangene Events</CustomText>
>>>>>>> gina-Gruppenuebersicht
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

