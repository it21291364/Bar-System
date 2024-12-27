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
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";

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

  // Format Date as "YYYY-MM-DD"
  const formatDate = (dateObj) => {
    if (!(dateObj instanceof Date)) return dateObj;
    return dateObj.toISOString().split("T")[0];
  };

  // ----------------------
  // ADD NEW DEPOSIT (MODAL)
  // ----------------------
  const openAddModal = () => {
    // Reset fields each time we open the modal
    setNewDeposit({
      date: new Date(),
      bank: "Bank of Ceylon",
      amount: "",
    });
    setAddModalVisible(true);
  };

  const handleAddDeposit = () => {
    // Required fields check
    if (!newDeposit.date || !newDeposit.bank || newDeposit.amount.trim() === "") {
      Alert.alert("Required Fields", "Please fill in all fields before adding.");
      return;
    }

    // Parse amount to a number
    const numericAmount = parseFloat(newDeposit.amount);
    if (isNaN(numericAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid numeric amount.");
      return;
    }

    const depositObj = {
      id: Date.now().toString(),
      date: formatDate(newDeposit.date),
      bank: newDeposit.bank,
      // store as number internally
      amount: numericAmount,
    };

    // Add to context
    setBankDeposits((prev) => [...prev, depositObj]);

    Alert.alert("Deposit Added", "Your deposit has been added successfully!");
    setAddModalVisible(false);
  };

  // ----------------------
  // DELETE (with confirmation)
  // ----------------------
  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this deposit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setBankDeposits((prev) => prev.filter((item) => item.id !== id));
            Alert.alert("Deposit Deleted", "The deposit was deleted successfully!");
          },
        },
      ]
    );
  };

  // ----------------------
  // EDIT DEPOSIT
  // ----------------------
  const openEditModal = (item) => {
    // Convert numeric amount to string for input
    setEditItem({
      ...item,
      amount: String(item.amount),
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    // Parse the edited amount
    const numericAmount = parseFloat(editItem.amount);
    if (isNaN(numericAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid numeric amount.");
      return;
    }

    // Update deposit
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

  // ----------------------
  // RENDER LIST ROW
  // ----------------------
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        {/* Show amount with two decimals, e.g. Rs 250.00 */}
        <Text style={styles.cell}>Date: {item.date}</Text>
        <Text style={styles.cell}>Bank: {item.bank}</Text>
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

  // ----------------------
  // MAIN RENDER
  // ----------------------
  return (
    <View style={styles.container}>
      {/* Button to open "Add Deposit" modal */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="green" />
          <Text style={{ marginLeft: 8 }}>Add Deposit</Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF DEPOSITS */}
      <FlatList
        data={bankDeposits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {/* CREATE DEPOSIT MODAL */}
      <Modal visible={addModalVisible} animationType="slide" transparent={false}>
        <ScrollView style={styles.modalScrollContainer}>
          <View style={styles.modalContainer}>
            <Text style={styles.heading}>Create Deposit</Text>

            <Text>Date</Text>
            <TextInput
              style={styles.textInput}
              value={formatDate(newDeposit.date)}
              editable={false}
            />
            <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
              <DateTimePicker
                value={newDeposit.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewDeposit((prev) => ({ ...prev, date: selectedDate }));
                  }
                }}
              />
            )}

            <Text>Bank</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={newDeposit.bank}
                onValueChange={(itemValue) =>
                  setNewDeposit((prev) => ({ ...prev, bank: itemValue }))
                }
              >
                <Picker.Item label="Bank of Ceylon" value="Bank of Ceylon" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            {newDeposit.bank === "Bank of Ceylon" && (
              <Image
                source={require("../assets/boc_logo.png")}
                style={styles.bocLogo}
              />
            )}

            <Text>Amount</Text>
            {/* Store user input as a string so multiple digits can be typed */}
            <TextInput
              style={styles.textInput}
              value={newDeposit.amount}
              onChangeText={(val) =>
                setNewDeposit((prev) => ({ ...prev, amount: val }))
              }
              keyboardType="numeric"
              placeholder="e.g. 250.00"
            />

            <View style={styles.iconButtonRow}>
              <TouchableOpacity
                onPress={handleAddDeposit}
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

      {/* EDIT DEPOSIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent={false}>
        <ScrollView style={styles.modalScrollContainer}>
          <View style={styles.modalContainer}>
            {editItem && (
              <>
                <Text style={styles.heading}>Edit Deposit</Text>

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

                <Text>Bank</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={editItem.bank}
                    onValueChange={(itemValue) =>
                      setEditItem((prev) => ({ ...prev, bank: itemValue }))
                    }
                  >
                    <Picker.Item
                      label="Bank of Ceylon"
                      value="Bank of Ceylon"
                    />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>

                {editItem.bank === "Bank of Ceylon" && (
                  <Image
                    source={require("../assets/boc_logo.png")}
                    style={styles.bocLogo}
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
                    <Ionicons name="close-circle-outline" size={36} color="red" />
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
  },
  bocLogo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginVertical: 8,
    resizeMode: "contain",
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
