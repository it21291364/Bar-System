// screens/PreviousRecordsScreen.js

import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DataContext } from "../context/DataContext";

export default function PreviousRecordsScreen() {
  const { previousRecords, setPreviousRecords } = useContext(DataContext);

  // Handle deletion of a single record
  const handleDeleteRecord = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPreviousRecords((prev) =>
              prev.filter((record) => record.id !== id)
            );
            Alert.alert("Deleted", "Record has been deleted.");
          },
        },
      ]
    );
  };

  // Render each record item
  const renderRecord = ({ item }) => {
    // Compute totals for the record
    const totalDeposit = Array.isArray(item.bankDeposits)
      ? item.bankDeposits.reduce((sum, dep) => sum + dep.amount, 0)
      : 0;
    const totalExpenses = Array.isArray(item.otherExpenses)
      ? item.otherExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      : 0;

    // Compute total sale and empty stock
    let totalSale = 0;
    let totalEmptyStock = 0;

    if (Array.isArray(item.liquorItems)) {
      item.liquorItems.forEach((cat) => {
        if (Array.isArray(cat.subLiquors)) {
          cat.subLiquors.forEach((sub) => {
            const dozen = parseFloat(sub.dozen) || 0;
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
            const soldItems = purchasingStockTotal - inStock;

            // Ensure soldItems is not negative
            const validSoldItems = soldItems > 0 ? soldItems : 0;

            // Calculate sale: soldItems * sellingPrice
            const sale = validSoldItems * sellingPrice;

            // Add to totalSale
            totalSale += sale;
          });
        }

        // Compute empty stock
        const emptyIn = parseFloat(cat.emptyIn) || 0;
        const emptyOut = parseFloat(cat.emptyOut) || 0;
        totalEmptyStock += emptyIn * 100 + emptyOut * 100; // Assuming units as per your logic
      });
    }

    // Handle missing salary and locker
    const salary = typeof item.salary === "number" ? item.salary : 0;
    const locker = typeof item.locker === "number" ? item.locker : 0;

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordDate}>
            Cleared on: {new Date(item.dateCleared).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteRecord(item.id)}
            style={styles.deleteIcon}
            accessibilityLabel="Delete Record"
            accessibilityHint="Deletes this weekly record"
          >
            <Ionicons name="trash-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.recordDetails}>
          <Text style={styles.detailText}>
            <Ionicons name="cash-outline" size={16} color="#333" /> Total Deposit: Rs{" "}
            {totalDeposit.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            <Ionicons name="cash-outline" size={16} color="#333" /> Total Expenses: Rs{" "}
            {totalExpenses.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            <Ionicons name="pricetag-outline" size={16} color="#333" /> Total Sale: Rs{" "}
            {totalSale.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            <Ionicons name="archive-outline" size={16} color="#333" /> Empty Stock Total: Rs{" "}
            {totalEmptyStock.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            <Ionicons name="person-outline" size={16} color="#333" /> Salary: Rs{" "}
            {salary.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            <Ionicons name="lock-closed-outline" size={16} color="#333" /> Locker: Rs{" "}
            {locker.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Previous Weekly Records</Text>

      {previousRecords.length > 0 ? (
        <FlatList
          data={previousRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderRecord}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>
            No Previous Records Found. Clear a week to create a record.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  deleteIcon: {
    padding: 4,
  },
  recordDetails: {
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#aaa",
    marginTop: 10,
    textAlign: "center",
  },
});
