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
  Button,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
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

  const formatDate = (dateObj) => {
    if (!(dateObj instanceof Date)) return dateObj;
    return dateObj.toISOString().split("T")[0];
  };

  // Calculate total other expenses
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
      Alert.alert("Required Fields", "Please fill in date and amount.");
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

  // ----------------------
  // RENDER ITEM
  // ----------------------
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.cell}>Date: {item.date}</Text>
        <Text style={styles.cell}>
          Amount: Rs {item.amount.toFixed(2)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Button to open "Add Expense" modal */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="green" />
          <Text style={{ marginLeft: 8 }}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Show total expenses at the top */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total Expenses: Rs {totalExpenses.toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={otherExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {/* CREATE EXPENSE MODAL */}
      <Modal visible={addModalVisible} animationType="slide" transparent={false}>
        <ScrollView style={styles.modalScrollContainer}>
          <View style={styles.modalContainer}>
            <Text style={styles.heading}>Create Expense</Text>

            <Text>Date</Text>
            <TextInput
              style={styles.textInput}
              value={formatDate(newExpense.date)}
              editable={false}
            />
            <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
              <DateTimePicker
                value={newExpense.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewExpense((prev) => ({ ...prev, date: selectedDate }));
                  }
                }}
              />
            )}

            <Text>Amount</Text>
            <TextInput
              style={styles.textInput}
              value={newExpense.amount}
              onChangeText={(val) =>
                setNewExpense((prev) => ({ ...prev, amount: val }))
              }
              keyboardType="numeric"
              placeholder="e.g. 150.00"
            />

            <View style={styles.iconButtonRow}>
              <TouchableOpacity onPress={handleAddExpense} style={styles.iconButton}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={36}
                  color="green"
                />
                <Text>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.iconButton}
              >
                <Ionicons name="close-circle-outline" size={36} color="red" />
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* EDIT EXPENSE MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent={false}>
        <ScrollView style={styles.modalScrollContainer}>
          <View style={styles.modalContainer}>
            {editItem && (
              <>
                <Text style={styles.heading}>Edit Expense</Text>

                <Text>Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={
                    editItem.date instanceof Date
                      ? formatDate(editItem.date)
                      : editItem.date
                  }
                  editable={false}
                />
                <Button
                  title="Select Date"
                  onPress={() => setEditDatePicker(true)}
                />
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

                <Text>Amount</Text>
                <TextInput
                  style={styles.textInput}
                  value={editItem.amount}
                  onChangeText={(val) =>
                    setEditItem((prev) => ({ ...prev, amount: val }))
                  }
                  keyboardType="numeric"
                />

                <View style={styles.iconButtonRow}>
                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={36}
                      color="green"
                    />
                    <Text>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setEditModalVisible(false)}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={36}
                      color="red"
                    />
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButtonContainer: {
    alignItems: "flex-end",
    margin: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: "#f8f8f8",
    borderRadius: 6,
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
  },
  cell: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
  },
  modalScrollContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  iconButtonRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 20,
  },
});
