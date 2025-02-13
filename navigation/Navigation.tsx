import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/Home";
import CreateGroupScreen from "../screens/CreateGroup";
import GroupOverviewScreen from "@/screens/GroupOverview";


// Define navigation types
export type RootStackParamList = {
  Home: undefined;
  CreateGroup: undefined;
  GroupOverview: { groupId: string };
};


const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen name="GroupOverview" component={GroupOverviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
