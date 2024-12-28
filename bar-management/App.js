// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "@expo/vector-icons/Ionicons";

import { DataProvider } from "./context/DataContext";

// Import your existing screens
import BankDepositScreen from "./screens/BankDepositScreen";
import OtherExpensesScreen from "./screens/OtherExpensesScreen";
import TotalSummaryScreen from "./screens/TotalSummaryScreen";
import PreviousRecordsScreen from "./screens/PreviousRecordsScreen";

// Import the Liquor screens
import LiquorScreen from "./screens/LiquorScreen";
import CategoryDetailsScreen from "./screens/CategoryDetailsScreen";
import LiquorInfoScreen from "./screens/LiquorInfoScreen";
import StockAndSalesScreen from "./screens/StockAndSalesScreen";

import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Create a Stack for all Liquor-related screens
const LiquorStack = createStackNavigator();

function LiquorStackScreen() {
  return (
    <LiquorStack.Navigator>
      <LiquorStack.Screen
        name="LiquorMain"
        component={LiquorScreen}
        options={{ title: "Liquor Categories" }}
      />
      <LiquorStack.Screen
        name="CategoryDetails"
        component={CategoryDetailsScreen}
        options={{ title: "Category Details" }}
      />
      <LiquorStack.Screen
        name="LiquorInfo"
        component={LiquorInfoScreen}
        options={{ title: "Liquor Info" }}
      />
      <LiquorStack.Screen
        name="StockAndSales"
        component={StockAndSalesScreen}
        options={{ title: "Stock & Sales" }}
      />
    </LiquorStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <DataProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                switch (route.name) {
                  case "Deposits":
                    iconName = focused ? "cash" : "cash-outline";
                    break;
                  case "Liquors":
                    iconName = focused ? "beer" : "beer-outline";
                    break;
                  case "Expenses":
                    iconName = focused ? "reader" : "reader-outline";
                    break;
                  case "Summary":
                    iconName = focused ? "document-text" : "document-text-outline";
                    break;
                  case "Records":
                    iconName = focused ? "time" : "time-outline";
                    break;
                  default:
                    iconName = "help-circle-outline";
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: "tomato",
              tabBarInactiveTintColor: "gray",
            })}
          >
            <Tab.Screen
              name="Deposits"
              component={BankDepositScreen}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="Liquors"
              component={LiquorStackScreen}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="Expenses"
              component={OtherExpensesScreen}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="Summary"
              component={TotalSummaryScreen}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="Records"
              options={{ headerShown: true, title: "Previous Records" }}
            >
              {(props) => (
                <PreviousRecordsScreen {...props} handleLogout={handleLogout} />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Profile"
              options={{
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "person" : "person-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            >
              {(props) => <ProfileScreen {...props} handleLogout={handleLogout} />}
            </Tab.Screen>
          </Tab.Navigator>
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </NavigationContainer>
    </DataProvider>
  );
}
