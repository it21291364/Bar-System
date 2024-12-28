// screens/PreviousRecordsScreen.js

import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DataContext } from "../context/DataContext";

export default function PreviousRecordsScreen() {
  const { previousRecords, setPreviousRecords } = useContext(DataContext);

  const [expandedRecords, setExpandedRecords] = useState({});
  const [searchDate, setSearchDate] = useState("");

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

  const toggleExpand = (id) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredRecords = useMemo(() => {
    if (!searchDate.trim()) {
      return previousRecords;
    }
    const search = new Date(searchDate);
    if (isNaN(search)) {
      return [];
    }
    const searchString = search.toISOString().split("T")[0];
    return previousRecords.filter((record) => {
      const recordDate = new Date(record.dateCleared)
        .toISOString()
        .split("T")[0];
      return recordDate.includes(searchString);
    });
  }, [searchDate, previousRecords]);

  const renderRecord = ({ item }) => {
    let totalDeposit = 0;
    let totalExpenses = 0;
    let totalSale = 0;
    let totalEmptyStock = 0;

    if (Array.isArray(item.bankDeposits)) {
      totalDeposit = item.bankDeposits.reduce(
        (sum, dep) => sum + dep.amount,
        0
      );
    }

    if (Array.isArray(item.otherExpenses)) {
      totalExpenses = item.otherExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
    }

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

            const purchasingStockTotal = quantityFields.reduce(
              (acc, qty) => acc + dozen * qty,
              0
            );

            const soldItems = Math.max(purchasingStockTotal - inStock, 0);
            const sale = soldItems * sellingPrice;
            const inStockBalance = inStock * sellingPrice;

            totalSale += sale;
            sub.purchasingStockTotal = purchasingStockTotal;
            sub.soldItems = soldItems;
            sub.sale = sale;
            sub.inStockBalance = inStockBalance;
          });
        }

        const emptyIn = parseFloat(cat.emptyIn) || 0;
        const emptyOut = parseFloat(cat.emptyOut) || 0;
        cat.calculatedEmptyIn = emptyIn * 100;
        cat.calculatedEmptyOut = emptyOut * 100;
        totalEmptyStock += cat.calculatedEmptyIn + cat.calculatedEmptyOut;
      });
    }

    const salary = typeof item.salary === "number" ? item.salary : 0;
    const locker = typeof item.locker === "number" ? item.locker : 0;

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeaderContainer}>
          <TouchableOpacity
            style={styles.recordHeader}
            onPress={() => toggleExpand(item.id)}
            accessibilityLabel={`Toggle details for record cleared on ${new Date(
              item.dateCleared
            ).toLocaleDateString()}`}
            accessibilityHint="Expands or collapses the record details"
          >
            <Text style={styles.recordDate}>
              Cleared on: {new Date(item.dateCleared).toLocaleDateString()}
            </Text>
            <Ionicons
              name={expandedRecords[item.id] ? "chevron-up" : "chevron-down"}
              size={24}
              color="#4CAF50"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteRecord(item.id)}
            accessibilityLabel="Delete Record"
            accessibilityHint="Deletes the entire record"
          >
            <Ionicons name="trash-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        {expandedRecords[item.id] && (
          <View style={styles.recordDetails}>
            {/* Summary Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                <Ionicons
                  name="stats-chart-outline"
                  size={18}
                  color="#4CAF50"
                />{" "}
                Summary
              </Text>
              <Text style={styles.detailText}>
                <Ionicons name="cash-outline" size={16} color="#333" /> Total
                Deposit: Rs {totalDeposit.toFixed(2)}
              </Text>
              <Text style={styles.detailText}>
                <Ionicons name="cash-outline" size={16} color="#333" /> Total
                Expenses: Rs {totalExpenses.toFixed(2)}
              </Text>
              <Text style={styles.detailText}>
                <Ionicons name="pricetag-outline" size={16} color="#333" />{" "}
                Total Sale: Rs {totalSale.toFixed(2)}
              </Text>
              <Text style={styles.detailText}>
                <Ionicons name="archive-outline" size={16} color="#333" /> Empty
                Stock Total: Rs {totalEmptyStock.toFixed(2)}
              </Text>
              <Text style={styles.detailText}>
                <Ionicons name="person-outline" size={16} color="#333" />{" "}
                Salary: Rs {salary.toFixed(2)}
              </Text>
              <Text style={styles.detailText}>
                <Ionicons name="lock-closed-outline" size={16} color="#333" />{" "}
                Locker: Rs {locker.toFixed(2)}
              </Text>
            </View>

            {/* Deposits Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                <Ionicons
                  name="arrow-down-circle-outline"
                  size={18}
                  color="#4CAF50"
                />{" "}
                Deposits
              </Text>
              {item.bankDeposits && item.bankDeposits.length > 0 ? (
                item.bankDeposits.map((dep) => (
                  <View key={dep.id} style={styles.subItem}>
                    <Ionicons
                      name="ellipse-outline"
                      size={12}
                      color="#4CAF50"
                    />
                    <View>
                      <Text style={styles.subItemText}>
                        {new Date(dep.date).toLocaleDateString()}: Rs{" "}
                        {dep.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No deposits recorded.</Text>
              )}
            </View>

            {/* Expenses Section */}
            <View style={styles.section}>
  <Text style={styles.sectionHeader}>
    <Ionicons name="arrow-up-circle-outline" size={18} color="#F44336" /> Expenses
  </Text>
  {item.otherExpenses && item.otherExpenses.length > 0 ? (
    item.otherExpenses.map((exp) => (
      <View key={exp.id} style={styles.subItemRow}>
        <Ionicons name="ellipse-outline" size={12} color="#F44336" style={styles.icon} />
        <Text style={styles.subItemRowText}>
          {new Date(exp.date).toLocaleDateString()} - Rs {exp.amount.toFixed(2)}
          {exp.reason && ` - Reason: ${exp.reason}`}
        </Text>
      </View>
    ))
  ) : (
    <Text style={styles.noDataText}>No expenses recorded.</Text>
  )}
