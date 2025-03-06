import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";
import { useEventStore, calculateAverageRating } from "../stores/eventStore";

export default function RateEventScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { eventId, groupId } = route.params as { eventId: string; groupId: string };

  const { events, submitRating, isRatedUser } = useEventStore();

  // Find the event from Zustand state
  const event = events.find((e) => e.id === eventId);

  const [hasRated, setHasRated] = useState<boolean>(false);

  // State for ratings
  const [hostRating, setHostRating] = useState<number | null>(null);
  const [foodRating, setFoodRating] = useState<number | null>(null);
  const [experienceRating, setExperienceRating] = useState<number | null>(null);

  // State for average ratings
  const [avgHostRating, setAvgHostRating] = useState(0);
  const [avgFoodRating, setAvgFoodRating] = useState(0);
  const [avgOverallRating, setAvgOverallRating] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const rated = await isRatedUser(eventId, groupId);
        setHasRated(rated);
      } catch (error) {
        console.error("RateEventScreen => Failed to check rating status:", error);
      }
    })();
  }, [eventId, groupId]);

  useEffect(() => {
    if (event) {
      setAvgHostRating(calculateAverageRating(event.hostRatings));
      setAvgFoodRating(calculateAverageRating(event.foodRatings));
      setAvgOverallRating(calculateAverageRating(event.overallRatings));
    }
  }, [event]);

  // Function to submit rating
  const handleSubmitRating = async () => {
    if (hostRating === null || foodRating === null || experienceRating === null) {
      Alert.alert("Fehler", "Bitte alle Kategorien bewerten.");
      return;
    }

    try {
      await submitRating(eventId, groupId, hostRating, foodRating, experienceRating);
      setHasRated(true);

      // Update displayed averages
      setAvgHostRating(calculateAverageRating([...event?.hostRatings || [], hostRating]));
      setAvgFoodRating(calculateAverageRating([...event?.foodRatings || [], foodRating]));
      setAvgOverallRating(calculateAverageRating([...event?.overallRatings || [], experienceRating]));

      Alert.alert("Erfolgreich", "Danke für deine Bewertung!");
    } catch (error) {
      console.error("RateEventScreen => Error submitting rating:", error);
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

      {hasRated ? (
        <View style={styles.averageContainer}>
          <Text style={styles.averageTitle}>Durchschnittliche Bewertungen:</Text>
          <Text style={styles.averageText}>Gastgeber: {avgHostRating} / 10</Text>
          <Text style={styles.averageText}>Essen: {avgFoodRating} / 10</Text>
          <Text style={styles.averageText}>Gesamterlebnis: {avgOverallRating} / 10</Text>
        </View>
      ) : (
        <>
          <View style={styles.ratingContainer}>
            <RatingSection title="Gastgeber bewerten" rating={hostRating} setRating={setHostRating} />
            <RatingSection title="Essen bewerten" rating={foodRating} setRating={setFoodRating} />
            <RatingSection title="Gesamterlebnis bewerten" rating={experienceRating} setRating={setExperienceRating} />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitRating}>
            <Text style={styles.submitText}>Bewertung absenden</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

// Component for rating section (0-10)
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
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  averageContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    alignSelf: "center",
  },
  averageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1C313B",
  },
  averageText: {
    fontSize: 16,
    color: "#1C313B",
    marginVertical: 2,
  },
});
