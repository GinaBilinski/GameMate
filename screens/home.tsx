import React, { useEffect } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useGroupStore } from "../stores/groupStore";
import { useEventStore } from "../stores/eventStore";
import GroupTile from "../components/GroupTile";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }: { navigation: any }) {
  const groups = useGroupStore((state) => state.groups);
  const loadGroups = useGroupStore((state) => state.loadGroups);
  const { events, loadEventsByGroup } = useEventStore();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    groups.forEach((group) => {
      if (group.id) loadEventsByGroup(group.id);
    });
  }, [groups]);

  /*
   Holt das nächste geplante Event einer Gruppe.
   */
  const getNextEventForGroup = (groupId: string) => {
    const groupEvents = events
      .filter(event => event.groupId === groupId)
      .map(event => {
        let eventDateTime;      
        if (event.date.includes(".") && event.time) { 
          const [day, month, year] = event.date.split(".");
          eventDateTime = new Date(`${year}-${month}-${day}T${event.time}:00`);
        } else {
          eventDateTime = new Date(`${event.date}T${event.time}:00`);
        }
        return { ...event, eventDateTime };
      })
      .filter(event => event.eventDateTime >= new Date()) // Vergangene Events ignorieren
      .sort((a, b) => a.eventDateTime.getTime() - b.eventDateTime.getTime()); // Nach Datum aufsteigend sortieren
  
    return groupEvents.length > 0 ? groupEvents[0] : null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Gruppenübersicht</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CreateGroup")} style={styles.plusButton}>
          <Ionicons name="add-circle-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          renderItem={({ item }) => {
            const nextEvent = item.id ? getNextEventForGroup(item.id) : null;

            return (
              <GroupTile 
                groupId={item.id ?? "unknown-group"}
                groupName={item.name}
                nextEventHost={nextEvent ? `Bei: ${nextEvent.host}` : "Kein Event geplant"}
                nextEventDate={nextEvent ? `${nextEvent.date} - ${nextEvent.time}` : ""}
              />
            );
          }}
        />
      ) : (
        <View style={styles.noGroupsContainer}>
          <Text style={styles.noGroupsText}>Noch keine Gruppe erstellt oder beigetreten</Text>
        </View>
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
  menuButton: {
    position: "absolute",
    left: 15, 
  },
  plusButton: {
    position: "absolute",
    right: 15, 
  },
  title: {
    fontSize: 22, 
    fontWeight: "bold",
    color: "white",
  },
  noGroupsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noGroupsText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
});
