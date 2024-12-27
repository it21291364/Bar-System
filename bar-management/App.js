// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DataProvider } from "./context/DataContext";

import BankDepositScreen from "./screens/BankDepositScreen";
import LiquorScreen from "./screens/LiquorScreen";
import OtherExpensesScreen from "./screens/OtherExpensesScreen";
import TotalSummaryScreen from "./screens/TotalSummaryScreen";
import PreviousRecordsScreen from "./screens/PreviousRecordsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            // This function returns the icon component for each route
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              // You can name icons depending on the route
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
                  iconName = focused
                    ? "document-text"
                    : "document-text-outline";
                  break;
                case "Records":
                  iconName = focused ? "time" : "time-outline";
                  break;
                default:
                  iconName = "help-circle-outline";
              }

              // Return the Ionicons component
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            // Optionally configure active/inactive tint
            tabBarActiveTintColor: "tomato",
            tabBarInactiveTintColor: "gray",

            // If you want *no text labels*, set:
            // tabBarShowLabel: false,
          })}
        >
          <Tab.Screen name="Deposits" component={BankDepositScreen} />
          <Tab.Screen name="Liquors" component={LiquorScreen} />
          <Tab.Screen name="Expenses" component={OtherExpensesScreen} />
          <Tab.Screen name="Summary" component={TotalSummaryScreen} />
          <Tab.Screen name="Records" component={PreviousRecordsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}
