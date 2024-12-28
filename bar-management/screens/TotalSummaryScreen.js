// screens/TotalSummaryScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { DataContext } from "../context/DataContext";
import Ionicons from "@expo/vector-icons/Ionicons"; // Ensure you have @expo/vector-icons installed

export default function TotalSummaryScreen() {
  const {
    bankDeposits,
    otherExpenses,
    liquorItems,
    clearWeek, // from context
    salary,
    setSalary,
    locker,
    setLocker,
  } = useContext(DataContext);

  // Compute total deposit
  const totalDeposit = bankDeposits.reduce((sum, d) => sum + d.amount, 0);

  // Compute total extra expenses
  const totalExpenses = otherExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Compute total sale from Liquor Items
  let totalSale = 0;
  liquorItems.forEach((cat) => {
    cat.subLiquors.forEach((sub) => {
      const dozen = parseFloat(sub.dozen) || 0;
      const sellingPrice = parseFloat(sub.sellingPrice) || 0;
      const inStock = parseFloat(sub.inStock) || 0;
      const quantityFields = sub.quantityFields || [];

      // Calculate purchasing stock total: sum of (dozen * quantityFields)
      const purchasingStockTotal = quantityFields.reduce(
        (acc, qty) => acc + dozen * qty,
        0
      );

      // Calculate sold items: purchasingStockTotal - inStock
      const soldItems = purchasingStockTotal - inStock;

      // Ensure soldItems is not negative
      const validSoldItems = soldItems > 0 ? soldItems : 0;

      // Calculate sale: soldItems * sellingPrice
      const sale = validSoldItems * sellingPrice;

      // Add to totalSale
      totalSale += sale;
    });
  });

  // Compute empty stock total (sum of (emptyIn * 100) + (emptyOut * 100) across all categories)
  let totalEmptyStock = 0;
  liquorItems.forEach((cat) => {
    const emptyIn = parseFloat(cat.emptyIn) || 0;
    const emptyOut = parseFloat(cat.emptyOut) || 0;
    const calculatedIn = emptyIn * 100;
    const calculatedOut = emptyOut * 100;
    totalEmptyStock += calculatedIn + calculatedOut;
  });

  // Convert user’s salary + locker to numbers
  const salaryNum = parseFloat(salary) || 0;
  const lockerNum = parseFloat(locker) || 0;

  // Handle saving salary and locker
  const handleSave = () => {
    // Validation can be added here if needed
    Alert.alert("Saved", "Salary and Locker values have been saved.");
    // Since salary and locker are managed via context, changes are already persisted
  };

  // Handle printing (placeholder)
  const handlePrint = () => {
    Alert.alert("Print", "PDF generation placeholder!");
    // Integrate a printing library like react-native-print or react-native-html-to-pdf here.
  };

  // Handle clearing the week
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
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Total Summary</Text>

      {/* Summary Table */}
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerText]}>Metric</Text>
          <Text style={[styles.tableCell, styles.headerText]}>Amount (Rs)</Text>
        </View>

        {/* Table Rows */}
        <View style={styles.tableBody}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Sale</Text>
            <Text style={styles.tableCell}>{totalSale.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Deposit</Text>
            <Text style={styles.tableCell}>{totalDeposit.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total Extra Expenses</Text>
            <Text style={styles.tableCell}>{totalExpenses.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Empty Stock Total</Text>
            <Text style={styles.tableCell}>{totalEmptyStock.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Salary</Text>
            <Text style={styles.tableCell}>{salaryNum.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Locker</Text>
            <Text style={styles.tableCell}>{lockerNum.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Inputs for Salary & Locker */}
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

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Print Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>

        {/* Clear Week Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearWeek}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Clear This Week</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
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
  headerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    marginBottom: 6,
    color: "#555",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 6,
    justifyContent: "center",
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9800",
    padding: 14,
    borderRadius: 6,
    flex: 0.48,
    justifyContent: "center",
  },
  clearButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "bold",
  },
});
