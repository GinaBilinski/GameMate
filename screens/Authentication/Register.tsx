import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { RootStackParamList } from "../../navigation/Navigation";
import CustomText from "../../components/CustomText";

/*
  Register screen - Allows users to create an account
  - nico
*/
export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const register = useAuthStore((state) => state.register);
  const addUser = useUserStore((state) => state.addUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      console.error("Displayname, Email and password are required!");
      return;
    }
    try {
      await register(email, password, name);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Konto erstellen</CustomText>

      <TextInput 
        style={[styles.input, { fontFamily: "SpaceMono" }]}
        placeholder="Name" 
        placeholderTextColor={styles.placeholderText.color}
        value={name} 
        onChangeText={setName} 
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, { fontFamily: "SpaceMono" }]}
        placeholder="E-Mail"
        placeholderTextColor={styles.placeholderText.color}
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />

      <TextInput 
        style={[styles.input, { fontFamily: "SpaceMono" }]}
        placeholder="Passwort"
        placeholderTextColor={styles.placeholderText.color} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <CustomText style={styles.buttonText}>Registrieren</CustomText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <CustomText style={styles.login}>Hast du schon ein Account?</CustomText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C313B",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 18,
    color: "#A9A9A9",
  },
  button: {
    backgroundColor: "#C7E85D",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMono",
    color: "black",
  },
  login: {
    color: "white",
    marginTop: 10,
    textDecorationLine: "underline",
    fontFamily: "SpaceMono",
  },
});
