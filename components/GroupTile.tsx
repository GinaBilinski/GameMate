import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

/*
 Reusable component for displaying a group as a clickable tile
 - nico
*/
type GroupTileProps = {
  groupId: string;
  groupName: string;
  nextEventHost: string;
  nextEventDate: string;
};

const GroupTile: React.FC<GroupTileProps> = ({ groupId: id, groupName, nextEventHost, nextEventDate }) => {
    const navigation = useNavigation();
  
    return (
      <TouchableOpacity 
        style={styles.tile} 
        //onPress={() => navigation.navigate("GroupOverview", { groupId: id })}
      >
        <Text style={styles.name}>{groupName}</Text>
        <Text style={styles.host}>{nextEventHost}</Text>
        <Text style={styles.date}>{nextEventDate}</Text>
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    tile: {
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
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#1C313B",
    },
    host: {
      fontSize: 14,
      color: "#666",
      marginTop: 5,
    },
    date: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
      },
  });
  
  export default GroupTile;