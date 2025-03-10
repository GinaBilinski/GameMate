import React from "react";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../components/CustomText";

export default function SettingsScreen() {
  const navigation = useNavigation();

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#C7E850" />
        </TouchableOpacity>
        <CustomText style={styles.title}>Einstellungen</CustomText>
      </View>

      <View style={styles.card}>
        <CustomText style={styles.cardTitle}>
          Hier kannst du deine Einstellungen ändern.
        </CustomText>
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
  menuButton: {
    position: "absolute",
    left: 15,
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
