// screens/BankDepositScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons"; // Ensure @expo/vector-icons is installed

import { DataContext } from "../context/DataContext";

export default function BankDepositScreen() {
  const { bankDeposits, setBankDeposits } = useContext(DataContext);

  // For creating a new deposit
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newDeposit, setNewDeposit] = useState({
    date: new Date(),
    bank: "Bank of Ceylon",
    amount: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // For editing a deposit
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editDatePicker, setEditDatePicker] = useState(false);

  // Helper to format date as "YYYY-MM-DD"
  const formatDate = (dateObj) => {
    if (!(dateObj instanceof Date)) return dateObj;
    return dateObj.toISOString().split("T")[0];
  };

  // Calculate total deposit
  const totalDeposit = bankDeposits.reduce((sum, dep) => sum + dep.amount, 0);

  // ----------------------
  // ADD NEW DEPOSIT
  // ----------------------
  const openAddModal = () => {
    setNewDeposit({
      date: new Date(),
      bank: "Bank of Ceylon",
      amount: "",
    });
    setAddModalVisible(true);
  };

  const handleAddDeposit = () => {
    if (!newDeposit.date || !newDeposit.bank || newDeposit.amount.trim() === "") {
      Alert.alert("Required Fields", "Please fill in all fields before adding.");
      return;
    }

    const numericAmount = parseFloat(newDeposit.amount);
    if (isNaN(numericAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid numeric amount.");
      return;
    }

    const depositObj = {
      id: Date.now().toString(),
      date: formatDate(newDeposit.date),
      bank: newDeposit.bank,
      amount: numericAmount,
    };

    setBankDeposits((prev) => [...prev, depositObj]);

    Alert.alert("Deposit Added", "Your deposit has been added successfully!");
    setAddModalVisible(false);
  };

  // ----------------------
  // DELETE (with confirmation)
  // ----------------------
  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this deposit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setBankDeposits((prev) => prev.filter((item) => item.id !== id));
          Alert.alert("Deposit Deleted", "The deposit was deleted successfully!");
        },
      },
    ]);
  };

  // ----------------------
  // EDIT DEPOSIT
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

    setBankDeposits((prev) =>
      prev.map((item) => {
        if (item.id === editItem.id) {
          return {
            ...editItem,
            date:
              editItem.date instanceof Date
                ? formatDate(editItem.date)
                : editItem.date,
            amount: numericAmount,
          };
        }
        return item;
      })
    );

    Alert.alert("Deposit Updated", "The deposit was updated successfully!");
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
          <Ionicons name="business-outline" size={16} color="#555" /> Bank: {item.bank}
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
        <Ionicons name="wallet-outline" size={32} color="#4CAF50" />
        <Text style={styles.headerText}>Bank Deposits</Text>
      </View>

      {/* Add Deposit Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
          <Text style={styles.addButtonText}>Add Deposit</Text>
        </TouchableOpacity>
      </View>

      {/* Total Deposit */}
      <View style={styles.totalContainer}>
        <Ionicons name="cash-outline" size={20} color="#4CAF50" />
        <Text style={styles.totalText}>Total Deposit: Rs {totalDeposit.toFixed(2)}</Text>
      </View>

      {/* Deposits List */}
      {bankDeposits.length > 0 ? (
        <FlatList
          data={bankDeposits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No Deposits Found. Add a new deposit!</Text>
        </View>
      )}

      {/* CREATE DEPOSIT MODAL */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeading}>Create Deposit</Text>

              {/* Date Picker */}
              <Text style={styles.modalLabel}>
                <Ionicons name="calendar-outline" size={18} color="#555" /> Date
              </Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(newDeposit.date)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={newDeposit.date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewDeposit((prev) => ({
                        ...prev,
                        date: selectedDate,
                      }));
                    }
                  }}
                />
              )}

              {/* Bank Picker */}
              <Text style={styles.modalLabel}>
                <Ionicons name="business-outline" size={18} color="#555" /> Bank
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={newDeposit.bank}
                  onValueChange={(itemValue) =>
                    setNewDeposit((prev) => ({ ...prev, bank: itemValue }))
                  }
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="Bank of Ceylon" value="Bank of Ceylon" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {/* Bank Logo */}
              {newDeposit.bank === "Bank of Ceylon" && (
                <Image
                  source={require("../assets/boc_logo.png")} // Ensure the logo exists in the specified path
                  style={styles.bocLogo}
                />
              )}

              {/* Amount Input */}
              <Text style={styles.modalLabel}>
                <Ionicons name="cash-outline" size={18} color="#555" /> Amount (Rs)
              </Text>
              <TextInput
                style={styles.textInput}
                value={newDeposit.amount}
                onChangeText={(val) =>
                  setNewDeposit((prev) => ({ ...prev, amount: val }))
                }
                keyboardType="numeric"
                placeholder="e.g. 2500.00"
              />

              {/* Save and Cancel Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={handleAddDeposit}
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

      {/* EDIT DEPOSIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {editItem && (
                <>
                  <Text style={styles.modalHeading}>Edit Deposit</Text>

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

                  {/* Bank Picker */}
                  <Text style={styles.modalLabel}>
                    <Ionicons name="business-outline" size={18} color="#555" /> Bank
                  </Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={editItem.bank}
                      onValueChange={(itemValue) =>
                        setEditItem((prev) => ({ ...prev, bank: itemValue }))
                      }
                      mode="dropdown"
                      style={styles.picker}
                    >
                      <Picker.Item label="Bank of Ceylon" value="Bank of Ceylon" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </View>

                  {/* Bank Logo */}
                  {editItem.bank === "Bank of Ceylon" && (
                    <Image
                      source={require("../assets/boc_logo.png")} // Ensure the logo exists in the specified path
                      style={styles.bocLogo}
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
                    placeholder="e.g. 2500.00"
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
    justifyContent: "space-between",
    width: 60,
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
  bocLogo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 10,
    resizeMode: "contain",
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
