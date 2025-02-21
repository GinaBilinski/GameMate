import React from "react";
import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

/*
 Screen für ausgewählte Event
 - gina
*/
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

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>Änderungen speichern</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C313B",
    paddingHorizontal: 10,
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
  saveButton: {
    backgroundColor: "#C7E85D",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center", 
    width: "60%", 
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});