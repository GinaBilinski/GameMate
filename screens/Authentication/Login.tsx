import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/Navigation";

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
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={[styles.input, { fontSize: styles.placeholderText.fontSize, color: "black" }]}
        placeholder="E-Mail"
        placeholderTextColor={styles.placeholderText.color}
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />

      <TextInput
        style={[styles.input, { fontSize: styles.placeholderText.fontSize, color: "black" }]}
        placeholder="Passwort"
        placeholderTextColor={styles.placeholderText.color}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={() => login(email, password)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Registrierungs Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.register}>Don't have an account yet? Click here.</Text>
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
    fontSize: 16,
    color: "#A9A9A9",
  },
  button: {
    backgroundColor: "#C7E85D",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
  register: {
    color: "white",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
