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

// Create a Stack for all Liquor-related screens
const LiquorStack = createStackNavigator();

function LiquorStackScreen() {
  return (
    <LiquorStack.Navigator>
      {/* Main Liquor Categories screen */}
      <LiquorStack.Screen
        name="LiquorMain"
        component={LiquorScreen}
        options={{ title: "Liquor Categories" }}
      />

      {/* Screen for category details (with Empty In/Out, etc.) */}
      <LiquorStack.Screen
        name="CategoryDetails"
        component={CategoryDetailsScreen}
        options={{ title: "Category Details" }}
      />

      {/* Screen for Liquor Info (Name, ml, Dozen, Quantity) */}
      <LiquorStack.Screen
        name="LiquorInfo"
        component={LiquorInfoScreen}
        options={{ title: "Liquor Info" }}
      />

      {/* Screen for Stock & Sales calculations */}
      <LiquorStack.Screen
        name="StockAndSales"
        component={StockAndSalesScreen}
        options={{ title: "Stock & Sales" }}
      />
    </LiquorStack.Navigator>
  );
}

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            // This returns an Ionicon for each route
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
            component={PreviousRecordsScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}