</View>


            {/* Liquors Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                <Ionicons name="beer-outline" size={18} color="#4CAF50" />{" "}
                Liquors
              </Text>
              {item.liquorItems && item.liquorItems.length > 0 ? (
                item.liquorItems.map((cat) => (
                  <View key={cat.id} style={styles.subSection}>
                    <Text style={styles.categoryName}>
                      <Ionicons name="wine-outline" size={16} color="#4CAF50" />{" "}
                      {cat.name}
                    </Text>
                    <Text style={styles.detailText}>
                      <Ionicons
                        name="information-circle-outline"
                        size={14}
                        color="#555"
                      />{" "}
                      Empty Calculated In: Rs {cat.calculatedEmptyIn.toFixed(2)}
                    </Text>
                    <Text style={styles.detailText}>
                      <Ionicons
                        name="information-circle-outline"
                        size={14}
                        color="#555"
                      />{" "}
                      Empty Calculated Out: Rs{" "}
                      {cat.calculatedEmptyOut.toFixed(2)}
                    </Text>
                    {cat.subLiquors && cat.subLiquors.length > 0 ? (
                      cat.subLiquors.map((sub) => (
                        <View key={sub.id} style={styles.liquorItem}>
                          <Text style={styles.detailText}>
                            <Ionicons
                              name="information-circle-outline"
                              size={14}
                              color="#555"
                            />{" "}
                            {sub.name} - {sub.ml}ml
                          </Text>
                          <Text style={styles.detailText}>
                            Sold: {sub.soldItems} units, Sale: Rs{" "}
                            {sub.sale.toFixed(2)}, In Stock: {sub.inStock} units
                          </Text>
                          <Text style={styles.detailText}>
                            <Ionicons
                              name="cash-outline"
                              size={14}
                              color="#555"
                            />{" "}
                            Purchase Stock Total: {sub.purchasingStockTotal}{" "}
                            units
                          </Text>
                          <Text style={styles.detailText}>
                            <Ionicons
                              name="cash-outline"
                              size={14}
                              color="#555"
                            />{" "}
                            InStock Balance: Rs {sub.inStockBalance.toFixed(2)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>
                        No liquors recorded.
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No liquors recorded.</Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Previous Weekly Records</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#555" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Date (YYYY-MM-DD)"
          value={searchDate}
          onChangeText={setSearchDate}
          keyboardType="numeric"
          accessibilityLabel="Search Records"
          accessibilityHint="Enter a date to filter records"
        />
      </View>

      {filteredRecords.length > 0 ? (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderRecord}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>
            No Records Found for the entered date.
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
    backgroundColor: "#f0f4f7", // Soft background color
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
  },
  recordHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordDate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  deleteButton: {
    padding: 4,
    marginLeft: 10,
  },
  recordDetails: {
    marginTop: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
  subSection: {
    marginLeft: 10,
    marginBottom: 10,
    backgroundColor: "#eef6f8",
    padding: 10,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  liquorItem: {
    marginLeft: 10,
    marginBottom: 10,
    backgroundColor: "#e6f7ff",
    padding: 10,
    borderRadius: 8,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  subItemText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#555",
  },
  noDataText: {
    fontSize: 16,
    color: "#aaa",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    color: "#aaa",
    marginTop: 10,
    textAlign: "center",
  },
  subItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  subItemRowText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#555",
    flexShrink: 1, // Allows text to wrap if it exceeds available space
  },
  icon: {
    marginRight: 8, // Adds spacing between the icon and text
  },
  
});
