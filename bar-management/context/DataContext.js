// context/DataContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [bankDeposits, setBankDeposits] = useState([]);
  const [liquorItems, setLiquorItems] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [bankDeposits, liquorItems, otherExpenses, previousRecords]);

  const loadData = async () => {
    try {
      const storedBank = await AsyncStorage.getItem('@bank_deposits');
      const storedLiquor = await AsyncStorage.getItem('@liquor_items');
      const storedExpenses = await AsyncStorage.getItem('@other_expenses');
      const storedPrev = await AsyncStorage.getItem('@previous_records');

      if (storedBank) setBankDeposits(JSON.parse(storedBank));
      if (storedLiquor) setLiquorItems(JSON.parse(storedLiquor));
      if (storedExpenses) setOtherExpenses(JSON.parse(storedExpenses));
      if (storedPrev) setPreviousRecords(JSON.parse(storedPrev));
    } catch (error) {
      console.error('Error loading data from AsyncStorage:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@bank_deposits', JSON.stringify(bankDeposits));
      await AsyncStorage.setItem('@liquor_items', JSON.stringify(liquorItems));
      await AsyncStorage.setItem('@other_expenses', JSON.stringify(otherExpenses));
      await AsyncStorage.setItem('@previous_records', JSON.stringify(previousRecords));
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }
  };

  // Example: a function to clear data, then store a snapshot in previousRecords
  const clearData = () => {
    const newRecord = {
      id: Date.now().toString(),
      bankDeposits,
      liquorItems,
      otherExpenses,
      dateCleared: new Date().toISOString()
    };
    setPreviousRecords((prev) => [...prev, newRecord]);
    setBankDeposits([]);
    setLiquorItems([]);
    setOtherExpenses([]);
  };

  return (
    <DataContext.Provider
      value={{
        bankDeposits, setBankDeposits,
        liquorItems, setLiquorItems,
        otherExpenses, setOtherExpenses,
        previousRecords, setPreviousRecords,
        clearData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
