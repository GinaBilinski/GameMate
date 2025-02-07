import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"), // Schrift laden
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Erst ausblenden, wenn Schrift geladen ist
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Falls Schrift nicht geladen ist, bleibt Splash Screen
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
