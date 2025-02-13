import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useGroupStore } from "@/stores/groupStore";

/*
 Screen for creating a new group
 - nico
*/
export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const addGroup = useGroupStore((state) => state.addGroup);

  const [groupName, setGroupName] = useState("");

  /*
   - Calls Zustand store function to save the group in Firestore
   - Navigates back to the previous screen after saving
   - nico
  */
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      console.error("Group name is required");
      return;
    }
    try {
      await addGroup({
        name: groupName,
        memberIds: [],
        eventIds: [],
      });
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* White card container */}
      <View style={styles.card}>
        <Text style={styles.title}>Gruppe erstellen</Text>

        {/* Group Name Input */}
        <Text style={styles.label}>Gruppenname:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleCreateGroup}>
          <Text style={styles.saveText}>Speichern</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C313B",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 24,
    color: "white",
  },
  card: {
    width: "90%",
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    padding: 20,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
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
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});



