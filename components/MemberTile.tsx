import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigation";

/*
 Reusable component for displaying a group as a clickable tile
 - nico
*/
type MemberTileProps = {
  userId: string;
  userName: string;
};

const MemberTile: React.FC<MemberTileProps> = ({ userId: id, userName }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <TouchableOpacity 
          style={styles.tile} 
          //onPress={() => navigation.navigate("UserOverview", { userId: id })}
        >
          <Text style={styles.name}>{userName}</Text>
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
        },
        name: {
          fontSize: 18,
          fontWeight: "bold",
          color: "#1C313B",
        },
      });
      
      export default MemberTile;    