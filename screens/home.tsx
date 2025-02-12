// screens/home.tsx
import React from "react";
import { View, Button, StyleSheet } from "react-native";
import CustomText from "../components/CustomText";
import styles from "../constants/styles"; 

/*
Startseite - gina
*/
export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <CustomText style={localStyles.text}>GameMate</CustomText>
      <Button title="Firebase Test öffnen" onPress={() => navigation.navigate("Firebase Test")} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});