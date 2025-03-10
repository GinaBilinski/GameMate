import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";
import { useEventStore } from "../stores/eventStore";
import { useGroupStore } from "../stores/groupStore";
import { AntDesign } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomText from "../components/CustomText";

export default function CreateEventScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const { addEvent } = useEventStore();
  const group = useGroupStore((state) => state.groups.find((g) => g.id === groupId));

  const [host, setHost] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [games, setGames] = useState<string[]>([]);
  const [food, setFood] = useState<string[]>([]);
  const [newGame, setNewGame] = useState("");
  const [newFood, setNewFood] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

  // DateTimePicker States
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchMemberNames = async () => {
      if (!group?.memberIds) return;
      const memberData = [];
      for (const memberId of group.memberIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", memberId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            memberData.push({ id: memberId, name: userData.name });
          }
        } catch (error) {
          console.error("Fehler beim Laden des Benutzers:", error);
        }
      }
      setMembers(memberData);
    };
    fetchMemberNames();
  }, [group]);

  /*
    Gastgeber Rotation: überprüft, welche Gruppenmitglieder bereits als Gastgeber fungiert haben.
    Falls alle Mitglieder einmal Gastgeber waren, wird die Rotation zurückgesetzt 
    (das Array usedHosts wird geleert).
  */
  const currentUsedHosts = group?.usedHosts || [];
  const availableMembers = members.filter(
    (member) => !currentUsedHosts.includes(member.id)
  );
  const membersForDropdown = availableMembers.length > 0 ? availableMembers : members;

  const handleSaveEvent = async () => {
    if (!host) return;
    const eventData = { host, date, time, games, food, groupId, completed: false };
    await addEvent(eventData);

    // Erstelle die neue usedHosts-Liste
    let newUsedHosts = [...(group?.usedHosts || []), host];
    if (newUsedHosts.length === members.length) {
      newUsedHosts = [];
    }
    // Update usedHosts in Firestore und im groupStore
    await useGroupStore.getState().updateUsedHosts(groupId, newUsedHosts);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}
  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
  <Text style={styles.backText}>←</Text>
</TouchableOpacity>

        <CustomText style={styles.title}>Event Planen</CustomText>
      </View>

      <View style={styles.card}>
        {/* Gastgeber Dropdown */}
        <CustomText style={styles.label}>Gastgeber:</CustomText>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <CustomText style={host ? styles.dropdownText : styles.placeholderText}>
            {host
              ? members.find((m) => m.id === host)?.name || "Gastgeber auswählen"
              : "Gastgeber auswählen"}
          </CustomText>
          <AntDesign name={showDropdown ? "up" : "down"} size={18} color="black" />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownListContainer}>
            <View style={styles.dropdownList}>
              {membersForDropdown.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setHost(member.id);
                    setShowDropdown(false);
                  }}
                >
                  <CustomText>{member.name}</CustomText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Datumsauswahl */}
        <CustomText style={styles.label}>Datum:</CustomText>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setDatePickerVisibility(true)}
        >
          <CustomText style={date ? styles.dropdownText : styles.placeholderText}>
            {date || "Datum auswählen"}
          </CustomText>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          display="inline"
          themeVariant="light"
          onConfirm={(selectedDate) => {
            setDate(selectedDate.toLocaleDateString());
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        {/* Uhrzeitauswahl */}
        <CustomText style={styles.label}>Uhrzeit:</CustomText>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setTimePickerVisibility(true)}
        >
          <CustomText style={time ? styles.dropdownText : styles.placeholderText}>
            {time || "Uhrzeit auswählen"}
          </CustomText>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          themeVariant="light"
          is24Hour
          onConfirm={(selectedTime: Date) => {
            setTime(
              selectedTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            );
            setTimePickerVisibility(false);
          }}
          onCancel={() => setTimePickerVisibility(false)}
        />

        {/* Spiele hinzufügen */}
        <CustomText style={styles.label}>Spiele:</CustomText>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.inputFlex, { fontFamily: "SpaceMono", fontSize: styles.placeholderText.fontSize }]}
            placeholder="Spiel hinzufügen"
            placeholderTextColor={styles.placeholderText.color}
            value={newGame}
            onChangeText={setNewGame}
          />
          <TouchableOpacity
            onPress={() => {
              if (newGame) {
                setGames([...games, newGame]);
                setNewGame("");
              }
            }}
            style={styles.addButton}
          >
            <AntDesign name="plus" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={games}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listRow}>
              <CustomText style={styles.listItem}>{item}</CustomText>
              <TouchableOpacity onPress={() => setGames(games.filter((_, i) => i !== index))}>
                <AntDesign name="closecircle" size={16} color="#1C313B" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Essen hinzufügen */}
        <CustomText style={styles.label}>Essen:</CustomText>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.inputFlex, { fontFamily: "SpaceMono", fontSize: styles.placeholderText.fontSize }]}
            placeholder="Essen hinzufügen"
            placeholderTextColor={styles.placeholderText.color}
            value={newFood}
            onChangeText={setNewFood}
          />
          <TouchableOpacity
            onPress={() => {
              if (newFood) {
                setFood([...food, newFood]);
                setNewFood("");
              }
            }}
            style={styles.addButton}
          >
            <AntDesign name="plus" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={food}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listRow}>
              <CustomText style={styles.listItem}>{item}</CustomText>
              <TouchableOpacity onPress={() => setFood(food.filter((_, i) => i !== index))}>
                <AntDesign name="closecircle" size={16} color="#1C313B" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Event speichern */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
          <CustomText style={styles.saveText}>Event speichern</CustomText>
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
    position: "relative",
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
  },
  inputFlex: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "SpaceMono",
  },
  placeholderText: {
    fontSize: 16,
    color: "#A9A9A9",
    fontFamily: "SpaceMono",
  },
  dropdownListContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  dropdownList: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 10,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#C7E85D",
    borderRadius: 5,
    padding: 9,
    marginLeft: 10,
    marginBottom: 5,
    // Schatten für den Button
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
    marginVertical: 3,
    paddingHorizontal: 10,
  },
  listItem: {
    fontSize: 16,
    fontFamily: "SpaceMono",
  },
  saveButton: {
    backgroundColor: "#C7E85D",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    // Schatten für den Save-Button
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
