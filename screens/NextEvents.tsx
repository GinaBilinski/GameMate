import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";
import { useEventStore } from "../stores/eventStore";

type EventData = {
  id?: string;
  host: string;
  date: string;
  time: string;
  games: string[];
  food: string[];
  groupId: string;
};

export default function NextEventsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const { events, loadEventsByGroup } = useEventStore();
  const [groupEvents, setGroupEvents] = useState<EventData[]>([]);

  // Events aus Firestore laden
  useEffect(() => {
    loadEventsByGroup(groupId);
  }, [groupId]);

  // Events filtern & sortieren 
  useEffect(() => {
    const now = new Date();

    const filteredEvents: EventData[] = events
      .filter((event) => event.groupId === groupId) // Nur Events der aktuellen Gruppe
      .map((event) => {
        let eventDateTime;

        if (event.date.includes(".") && event.time) { 
          const [day, month, year] = event.date.split(".");
          eventDateTime = new Date(`${year}-${month}-${day}T${event.time}:00`);
        } else {
          eventDateTime = new Date(`${event.date}T${event.time}:00`);
        }

        return { ...event, eventDateTime };
      })
      .filter((event) => event.eventDateTime >= now) // Vergangene Events entfernen
      .sort((a, b) => a.eventDateTime.getTime() - b.eventDateTime.getTime()); // Nach nächstem Termin sortieren

    setGroupEvents(filteredEvents);
  }, [events]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Geplante Events</Text>
      </View>

      {groupEvents.length === 0 ? (
        <Text style={styles.noEventsText}>Keine geplanten Events</Text>
      ) : (
        groupEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.card}
            onPress={() => navigation.navigate("EventDetails", { 
              eventId: event.id ?? "", 
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
