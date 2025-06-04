// App.js
// Import Screens
import Home from "./Screen/Home/Home";
import Login from "./Screen/Registration/Login/Login";
import ForgotPassword from "./Screen/Registration/ForgotPassword";
import ResetPassword from "./Screen/Registration/ResetPassword";
import Intro1 from "./Screen/Intro/IntroScreen1";
import Intro2 from "./Screen/Intro/IntroScreen2";
import Intro3 from "./Screen/Intro/IntroScreen3";
import { StyleSheet, Text, View, StatusBar, Platform, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import SignUp from "./Screen/Registration/SignUp/SignUp";
import Payment from "./Screen/Book/Payment";
import Book from "./Screen/Book/Book";
import ServiceDetails from "./Screen/Home/ServiceDetails";
import WorkshopDetails from "./Screen/Home/WorkshopDetails";
import Profile from "./Screen/Profile/MainProfile/Profile";
import Garage from "./Screen/Profile/Garage/Garage";
import ChangePassword from "./Screen/Profile/ChangePassword";
import Service from "./Screen/Profile/Service/Service";
import AddService from "./Screen/Profile/Service/AddService";
import AddCar from "./Screen/Profile/Garage/AddCar";
import EditProfile from "./Screen/Profile/EditProfile/EditProfile";
import Language from "./Screen/Profile/Language/Language";
import WorkingHours from "./Screen/Profile/WorkingHours/WorkingHours";
import Certifications from "./Screen/Profile/Certifications/Certifications";
import History from "./Screen/Profile/History/History";
import ChatBot from "./Screen/Home/chatbot";
import Cart from "./Screen/Home/cart";
import DateTimePickerScreen from "./Screen/Book/DateChose";
import AvailableMechanic from "./Screen/Book/AvailableMechanic";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import SplitBookingPage from "./Screen/Book/SplitBookingPage";
import MyBookingsScreen from "./Screen/MyBookingsScreen";
import WorkshopSpecializations from "./Screen/Profile/specialization/specialization";
import MechanicHomeScreen from "./Screen/WorkshopHome/MechanicHomeScreen";
import NotificationsScreen from "./Screen/NotificationsScreen";
import OffersScreen from "./Screen/OffersScreen";
import PindingRequests from "./Screen/WorkshopHome/PindingRequests";
import Subcategory from "./Screen/Home/Subcategory";
import CompanyLegal from "./Screen/Profile/CompanyLegal";
import Appointments from "./Screen/WorkshopHome/Appointments";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function IntroNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Intro1">
        {(props) => <Intro1 {...props} activeDotIndex={1} />}
      </Stack.Screen>
      <Stack.Screen name="Intro2">
        {(props) => <Intro2 {...props} activeDotIndex={2} />}
      </Stack.Screen>
      <Stack.Screen name="Intro3">
        {(props) => <Intro3 {...props} activeDotIndex={3} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function BottomTabs({ route }) {
  const { role } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#086189",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "MyBookings":
              iconName = focused ? "clipboard" : "clipboard-outline";
              break;
            case "ProfileNavigator":
              iconName = focused ? "person" : "person-outline";
              break;
            case "My Shop":
              iconName = focused ? "construct" : "construct-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        children={({ navigation }) => (
          <Home navigation={navigation} route={{ params: { role } }} />
        )}
      />
      {role === "Mechanic" && (
        <Tab.Screen
          name="My Shop"
          children={({ navigation }) => (
            <MechanicHomeScreen
              navigation={navigation}
              route={{ params: { role } }}
            />
          )}
        />
      )}
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: "My Bookings",
        }}
      />

      
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          title: "Offers",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "pricetag" : "pricetag-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileNavigator"
        component={ProfileNavigator}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

// ⬇️ Registration Screens
function RegNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="SignUp" component={SignUp} />
      {/* 
     
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
      
       />
      <Stack.Screen name="ProfilePicture" component={ProfilePicture} /> */}
    </Stack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Garage" component={Garage} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ title: "ChangePassword" }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen name="AddCar" component={AddCar} />
      <Stack.Screen
        name="Service"
        component={Service}
        options={{ title: "Services" }}
      />
      <Stack.Screen
        name="AddService"
        component={AddService}
        options={{ title: "Add Service" }}
      />
      <Stack.Screen
        name="Language"
        component={Language}
        options={{ title: "Language" }}
      />
      <Stack.Screen
        name="WorkingHours"
        component={WorkingHours}
        options={{ title: "Working Hours" }}
      />
      <Stack.Screen name="CertificationScreen" component={Certifications} />
      <Stack.Screen name="HistoryScreen" component={History} />
      <Stack.Screen
        name="WorkshopSpecializations"
        component={WorkshopSpecializations}
      />
      <Stack.Screen
        name="CompanyLegal"
        component={CompanyLegal}
        options={{ title: "Company & Legal" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ActionSheetProvider>
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="IntroNavigator"
              component={IntroNavigator}
              options={{ headerShown: false, title: "WorkShop Details" }}
            />
            <Stack.Screen name="RegNavigator" component={RegNavigator} />
            <Stack.Screen
              name="MainTabs"
              component={BottomTabs}
              options={{ title: "Back" }}
            />
            <Stack.Screen
              name="Service"
              component={Service}
              options={{ 
                headerShown: true, 
                title: "Services",
                headerBackTitle: "Back"
              }}
            />
             <Stack.Screen
        name="AddService"
        component={AddService}
        options={{  headerShown: true, title: "Add Service" }}
      />
            <Stack.Screen
              name="Appointments"
              component={Appointments}
              options={{ headerShown: true, title: "Appointments" }}
            />
            <Stack.Screen
              name="Subcategory"
              component={Subcategory}
              options={{ headerShown: true, title: " Category Services" }}
            />
            <Stack.Screen
              name="Book"
              component={Book}
              options={{ headerShown: true, title: "Booking Summary" }}
            />
            <Stack.Screen
              name="Payment"
              component={Payment}
              options={{ headerShown: true, title: "Payment" }}
            />
            <Stack.Screen
              name="ServiceDetails"
              component={ServiceDetails}
              options={{ headerShown: true, title: "Service Details" }}
            />
            <Stack.Screen
              name="WorkshopDetails"
              component={WorkshopDetails}
              options={{ headerShown: true, title: "WorkShop Details" }}
            />
            <Stack.Screen
              name="ChatBot"
              component={ChatBot}
              options={{ headerShown: true, title: "Chat Bot" }}
            />
            <Stack.Screen
              name="Cart"
              component={Cart}
              options={{ headerShown: true, title: "Cart" }}
            />
            <Stack.Screen
              name="DateTimePickerScreen"
              component={DateTimePickerScreen}
              options={{ headerShown: true, title: "Pick a date" }}
            />
            <Stack.Screen
              name="AvailableMechanic"
              component={AvailableMechanic}
              options={{ headerShown: true, title: "Available Mechanics" }}
            />
            <Stack.Screen
              name="SplitBookingPage"
              component={SplitBookingPage}
              options={{ headerShown: true, title: "Confirm Booking" }}
            />
            <Stack.Screen
              name="PindingRequests"
              component={PindingRequests}
              options={{ headerShown: true, title: "Requests" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
