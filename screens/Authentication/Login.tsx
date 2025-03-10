import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/Navigation";
import CustomText from "../../components/CustomText";

/*
 Login-Screen für die App
 - nico
*/
export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Einloggen</CustomText>

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
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={() => login(email, password)}>
        <CustomText style={styles.buttonText}>Login</CustomText>
      </TouchableOpacity>

      {/* Registrierungs Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <CustomText style={styles.register}>
          Neu bei GameMate? 
        </CustomText>
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
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  placeholderText: {
    fontSize: 18,
    color: "#A9A9A9",
  },
  button: {
    backgroundColor: "#C7E85D",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontFamily: "SpaceMono",
    fontSize: 18,
  },
  register: {
    color: "white",
    marginTop: 10,
    textDecorationLine: "underline",
    fontFamily: "SpaceMono",
  },
});
