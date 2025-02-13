import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useGroupStore } from "../stores/groupStore";

/*
 useRoute() gets the groupId passed from navigation.navigate("GroupOverview", { groupId })
 useGroupStore() accesses the Zustand store (groupStore.ts) to get the group parameter
 - nico
*/
export default function GroupOverviewScreen() {
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };
  const group = useGroupStore((state) => state.groups.find((g) => g.id === groupId));

  if (!group) {
    return <Text style={styles.error}>Group not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.info}>Members: {group.memberIds.length}</Text>
      <Text style={styles.info}>Events: {group.eventIds.length}</Text>
    </View>
  );
}

// UI needs to be refactored

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C313B",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#666",
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

