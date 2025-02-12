import { View, FlatList, StyleSheet, Text } from "react-native";
import { useGroupStore } from "../stores/groupStore";
import GroupTile from "../components/GroupTile";
import { useEffect, useState } from "react";

/*
 Displays all groups in a list with clickable tiles
 - nico
*/
export default function HomeScreen() {

    const [groups, setGroups] = useState([
        {
          id: "1",
          name: "Board Game Night",
        },
        {
          id: "2",
          name: "Weekend Strategy Club",
        },
    ]);
/*
  const groups = useGroupStore((state) => state.groups);
  const loadGroups = useGroupStore((state) => state.loadGroups);

  useEffect(() => {
    loadGroups();
  }, []);
*/

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Groups</Text>
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
  header: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});

