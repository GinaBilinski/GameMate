import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/home";
import CreateGroupScreen from "../screens/CreateGroup";
import GroupOverviewScreen from "../screens/GroupOverview";
import GroupMembersScreen from "../screens/GroupMembers";
import ChatScreen from "../screens/Chat";
import PastEventsScreen from "../screens/PastEvents";
import CreateEventScreen from "../screens/CreateEvent";
import NextEventsScreen from "../screens/NextEvents";
import EventDetailsScreen from "../screens/EventDetails";

// Define navigation types
export type RootStackParamList = {
  Home: undefined;
  CreateGroup: undefined;
  GroupOverview: { groupId: string };
  GroupMembers: { groupId: string };
  Chat: { groupId: string };
  CreateEvent: { groupId: string };
  PastEvents: { groupId: string };
  NextEvents: { groupId: string }; 
  EventDetails: { 
    eventId: string; 
    groupId: string;
    date: string;
    time: string;
    host: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen name="GroupOverview" component={GroupOverviewScreen} />
        <Stack.Screen name="NextEvents" component={NextEventsScreen} />
        <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="PastEvents" component={PastEventsScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
