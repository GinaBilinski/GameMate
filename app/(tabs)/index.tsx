import { View, StyleSheet } from "react-native";
import CustomText from "../../components/CustomText"; // Neue Schrift-Komponente

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <CustomText style={styles.text}>GameMate</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C313B",
  },
  text: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});
