// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DataProvider } from './context/DataContext';

import BankDepositScreen from './screens/BankDepositScreen';
import LiquorScreen from './screens/LiquorScreen';
import OtherExpensesScreen from './screens/OtherExpensesScreen';
import TotalSummaryScreen from './screens/TotalSummaryScreen';
import PreviousRecordsScreen from './screens/PreviousRecordsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="BankDeposit" component={BankDepositScreen} />
          <Tab.Screen name="Liquor" component={LiquorScreen} />
          <Tab.Screen name="OtherExpenses" component={OtherExpensesScreen} />
          <Tab.Screen name="TotalSummary" component={TotalSummaryScreen} />
          <Tab.Screen name="PreviousRecords" component={PreviousRecordsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}
