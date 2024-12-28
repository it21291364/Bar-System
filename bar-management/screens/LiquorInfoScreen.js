// screens/LiquorInfoScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { DataContext } from "../context/DataContext";

export default function LiquorInfoScreen() {
  const route = useRoute();
  const { categoryId } = route.params;

  const { liquorItems, setLiquorItems } = useContext(DataContext);

  const [category, setCategory] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newLiquor, setNewLiquor] = useState({
    name: "",
    ml: "",
    dozen: "",
    quantityFields: [],
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLiquor, setEditLiquor] = useState(null);

  const [tempQuantityValue, setTempQuantityValue] = useState("");
  const [editTempQty, setEditTempQty] = useState("");

  useEffect(() => {
    const foundCat = liquorItems.find((cat) => cat.id === categoryId);
    setCategory(foundCat || null);
  }, [liquorItems, categoryId]);

  const updateCategoryInContext = (updatedCat) => {
    setLiquorItems((prev) =>
      prev.map((c) => (c.id === categoryId ? updatedCat : c))
    );
  };

  // Add
  const openAddModal = () => {
    setNewLiquor({ name: "", ml: "", dozen: "", quantityFields: [] });
    setTempQuantityValue("");
    setAddModalVisible(true);
  };
  const handleAddLiquor = () => {
    if (!newLiquor.name || !newLiquor.ml || !newLiquor.dozen) {
      Alert.alert("Required Fields", "Please fill Name, Milliliters, and Dozen.");
      return;
    }
    const mlNum = parseFloat(newLiquor.ml);
    const dozenNum = parseFloat(newLiquor.dozen);
    if (isNaN(mlNum) || isNaN(dozenNum)) {
      Alert.alert("Invalid Input", "ML and Dozen must be numeric.");
      return;
    }

    const filteredQs = newLiquor.quantityFields.filter((q) => q !== 0);

    const newItem = {
      id: Date.now().toString(),
      name: newLiquor.name.trim(),
      ml: mlNum,
      dozen: dozenNum,
      quantityFields: filteredQs,
    };
    const updatedCat = {
      ...category,
      subLiquors: [...category.subLiquors, newItem],
    };
    updateCategoryInContext(updatedCat);

    Alert.alert("Success", "Liquor information added successfully!");
    setAddModalVisible(false);
  };
  const addQuantityField = () => {
    if (!tempQuantityValue.trim()) return;
    const qtyNum = parseFloat(tempQuantityValue);
    if (isNaN(qtyNum)) {
      Alert.alert("Invalid Input", "Quantity must be numeric.");
      return;
    }
    if (qtyNum === 0) {
      Alert.alert("Info", "Zero quantity ignored.");
      setTempQuantityValue("");
      return;
    }
    setNewLiquor((prev) => ({
      ...prev,
      quantityFields: [...prev.quantityFields, qtyNum],
    }));
    setTempQuantityValue("");
  };

  // Edit
  const openEditModal = (item) => {
    setEditLiquor({
      ...item,
      ml: String(item.ml),
      dozen: String(item.dozen),
      quantityFields: [...item.quantityFields],
    });
    setEditTempQty("");
    setEditModalVisible(true);
  };
  const handleSaveEdit = () => {
    if (!editLiquor.name || !editLiquor.ml || !editLiquor.dozen) {
      Alert.alert("Required Fields", "Please fill in all fields.");
      return;
    }
    const mlNum = parseFloat(editLiquor.ml);
    const dozenNum = parseFloat(editLiquor.dozen);
    if (isNaN(mlNum) || isNaN(dozenNum)) {
      Alert.alert("Invalid Input", "ML and Dozen must be numeric.");
      return;
    }

    const updatedQs = editLiquor.quantityFields.map((q) =>
      typeof q === "string" ? parseFloat(q) : q
    );
    const filteredQs = updatedQs.filter((val) => val !== 0);

    const updatedSub = {
      ...editLiquor,
      ml: mlNum,
      dozen: dozenNum,
      quantityFields: filteredQs,
    };

    const updatedSubLiquors = category.subLiquors.map((lq) =>
      lq.id === updatedSub.id ? updatedSub : lq
    );
    const updatedCat = { ...category, subLiquors: updatedSubLiquors };
    updateCategoryInContext(updatedCat);

    Alert.alert("Success", "Liquor information updated successfully!");
    setEditModalVisible(false);
  };
  const addQuantityFieldEdit = () => {
    if (!editTempQty.trim()) return;
    const qtyNum = parseFloat(editTempQty);
    if (isNaN(qtyNum)) {
      Alert.alert("Invalid Input", "Quantity must be numeric.");
      return;
    }
    if (qtyNum === 0) {
      Alert.alert("Info", "Zero quantity ignored.");
      setEditTempQty("");
      return;
    }
    setEditLiquor((prev) => ({
      ...prev,
      quantityFields: [...prev.quantityFields, qtyNum],
    }));
    setEditTempQty("");
  };
  const handleEditQuantityField = (index, value) => {
    const newArr = [...editLiquor.quantityFields];
    const parsedVal = parseFloat(value);
    if (isNaN(parsedVal)) {
      newArr[index] = 0;
    } else {
      newArr[index] = parsedVal;
    }
    setEditLiquor((prev) => ({
      ...prev,
      quantityFields: newArr,
    }));
  };

  // Delete Sub Liquor
  const handleDeleteLiquor = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this liquor item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedSub = category.subLiquors.filter((lq) => lq.id !== id);
          const updatedCat = { ...category, subLiquors: updatedSub };
          updateCategoryInContext(updatedCat);
          Alert.alert("Deleted", "Liquor information deleted successfully!");
        },
      },
    ]);
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Loading or Category not found...</Text>
      </View>
    );
  }

  // Render Table Header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Name</Text>
      <Text style={styles.tableCellHeader}>ML</Text>
      <Text style={styles.tableCellHeader}>Dozen</Text>
      <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Quantities</Text>
      <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Edit</Text>
      <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Delete</Text>
    </View>
  );

  // Render Table Row
  const renderTableRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.name}</Text>
      <Text style={styles.tableCell}>{item.ml}</Text>
      <Text style={styles.tableCell}>{item.dozen}</Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>
        {item.quantityFields.join(", ")}
      </Text>
      <View style={[styles.tableCell, { flex: 0.8, alignItems: "center" }]}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <View style={[styles.tableCell, { flex: 0.8, alignItems: "center" }]}>
        <TouchableOpacity onPress={() => handleDeleteLiquor(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="wine-outline" size={40} color="#4CAF50" />
        <Text style={styles.heading}>{category.name}</Text>
      </View>

      {/* Add Liquor Info Button */}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
        <Text style={styles.addButtonText}>Add Liquor Info</Text>
      </TouchableOpacity>

      {/* Liquor Information Table */}
      <ScrollView horizontal style={{ marginTop: 16 }}>
        <View style={styles.tableContainer}>
          {renderTableHeader()}
          {category.subLiquors.length > 0 ? (
            <FlatList
              data={category.subLiquors}
              keyExtractor={(item) => item.id}
              renderItem={renderTableRow}
            />
          ) : (
            <View style={styles.emptyTableContainer}>
              <Ionicons name="information-circle-outline" size={50} color="#ccc" />
              <Text style={styles.emptyTableText}>No Liquor Information Available.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ADD MODAL */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeading}>Add Liquor Information</Text>

              {/* Name Input */}
              <Text style={styles.modalLabel}>
                <Ionicons name="person-outline" size={18} color="#555" /> Name
              </Text>
              <TextInput
                style={styles.textInput}
                value={newLiquor.name}
                onChangeText={(val) =>
                  setNewLiquor((prev) => ({ ...prev, name: val }))
                }
                placeholder="e.g. Whiskey"
                accessibilityLabel="Liquor Name Input"
                accessibilityHint="Enter the name of the liquor"
              />

              {/* Milliliters Input */}
              <Text style={styles.modalLabel}>
                <Ionicons name="water-outline" size={18} color="#555" /> Milliliters (ML)
              </Text>
              <TextInput
                style={styles.textInput}
                value={newLiquor.ml}
                onChangeText={(val) =>
                  setNewLiquor((prev) => ({ ...prev, ml: val }))
                }
                keyboardType="numeric"
                placeholder="e.g. 750"
                accessibilityLabel="Milliliters Input"
                accessibilityHint="Enter the volume in milliliters"
              />

              {/* Dozen Input */}
              <Text style={styles.modalLabel}>
                <Ionicons name="cube-outline" size={18} color="#555" /> Dozen
              </Text>
              <TextInput
                style={styles.textInput}
                value={newLiquor.dozen}
                onChangeText={(val) =>
                  setNewLiquor((prev) => ({ ...prev, dozen: val }))
                }
                keyboardType="numeric"
                placeholder="e.g. 12"
                accessibilityLabel="Dozen Input"
                accessibilityHint="Enter the number of dozens"
              />

              {/* Add Quantity Fields */}
              <View style={styles.quantitySection}>
                <Text style={styles.modalLabel}>
                  <Ionicons name="list-outline" size={18} color="#555" /> Add Quantities
                </Text>
                <View style={styles.quantityInputRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                    value={tempQuantityValue}
                    onChangeText={setTempQuantityValue}
                    keyboardType="numeric"
                    placeholder="e.g. 1, 2..."
                    accessibilityLabel="Quantity Input"
                    accessibilityHint="Enter a quantity value to add"
                  />
                  <TouchableOpacity
                    style={styles.addQtyButton}
                    onPress={addQuantityField}
                    accessibilityLabel="Add Quantity"
                    accessibilityHint="Adds the entered quantity to the list"
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.currentQuantities}>
                  Current Quantities: {newLiquor.quantityFields.join(", ")}
                </Text>
              </View>

              {/* Save and Cancel Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={handleAddLiquor}
                  style={[styles.modalButton, styles.saveButton]}
                  accessibilityLabel="Save Liquor Information"
                  accessibilityHint="Saves the entered liquor information"
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAddModalVisible(false)}
                  style={[styles.modalButton, styles.cancelButton]}
                  accessibilityLabel="Cancel Adding Liquor"
                  accessibilityHint="Closes the add liquor modal without saving"
                >
                  <Ionicons name="close-circle-outline" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalContent}>
              {editLiquor && (
                <>
                  <Text style={styles.modalHeading}>Edit Liquor Information</Text>

                  {/* Name Input */}
                  <Text style={styles.modalLabel}>
                    <Ionicons name="person-outline" size={18} color="#555" /> Name
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editLiquor.name}
                    onChangeText={(val) =>
                      setEditLiquor((prev) => ({ ...prev, name: val }))
                    }
                    placeholder="e.g. Whiskey"
                    accessibilityLabel="Edit Liquor Name Input"
                    accessibilityHint="Modify the name of the liquor"
                  />

                  {/* Milliliters Input */}
                  <Text style={styles.modalLabel}>
                    <Ionicons name="water-outline" size={18} color="#555" /> Milliliters (ML)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editLiquor.ml}
                    onChangeText={(val) =>
                      setEditLiquor((prev) => ({ ...prev, ml: val }))
                    }
                    keyboardType="numeric"
                    placeholder="e.g. 750"
                    accessibilityLabel="Edit Milliliters Input"
                    accessibilityHint="Modify the volume in milliliters"
                  />

                  {/* Dozen Input */}
                  <Text style={styles.modalLabel}>
                    <Ionicons name="cube-outline" size={18} color="#555" /> Dozen
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editLiquor.dozen}
                    onChangeText={(val) =>
                      setEditLiquor((prev) => ({ ...prev, dozen: val }))
                    }
                    keyboardType="numeric"
                    placeholder="e.g. 12"
                    accessibilityLabel="Edit Dozen Input"
                    accessibilityHint="Modify the number of dozens"
                  />

                  {/* Edit Quantity Fields */}
                  <View style={styles.quantitySection}>
                    <Text style={styles.modalLabel}>
                      <Ionicons name="list-outline" size={18} color="#555" /> Edit Quantities
                    </Text>
                    {editLiquor.quantityFields.map((q, index) => (
                      <View key={index} style={styles.quantityInputRow}>
                        <Text style={{ flex: 0.2 }}>Qty {index + 1}:</Text>
                        <TextInput
                          style={[styles.textInput, { flex: 0.8 }]}
                          value={String(q)}
                          onChangeText={(val) => handleEditQuantityField(index, val)}
                          keyboardType="numeric"
                          placeholder="e.g. 1, 2..."
                          accessibilityLabel={`Edit Quantity ${index + 1}`}
                          accessibilityHint={`Modify quantity number ${index + 1}`}
                        />
                      </View>
                    ))}

                    {/* Add New Quantity */}
                    <View style={styles.quantityInputRow}>
                      <TextInput
                        style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                        value={editTempQty}
                        onChangeText={setEditTempQty}
                        keyboardType="numeric"
                        placeholder="e.g. 3"
                        accessibilityLabel="Add New Quantity Input"
                        accessibilityHint="Enter a new quantity to add"
                      />
                      <TouchableOpacity
                        style={styles.addQtyButton}
                        onPress={addQuantityFieldEdit}
                        accessibilityLabel="Add Quantity"
                        accessibilityHint="Adds the entered quantity to the list"
                      >
                        <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.currentQuantities}>
                      Current Quantities: {editLiquor.quantityFields.join(", ")}
                    </Text>
                  </View>

                  {/* Save and Cancel Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={handleSaveEdit}
                      style={[styles.modalButton, styles.saveButton]}
                      accessibilityLabel="Save Edited Liquor Information"
                      accessibilityHint="Saves the edited liquor information"
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text style={styles.modalButtonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setEditModalVisible(false)}
                      style={[styles.modalButton, styles.cancelButton]}
                      accessibilityLabel="Cancel Editing Liquor"
                      accessibilityHint="Closes the edit liquor modal without saving"
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
    padding: 16,
    backgroundColor: "#fff",
  },
  notFoundText: {
    fontSize: 18,
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  addButtonText: {
    marginLeft: 6,
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  tableContainer: {
    minWidth: 800,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableCellHeader: {
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    textAlign: "center",
    fontSize: 14,
    color: "#555",
  },
  emptyTableContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyTableText: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 10,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalContent: {
    flex: 1,
  },
  modalHeading: {
    fontSize: 22,
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
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
    marginBottom: 10,
  },
  quantitySection: {
    marginTop: 10,
  },
  quantityInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addQtyButton: {
    padding: 6,
  },
  currentQuantities: {
    marginTop: 6,
    fontStyle: "italic",
    color: "#555",
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
