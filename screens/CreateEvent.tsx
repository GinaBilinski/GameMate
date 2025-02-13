import { View, SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";

/*
 Screen für Events zu erstellen
 - gina
*/
export default function CreateEventScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Event Planen</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Gastgeber:</Text>
        <TextInput style={styles.input} placeholder="Wählen..." />

        <Text style={styles.label}>Datum:</Text>
        <TextInput style={styles.input} placeholder="TT/MM/JJJJ" />

        <Text style={styles.label}>Uhrzeit:</Text>
        <TextInput style={styles.input} placeholder="HH:MM" />

        <Text style={styles.label}>Spiele:</Text>
        <TextInput style={styles.input} placeholder="Spiel hinzufügen" />

        <Text style={styles.label}>Essen:</Text>
        <TextInput style={styles.input} placeholder="Essen hinzufügen" />

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Event speichern</Text>
        </TouchableOpacity>
      </View>
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#C7E85D",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
