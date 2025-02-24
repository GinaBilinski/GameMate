import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../stores/authStore";

// Screens
import HomeScreen from "../screens/Home";
import CreateGroupScreen from "../screens/CreateGroup";
import GroupOverviewScreen from "../screens/GroupOverview";
import GroupMembersScreen from "../screens/MemberOverview";
import ChatScreen from "../screens/Chat";
import PastEventsScreen from "../screens/PastEvents";
import CreateEventScreen from "../screens/CreateEvent";
import NextEventsScreen from "../screens/NextEvents";
import EventDetailsScreen from "../screens/EventDetails";
import SettingsScreen from "../screens/Settings";
import LoginScreen from "../screens/Authentication/Login";
import RegisterScreen from "../screens/Authentication/Register";
import LogoutScreen from "@/screens/Authentication/Logout";


// --- RootStackParamList (NEU: Definiert alle möglichen Routen + Parameter) ---
export type RootStackParamList = {
  Main: undefined;
  CreateGroup: undefined;
  GroupOverview: { groupId: string };
  GroupMembers: { groupId: string };
  Chat: { groupId: string };
  CreateEvent: { groupId: string };
  PastEvents: undefined;
  NextEvents: { groupId: string };
  EventDetails: { 
    eventId: string;
    groupId: string;
    date: string;
    time: string;
    host: string;
  };
  Login: undefined;
  Register: undefined;
};

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// --- Drawer Navigation ---
function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, 
        drawerActiveTintColor: "white",
        drawerInactiveTintColor: "#ccc",
        drawerStyle: { backgroundColor: "#1C313B" },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Logout" 
        component={LogoutScreen} 
        options={{
          drawerIcon: ({ color }) => <Ionicons name="log-in-outline" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}


// Check if user is logged in. Elsewise show login screen - nico
export default function Navigation() {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainDrawer} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="GroupOverview" component={GroupOverviewScreen} />
            <Stack.Screen name="NextEvents" component={NextEventsScreen} />
            <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
            <Stack.Screen name="PastEvents" component={PastEventsScreen} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
