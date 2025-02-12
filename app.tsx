// app.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import HomeScreen from "./screens/home";
import FirebaseTestScreen from "./screens/firebaseTest";

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

// SplashScreen solange anzeigen, bis Schriftart geladen wurde -gina
export default function App() {
  const [fontsLoaded] = useFonts({
    "SpaceMono": require("./assets/fonts/SpaceMono-Regular.ttf"),
  });
  
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync(); 
  }, [fontsLoaded]);
  
  if (!fontsLoaded) return null; 
  

  // Navigation der App mit Stack-Navigation -gina
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Firebase Test" component={FirebaseTestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
