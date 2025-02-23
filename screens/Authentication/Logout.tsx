import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../stores/authStore";

export default function LogoutScreen() {
    const navigation = useNavigation();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        try {
            await logout(); // Call logout from the store
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Logout</Text>
      </View> 

        <View style={styles.innerContainer}>
            <Text style={styles.text}>Are you sure you want to logout?</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.button}>
                <Text style={styles.buttonText}>Logout</Text>
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
      backButton: {
        position: "absolute",
        left: 15,
      },
      backText: {
        fontSize: 24,
        color: "white",
      },
      title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
      },
    innerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
        color: "white",
    },
    button: {
        backgroundColor: "#FF5733",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
});
