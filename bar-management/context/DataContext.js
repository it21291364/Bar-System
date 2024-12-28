// context/DataContext.js

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [bankDeposits, setBankDeposits] = useState([]);
  const [liquorItems, setLiquorItems] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);

  // New states for salary and locker
  const [salary, setSalary] = useState(0);
  const [locker, setLocker] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [bankDeposits, liquorItems, otherExpenses, previousRecords, salary, locker]);

  const loadData = async () => {
    try {
      const storedBank = await AsyncStorage.getItem('@bank_deposits');
      const storedLiquor = await AsyncStorage.getItem('@liquor_items');
      const storedExpenses = await AsyncStorage.getItem('@other_expenses');
      const storedPrev = await AsyncStorage.getItem('@previous_records');
      const storedSalary = await AsyncStorage.getItem('@salary');
      const storedLocker = await AsyncStorage.getItem('@locker');

      if (storedBank) setBankDeposits(JSON.parse(storedBank));
      if (storedLiquor) setLiquorItems(JSON.parse(storedLiquor));
      if (storedExpenses) setOtherExpenses(JSON.parse(storedExpenses));
      if (storedPrev) setPreviousRecords(JSON.parse(storedPrev));
      if (storedSalary) setSalary(JSON.parse(storedSalary));
      if (storedLocker) setLocker(JSON.parse(storedLocker));
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
      await AsyncStorage.setItem('@salary', JSON.stringify(salary));
      await AsyncStorage.setItem('@locker', JSON.stringify(locker));
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }
  };

  // Clears data at the end of the week, including salary, locker, emptyIn, and emptyOut
  const clearWeek = () => {
    // 1) Sanitize salary and locker to ensure they are numbers
    const sanitizedSalary = parseFloat(salary) || 0;
    const sanitizedLocker = parseFloat(locker) || 0;

    // 2) Save current snapshot in previousRecords
    const newRecord = {
      id: Date.now().toString(),
      bankDeposits,
      liquorItems,
      otherExpenses,
      salary: sanitizedSalary,
      locker: sanitizedLocker,
      dateCleared: new Date().toISOString(),
    };
    setPreviousRecords((prev) => [...prev, newRecord]);

    // 3) Clear bankDeposits & otherExpenses arrays
    setBankDeposits([]);
    setOtherExpenses([]);

    // 4) Reset salary and locker
    setSalary(0);
    setLocker(0);

    // 5) For each liquor category & subLiquors, transfer inStock to purchasingStockTotal and reset inStock
    const updatedLiquors = liquorItems.map((cat) => {
      const updatedSubs = cat.subLiquors.map((sub) => {
        const dozen = parseFloat(sub.dozen) || 1; // Avoid division by zero
        const newQuantity = sub.inStock / dozen;

        return {
          ...sub,
          quantityFields: [newQuantity], // Set purchasingStockTotal to previous inStock
          inStock: 0, // Reset inStock
          sale: 0, // Reset sale
        };
      });

      return {
        ...cat,
        subLiquors: updatedSubs,
        // Reset category-level emptyIn and emptyOut if applicable
        emptyIn: 0,
        emptyOut: 0,
      };
    });

    setLiquorItems(updatedLiquors);
  };

  return (
    <DataContext.Provider
      value={{
        bankDeposits, setBankDeposits,
        liquorItems, setLiquorItems,
        otherExpenses, setOtherExpenses,
        previousRecords, setPreviousRecords,
        clearWeek,
        salary, setSalary,
        locker, setLocker,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
