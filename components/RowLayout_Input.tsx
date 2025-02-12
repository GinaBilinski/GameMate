import { View, Text, TextInput, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker"; // npm install @react-native-picker/picker


/*
 Reusable row component that supports both input and dropdown fields
 - nico
*/
type RowProps = {
    label: string;
    type?: "input" | "dropdown"; // Determines whether it's an input or a dropdown
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    options?: { label: string; value: string }[]; // For dropdowns
  };

const RowLayout: React.FC<RowProps> = ({ label, type = "input", placeholder, options = [], value, onChange }) => {
  return (
    <View style={styles.rowContainer}>
      <Text style={styles.label}>{label}</Text>

      {type === "input" ? (
        <TextInput style={styles.input} placeholder={placeholder} value={value} onChangeText={onChange} />
      ) : (
        <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
          {options.map((option, index) => (
            <Picker.Item key={index} label={option.label} value={option.value} />
          ))}
        </Picker>
      )}
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
  input: {
    width: "60%",
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  picker: {
    width: "60%",
  },
});

export default RowLayout;
