import { View, SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useState } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useGroupStore } from "@/stores/groupStore";
import { useAuthStore } from "@/stores/authStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { RootStackParamList } from "../navigation/Navigation";
import { AntDesign } from "@expo/vector-icons";
import CustomText from "../components/CustomText";

/*
 Screen for creating a new group
 - nico
*/
export default function CreateGroupScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const addGroup = useGroupStore((state) => state.addGroup);
  const user = useAuthStore((state) => state.user);

  const [groupName, setGroupName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [members, setMembers] = useState<{ id: string; email: string; name: string }[]>([]);

  // Mitglied hinzufügen
  const handleAddMember = async () => {
    if (!memberEmails.trim()) return;
    try {
      const emailLowerCase = memberEmails.toLowerCase();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailLowerCase));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setMembers((prevMembers) => [
          ...prevMembers,
          { id: userDoc.id, email: userData.email, name: userData.name },
        ]);
        setMemberEmails("");
      } else {
        console.error("Kein Nutzer mit dieser E-Mail gefunden.");
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Mitglieds:", error);
    }
  };

  // Gruppe erstellen
  const handleCreateGroup = async () => {
    if (!groupName.trim() || !user) return;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const creatorDocId = querySnapshot.docs[0].id;
        const memberIds = [creatorDocId, ...members.map((member) => member.id)];
        await addGroup({ name: groupName, memberIds, eventIds: [] });
        navigation.goBack();
      } else {
        console.error("Fehler: Konnte die Firestore-ID des Erstellers nicht finden.");
      }
    } catch (error) {
      console.error("Fehler beim Erstellen der Gruppe:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header mit Zurück-Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <CustomText style={styles.title}>Gruppe erstellen</CustomText>
      </View>

      <View style={styles.card}>
        {/* Gruppenname */}
        <CustomText style={styles.label}>Gruppenname:</CustomText>
        <TextInput
          style={[styles.input, { fontFamily: "SpaceMono" }]}
          placeholder="Name der Gruppe eingeben..."
          placeholderTextColor="#A9A9A9"
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Mitglieder hinzufügen */}
        <CustomText style={styles.label}>Mitglieder per E-Mail hinzufügen:</CustomText>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.inputFlex, { fontFamily: "SpaceMono" }]}
            placeholder="E-Mail eingeben..."
            placeholderTextColor="#A9A9A9"
            value={memberEmails}
            onChangeText={(text) => setMemberEmails(text.toLowerCase())}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <AntDesign name="plus" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Liste der hinzugefügten Mitglieder */}
        <FlatList
          data={members}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <View style={styles.listRow}>
              <CustomText style={styles.listItem}>
                {item.name} ({item.email})
              </CustomText>
              <TouchableOpacity onPress={() => setMembers(members.filter((m) => m.id !== item.id))}>
                <AntDesign name="closecircle" size={18} color="#1C313B" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Gruppe erstellen */}
        <TouchableOpacity style={styles.saveButton} onPress={handleCreateGroup}>
          <CustomText style={styles.saveText}>Speichern</CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// STYLES
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
    fontFamily: "SpaceMono",
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
    fontFamily: "SpaceMono",
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
    fontSize: 16,
    color: "#1C313B",
  },
  inputFlex: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    color: "#1C313B",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  addButton: {
    backgroundColor: "#C7E85D",
    borderRadius: 5,
    padding: 8,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  listItem: {
    fontSize: 16,
    color: "#1C313B",
    fontFamily: "SpaceMono",
  },
  saveButton: {
    backgroundColor: "#C7E85D",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMono",
  },
});
