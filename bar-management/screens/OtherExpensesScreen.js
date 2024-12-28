// screens/OtherExpensesScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

import { DataContext } from "../context/DataContext";

export default function OtherExpensesScreen() {
  const { otherExpenses, setOtherExpenses } = useContext(DataContext);

  // For creating a new expense
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date(),
    amount: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // For editing an expense
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editDatePicker, setEditDatePicker] = useState(false);

  // Helper to format date as "YYYY-MM-DD"
  const formatDate = (dateObj) => {
    if (!(dateObj instanceof Date)) return dateObj;
    return dateObj.toISOString().split("T")[0];
  };

  // Calculate total expenses
  const totalExpenses = otherExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // ----------------------
  // ADD NEW EXPENSE
  // ----------------------
  const openAddModal = () => {
    setNewExpense({ date: new Date(), amount: "" });
    setAddModalVisible(true);
  };

  const handleAddExpense = () => {
    if (!newExpense.date || newExpense.amount.trim() === "") {
      Alert.alert("Required Fields", "Please fill in all fields before adding.");
      return;
    }

    const numericAmount = parseFloat(newExpense.amount);
    if (isNaN(numericAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid numeric amount.");
      return;
    }

    const expenseObj = {
      id: Date.now().toString(),
      date: formatDate(newExpense.date),
      amount: numericAmount,
    };
    setOtherExpenses((prev) => [...prev, expenseObj]);
    Alert.alert("Expense Added", "Your expense has been added successfully!");
    setAddModalVisible(false);
  };

  // ----------------------
  // DELETE (with confirmation)
  // ----------------------
  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this expense?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setOtherExpenses((prev) => prev.filter((item) => item.id !== id));
          Alert.alert("Expense Deleted", "The expense was deleted successfully!");
        },
      },
    ]);
  };

  // ----------------------
  // EDIT EXPENSE
  // ----------------------
  const openEditModal = (item) => {
    setEditItem({ ...item, amount: String(item.amount) });
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    const numericAmount = parseFloat(editItem.amount);
    if (isNaN(numericAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid numeric amount.");
      return;
    }

    setOtherExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id === editItem.id) {
          return {
            ...editItem,
            date:
              editItem.date instanceof Date
                ? formatDate(editItem.date)
                : editItem.date,
            amount: numericAmount,
          };
        }
        return exp;
      })
    );

    Alert.alert("Expense Updated", "The expense was updated successfully!");
    setEditModalVisible(false);
  };

  // RENDER LIST ROW
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.cell}>
          <Ionicons name="calendar-outline" size={16} color="#555" /> Date: {item.date}
        </Text>
        <Text style={styles.cell}>
          <Ionicons name="cash-outline" size={16} color="#555" /> Amount: Rs {item.amount.toFixed(2)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionIcon}>
          <Ionicons name="create-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionIcon}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // MAIN RENDER
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="cash-outline" size={32} color="#4CAF50" />
        <Text style={styles.headerText}>Other Expenses</Text>
      </View>

      {/* Add Expense Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Total Expenses */}
      <View style={styles.totalContainer}>
        <Ionicons name="cash-outline" size={20} color="#4CAF50" />
        <Text style={styles.totalText}>Total Expenses: Rs {totalExpenses.toFixed(2)}</Text>
      </View>

      {/* Expenses List */}
      {otherExpenses.length > 0 ? (
        <FlatList
          data={otherExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cash-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No Expenses Found. Add a new expense!</Text>
        </View>
      )}

      {/* CREATE EXPENSE MODAL */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeading}>Create Expense</Text>

              {/* Date Picker */}
              <Text style={styles.modalLabel}>
                <Ionicons name="calendar-outline" size={18} color="#555" /> Date
              </Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(newExpense.date)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={newExpense.date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewExpense((prev) => ({
                        ...prev,
                        date: selectedDate,
                      }));
                    }
                  }}
                />
              )}

              {/* Amount Input */}
              <Text style={styles.modalLabel}>
                <Ionicons name="cash-outline" size={18} color="#555" /> Amount (Rs)
              </Text>
              <TextInput
                style={styles.textInput}
                value={newExpense.amount}
                onChangeText={(val) =>
                  setNewExpense((prev) => ({ ...prev, amount: val }))
                }
                keyboardType="numeric"
                placeholder="e.g. 1500.00"
              />

              {/* Save and Cancel Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={handleAddExpense}
                  style={[styles.modalButton, styles.saveButton]}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAddModalVisible(false)}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* EDIT EXPENSE MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {editItem && (
                <>
                  <Text style={styles.modalHeading}>Edit Expense</Text>

                  {/* Date Picker */}
                  <Text style={styles.modalLabel}>
                    <Ionicons name="calendar-outline" size={18} color="#555" /> Date
                  </Text>
                  <TouchableOpacity
                    style={styles.datePicker}
                    onPress={() => setEditDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {editItem.date instanceof Date
                        ? formatDate(editItem.date)
                        : editItem.date}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  {editDatePicker && (
                    <DateTimePicker
                      value={
                        editItem.date instanceof Date
                          ? editItem.date
                          : new Date(editItem.date)
                      }
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setEditDatePicker(false);
                        if (selectedDate) {
                          setEditItem((prev) => ({
                            ...prev,
                            date: selectedDate,
                          }));
                        }
                      }}
                    />
                  )}

                  {/* Amount Input */}
                  <Text style={styles.modalLabel}>
                    <Ionicons name="cash-outline" size={18} color="#555" /> Amount (Rs)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editItem.amount}
                    onChangeText={(val) =>
                      setEditItem((prev) => ({ ...prev, amount: val }))
                    }
                    keyboardType="numeric"
                    placeholder="e.g. 1500.00"
                  />

                  {/* Save and Cancel Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={handleSaveEdit}
                      style={[styles.modalButton, styles.saveButton]}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text style={styles.modalButtonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setEditModalVisible(false)}
                      style={[styles.modalButton, styles.cancelButton]}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="#fff" />
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#4CAF50",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  addButtonContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  addButtonText: {
    marginLeft: 6,
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
    color: "#2E7D32",
  },
  row: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f1f8e9",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rowContent: {
    flex: 1,
  },
  cell: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
  },
  actionIcon: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#aaa",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalContent: {
    flex: 1,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#4CAF50",
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
    fontWeight: "600",
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  dateText: {
    fontSize: 16,
    color: "#555",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 6,
    width: "40%",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
});
