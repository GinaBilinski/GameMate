import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";
import { useGroupStore } from "../stores/groupStore";
import { useState } from "react";

/*
 Reusable component for displaying a group member as a clickable tile
 - nico
*/
type MemberTileProps = {
  userId: string;
  userName: string;
  groupId: string; // Group ID required for removal
};

const MemberTile: React.FC<MemberTileProps> = ({ userId, userName, groupId }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [showRemove, setShowRemove] = useState(false);
  let pressTimer: NodeJS.Timeout;

  // Handle long press start
  const handleLongPress = () => {
    pressTimer = setTimeout(() => {
      setShowRemove(true);
    }, 3000); // Show button after 3 seconds
  };

  // Handle press release (cancels long press)
  const handlePressOut = () => {
    clearTimeout(pressTimer);
  };

  // Remove member from group
  const handleRemoveMember = async () => {
    await useGroupStore.getState().removeMember(userId, groupId);
    setShowRemove(false); // Hide button after removal
  };

  return (
    <TouchableOpacity 
      style={styles.tile} 
      onLongPress={handleLongPress} 
      onPressOut={handlePressOut}
    >
      <Text style={styles.name}>{userName}</Text>

      {showRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={handleRemoveMember}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: "95%",
    alignSelf: "center",
    backgroundColor: "white",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C313B",
  },
  removeButton: {
    backgroundColor: "#FF5733",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default MemberTile;
