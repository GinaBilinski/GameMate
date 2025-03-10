import React from "react";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import CustomText from "../../components/CustomText";

export default function LogoutScreen() {
  const navigation = useNavigation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout(); // Logout aus dem Store aufrufen
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Menü-Button öffnet den Drawer
  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Ionicons name="menu" size={28} color="#C7E850" />
        </TouchableOpacity>
        <CustomText style={styles.title}>Logout</CustomText>
      </View>

      <View style={styles.card}>
        <CustomText style={styles.cardText}>
          Bist du dir sicher, dass du dich ausloggen möchtest?
        </CustomText>
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <CustomText style={styles.buttonText}>Ausloggen</CustomText>
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
    marginVertical: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardText: {
    fontSize: 18,
    color: "#1C313B", 
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#C7E85D",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: "#1C313B",
    fontSize: 16,
  },
});
