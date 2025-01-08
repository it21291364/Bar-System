// screens/TotalSummaryScreen.js

import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { DataContext } from "../context/DataContext";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TotalSummaryScreen() {
  const {
    bankDeposits,
    otherExpenses,
    liquorItems,
    clearWeek,
    salary,
    setSalary,
    locker,
    setLocker,
  } = useContext(DataContext);

  // 1) Compute total deposit
  const totalDeposit = bankDeposits.reduce((sum, d) => sum + d.amount, 0);

  // 2) Compute total extra expenses
  const totalExpenses = otherExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 3) Compute total sale
  let totalSale = 0;
  // 4) Compute total selling profit
  let totalSellingProfit = 0;

  liquorItems.forEach((cat) => {
    cat.subLiquors.forEach((sub) => {
      const dozen = parseFloat(sub.dozen) || 0;
      const buyingPrice = parseFloat(sub.buyingPrice) || 0;
      const sellingPrice = parseFloat(sub.sellingPrice) || 0;
      const inStock = parseFloat(sub.inStock) || 0;
      const quantityFields = Array.isArray(sub.quantityFields)
        ? sub.quantityFields
        : [];

      // Calculate purchasing stock total: sum of (dozen * quantityFields)
      const purchasingStockTotal = quantityFields.reduce(
        (acc, qty) => acc + dozen * qty,
        0
      );

      // Calculate sold items: purchasingStockTotal - inStock
      const soldItems = Math.max(purchasingStockTotal - inStock, 0);

      // For totalSale
      const sale = soldItems * sellingPrice;
      totalSale += sale;

      // For total selling profit
      const subProfit = soldItems * (sellingPrice - buyingPrice);
      totalSellingProfit += subProfit;
    });
  });

  // 5) Compute empty stock total
  let totalEmptyStock = 0;
  liquorItems.forEach((cat) => {
    const emptyIn = parseFloat(cat.emptyIn) || 0;
    const emptyOut = parseFloat(cat.emptyOut) || 0;
    totalEmptyStock += (emptyIn + emptyOut) * 100;
  });

  // 6) Convert user’s salary + locker to numbers
  const salaryNum = parseFloat(salary) || 0;
  const lockerNum = parseFloat(locker) || 0;

  // 7) Final Profit = (Total Selling Profit + Empty Stock) - Salary - Extra Expenses - Locker
  const finalProfit =
    totalSellingProfit + totalEmptyStock - salaryNum - totalExpenses - lockerNum;

  // 8) Handle saving salary and locker
  const handleSave = () => {
    Alert.alert("Saved", "Salary and Locker values have been saved.");
  };

  // 9) Handle clearing the week
  const handleClearWeek = () => {
    Alert.alert(
      "Clear This Week",
      "Are you sure you want to clear data for a new week?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearWeek();
            Alert.alert("Cleared", "Week data has been cleared and saved!");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.heading}>Total Summary</Text>

      {/* Summary Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="pie-chart-outline" size={24} color="#4CAF50" />
          <Text style={styles.cardHeaderText}>Weekly Overview</Text>
        </View>

        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerText]}>Metric</Text>
          <Text style={[styles.tableCell, styles.headerText]}>Amount (Rs)</Text>
        </View>

        {/* Table Body */}
        <View style={styles.tableBody}>
          {/* Total Sale */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Sale</Text>
            <Text style={styles.tableCell}>{totalSale.toFixed(2)}</Text>
          </View>

          {/* Total Deposit */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Deposit</Text>
            <Text style={styles.tableCell}>{totalDeposit.toFixed(2)}</Text>
          </View>

          {/* Total Extra Expenses */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Extra Expenses</Text>
            <Text style={styles.tableCell}>{totalExpenses.toFixed(2)}</Text>
          </View>

          {/* Empty Stock Total */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Empty Stock Total</Text>
            <Text style={styles.tableCell}>{totalEmptyStock.toFixed(2)}</Text>
          </View>

          {/* Total Selling Profit */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              Total Selling Profit
            </Text>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              {totalSellingProfit.toFixed(2)}
            </Text>
          </View>

          {/* Salary */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Salary</Text>
            <Text style={styles.tableCell}>{salaryNum.toFixed(2)}</Text>
          </View>

          {/* Locker */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Locker</Text>
            <Text style={styles.tableCell}>{lockerNum.toFixed(2)}</Text>
          </View>

          {/* Final Profit */}
          <View style={[styles.tableRow, styles.finalRow]}>
            <Text style={[styles.tableCell, styles.finalCellText]}>
              Final Profit
            </Text>
            <Text style={[styles.tableCell, styles.finalCellText]}>
              {finalProfit.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Salary & Locker Inputs Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet-outline" size={24} color="#4CAF50" />
          <Text style={styles.cardHeaderText}>Salary & Locker</Text>
        </View>
        <View style={styles.inputsContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Salary</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1000"
              keyboardType="numeric"
              value={salary.toString()}
              onChangeText={(text) => setSalary(text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Locker</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={locker.toString()}
              onChangeText={(text) => setLocker(text)}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Single Action Button (Clear Week) */}
      <View style={styles.singleActionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#F44336" }]}
          onPress={handleClearWeek}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Clear This Week</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf4fb",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f8e9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#4CAF50",
  },
  tableBody: {},
  headerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  finalRow: {
    backgroundColor: "#c8e6c9",
  },
  finalCellText: {
    fontWeight: "bold",
    color: "#2E7D32",
  },
  inputsContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 6,
    color: "#555",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  saveButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 6,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "bold",
  },
  singleActionContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 6,
    width: "60%",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
  },
});
