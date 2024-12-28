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

    // 2) Compute necessary fields for previousRecords
    const computedLiquorItems = liquorItems.map((cat) => {
      const computedSubLiquors = cat.subLiquors.map((sub) => {
        const dozen = parseFloat(sub.dozen) || 1; // Avoid division by zero
        const purchasingStockTotal = (sub.quantityFields || []).reduce(
          (acc, qty) => acc + (dozen * qty),
          0
        );
        const soldItems = purchasingStockTotal - (parseFloat(sub.inStock) || 0);
        const validSoldItems = soldItems > 0 ? soldItems : 0;
        const sale = validSoldItems * (parseFloat(sub.sellingPrice) || 0);
        const inStockBalance = (parseFloat(sub.inStock) || 0) * (parseFloat(sub.sellingPrice) || 0);

        return {
          ...sub,
          purchasingStockTotal,
          soldItems,
          sale,
          inStockBalance,
        };
      });

      return {
        ...cat,
        subLiquors: computedSubLiquors,
      };
    });

    // 3) Create a deep copy with computed fields for previousRecords
    const newRecord = {
      id: Date.now().toString(),
      bankDeposits: JSON.parse(JSON.stringify(bankDeposits)),
      liquorItems: JSON.parse(JSON.stringify(computedLiquorItems)),
      otherExpenses: JSON.parse(JSON.stringify(otherExpenses)),
      salary: sanitizedSalary,
      locker: sanitizedLocker,
      dateCleared: new Date().toISOString(),
    };

    // 4) Prepend the new record to have newest records at the top
    setPreviousRecords((prev) => [newRecord, ...prev]);

    // 5) Clear bankDeposits & otherExpenses arrays
    setBankDeposits([]);
    setOtherExpenses([]);

    // 6) Reset salary and locker
    setSalary(0);
    setLocker(0);

    // 7) Reset liquorItems: transfer inStock to purchasingStockTotal and reset inStock
    const updatedLiquors = liquorItems.map((cat) => {
      const updatedSubs = cat.subLiquors.map((sub) => {
        const dozen = parseFloat(sub.dozen) || 1; // Avoid division by zero
        const newQuantity = (parseFloat(sub.inStock) || 0) / dozen;

        return {
          ...sub,
          quantityFields: [newQuantity], // Set purchasingStockTotal to previous inStock
          inStock: 0, // Reset inStock
          sale: 0, // Reset sale
          inStockBalance: 0, // Reset inStockBalance
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
