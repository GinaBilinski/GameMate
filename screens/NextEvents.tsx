import React, { useEffect, useState, useCallback } from "react";
import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";
import { Event, useEventStore } from "../stores/eventStore";
import { parse, compareAsc } from 'date-fns';
import CustomText from "../components/CustomText";


export default function NextEventsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const { events, loadGroupEvents: loadGroupEvents } = useEventStore();
  const [ groupEvents, setNextEvents ] = useState<Event[]>([]);

  // Events aus Firestore laden
  useFocusEffect(
    useCallback(() => {
      loadGroupEvents(groupId);
    }, [groupId])
  );

  // Events filtern & sortieren 
  useEffect(() => {
    const filteredEvents: Event[] = events
      .filter((event) => event.groupId === groupId && !event.completed)
      .sort((a, b) => {
        const dateA = parse(`${a.date} ${a.time}`, 'dd.MM.yyyy HH:mm', new Date());
        const dateB = parse(`${b.date} ${b.time}`, 'dd.MM.yyyy HH:mm', new Date());
        return compareAsc(dateA, dateB);
      });
  
    setNextEvents(filteredEvents);
  }, [events]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <CustomText style={styles.title}>Geplante Events</CustomText>
      </View>

      {groupEvents.length === 0 ? (
        <CustomText style={styles.noEventsText}>Keine geplanten Events</CustomText>
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
            <CustomText style={styles.cardTitle}>{event.date} - {event.time}</CustomText>
            <CustomText style={styles.cardText}>Bei: {event.host}</CustomText>
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
    color: "#C7E850",
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
