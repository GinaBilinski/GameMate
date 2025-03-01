import React, { useState } from "react";
import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";
import { db } from "../services/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function RateEventScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { eventId, groupId } = route.params as { eventId: string; groupId: string };

  // State for ratings
  const [hostRating, setHostRating] = useState<number | null>(null);
  const [foodRating, setFoodRating] = useState<number | null>(null);
  const [experienceRating, setExperienceRating] = useState<number | null>(null);

  // Function to submit rating to Firestore
  const submitRating = async () => {
    if (hostRating === null || foodRating === null || experienceRating === null) {
      Alert.alert("Fehler", "Bitte alle Kategorien bewerten.");
      return;
    }

    try {
      const eventRef = doc(db, `groups/${groupId}/events`, eventId);
      await updateDoc(eventRef, {
        ratings: arrayUnion({
          host: hostRating,
          food: foodRating,
          experience: experienceRating,
          timestamp: new Date().toISOString(),
        }),
      });

      Alert.alert("Erfolgreich", "Danke für deine Bewertung!");
      navigation.goBack(); // Navigate back after submitting
    } catch (error) {
      console.error("Fehler beim Speichern der Bewertung:", error);
      Alert.alert("Fehler", "Die Bewertung konnte nicht gespeichert werden.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Event bewerten</Text>
      </View>

      <View style={styles.ratingContainer}>
        <RatingSection title="Gastgeber bewerten" rating={hostRating} setRating={setHostRating} />
        <RatingSection title="Essen bewerten" rating={foodRating} setRating={setFoodRating} />
        <RatingSection title="Gesamterlebnis bewerten" rating={experienceRating} setRating={setExperienceRating} />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submitRating}>
        <Text style={styles.submitText}>Bewertung absenden</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Component for rendering rating options (0-10)
const RatingSection = ({ title, rating, setRating }: { title: string; rating: number | null; setRating: (value: number) => void }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.ratingRow}>
        {[...Array(11).keys()].map((num) => (
          <TouchableOpacity 
            key={num} 
            style={[styles.ratingNumber, rating === num && styles.selectedRating]} 
            onPress={() => setRating(num)}
          >
            <Text style={styles.ratingText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};


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
  ratingContainer: {
    width: "100%",
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ratingNumber: {
    width: 35,
    height: 35,
    borderRadius: 5,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  selectedRating: {
    backgroundColor: "#FF5733",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C313B",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#FF5733",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
