import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

// Benutzerdefinierte Textkomponente - die eine einheitliche Schriftart und Farbe setzt -gina
export default function CustomText(props: TextProps) {
  return <Text {...props} style={[styles.text, props.style]} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "SpaceMono",
  },
});
