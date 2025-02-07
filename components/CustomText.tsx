import { Text, TextProps } from "react-native";

export default function CustomText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: "SpaceMono" }]} />;
}
