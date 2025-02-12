import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

/*
 Reusable row component for dropdown fields
 - nico
*/
type RowLayoutDropDownProps = {
  label: string;
  value: string;
  onChange: (itemValue: string) => void;
  options: { label: string; value: string }[];
};

const RowLayout_DropDown: React.FC<RowLayoutDropDownProps> = ({ label, value, onChange, options }) => {
  return (
    <View style={styles.rowContainer}>
      <Text style={styles.label}>{label}</Text>
      <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
        {options.map((option, index) => (
          <Picker.Item key={index} label={option.label} value={option.value} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: "#1C313B",
    fontWeight: "bold",
  },
  picker: {
    width: "60%",
  },
});

export default RowLayout_DropDown;
