import { View, FlatList, StyleSheet, Text, Button, TouchableOpacity, Image } from "react-native";
import { useEffect } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useGroupStore } from "../stores/groupStore";
import GroupTile from "../components/GroupTile";

import { RootStackParamList } from "../navigation/Navigation";

/*
 Displays all groups in a list with a custom header
 - nico
*/
export default function HomeScreen({ navigation }: { navigation: any }) {
  const groups = useGroupStore((state) => state.groups);
  const loadGroups = useGroupStore((state) => state.loadGroups);

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with Create Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Gruppenübersicht</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CreateGroup")}>
          <Image source={require("../assets/images/plus.png")} style={styles.iconImage} />
        </TouchableOpacity>
      </View>
      {/* Group List. eventHost and eventDate are currently dummies */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <GroupTile 
            groupId={item.id ?? Math.random().toString()} 
            groupName={item.name} 
            nextEventHost="bei Gina" 
            nextEventDate="10.04.2025" 
          />
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C313B",
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginTop: 25,
  },
  headerText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});