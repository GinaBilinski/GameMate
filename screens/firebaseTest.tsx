// screens/firebaseTest.tsx
import React, { useState } from "react";
import { View, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import CustomText from "../components/CustomText";
import styles from "../constants/styles"; 


// Daten in Firestore speichern, abzurufen und  löschen testen -gina
export default function FirebaseTestScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState("");
  const [data, setData] = useState<{ id: string; name: string }[]>([]);

  // Funktion zum Speichern von Daten in Firestore -gina
  async function handleAddData() {
    try {
      const docRef = await addDoc(collection(db, "testCollection"), { name });
      console.log("Gespeichert mit ID:", docRef.id);
      fetchData();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  }

  // Funktion zum Abrufen aller gespeicherten Daten aus Firestore -gina
  async function fetchData() {
    try {
      const querySnapshot = await getDocs(collection(db, "testCollection"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setData(items);
    } catch (error) {
      console.error("Fehler beim Abrufen:", error);
    }
  }
  // Funktion zum Löschen eines Elements aus Firestore -gina
  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "testCollection", id));
      console.log("Dokument gelöscht:", id);
      fetchData();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  }

  return (
    // SafeAreaView sorgt dafür, dass Inhalte nicht unter die Statusleiste rutschen -gina
    <SafeAreaView style={styles.container}> 
      <CustomText style={localStyles.title}>Firebase Test</CustomText>
      <TextInput placeholder="Name eingeben..." value={name} onChangeText={setName} style={localStyles.input}/>
      <Button title="Daten speichern" onPress={handleAddData} />
      <Button title="Daten abrufen" onPress={fetchData} />
    
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={localStyles.item}>
            <CustomText>{item.name}</CustomText>
            <Button title="Löschen" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
      
      <Button title="Zurück" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#FFF",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
});
