import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";
import { useEffect, useState } from "react";
import { useGroupStore } from "../stores/groupStore";
import { useUserStore } from "../stores/userStore";
import MemberTile from "../components/MemberTile";
import CustomText from "../components/CustomText";

/*
  Screen for displaying group members
  - gina
*/
export default function MemberOverviewScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // Fetch member IDs
        const memberIds = await useGroupStore.getState().getGroupMembers(groupId);
        
        // Fetch user details for each member
        const memberDetails = await Promise.all(
          memberIds.map(async (id) => {
            const user = await useUserStore.getState().getUser(id);
            return user ? { id, name: user.name } : null;
          })
        );

        // Filter out any null values
        setMembers(memberDetails.filter((member) => member !== null) as { id: string; name: string }[]);
      } catch (error) {
        console.error("MemberOverviewScreen => Error fetching members:", error);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [groupId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <CustomText style={styles.title}>Gruppenmitglieder</CustomText>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      ) : members.length > 0 ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemberTile userId={item.id} userName={item.name} groupId={groupId} />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>Keine Gruppenmitglieder</CustomText>
        </View>
      )}
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
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});
