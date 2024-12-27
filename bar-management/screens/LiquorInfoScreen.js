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
  Button,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { DataContext } from "../context/DataContext";

export default function LiquorInfoScreen() {
  const route = useRoute();
  const { categoryId } = route.params;

  const { liquorItems, setLiquorItems } = useContext(DataContext);

  const [category, setCategory] = useState(null);

  // Modals & form states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newLiquor, setNewLiquor] = useState({
    name: "",
    ml: "",
    dozen: "",
    quantityFields: [],
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLiquor, setEditLiquor] = useState(null);

  // Additional quantity for the "newLiquor" form
  const [tempQuantityValue, setTempQuantityValue] = useState("");

  // Additional quantity for the "editLiquor" form (when adding new quantities)
  const [editTempQty, setEditTempQty] = useState("");

  useEffect(() => {
    const foundCat = liquorItems.find((cat) => cat.id === categoryId);
    setCategory(foundCat || null);
  }, [liquorItems, categoryId]);

  // -----------------------------------
  // Helper: Update the category in context
  // -----------------------------------
  const updateCategoryInContext = (updatedCat) => {
    setLiquorItems((prev) =>
      prev.map((c) => (c.id === categoryId ? updatedCat : c))
    );
  };

  // -----------------------------------
  // Add Sub Liquor
  // -----------------------------------
  const openAddModal = () => {
    setNewLiquor({ name: "", ml: "", dozen: "", quantityFields: [] });
    setTempQuantityValue("");
    setAddModalVisible(true);
  };
  const handleAddLiquor = () => {
    if (!newLiquor.name || !newLiquor.ml || !newLiquor.dozen) {
      Alert.alert("Required", "Please fill Name, milliliters, and Dozen.");
      return;
    }
    const mlNum = parseFloat(newLiquor.ml);
    const dozenNum = parseFloat(newLiquor.dozen);
    if (isNaN(mlNum) || isNaN(dozenNum)) {
      Alert.alert("Invalid", "ML and Dozen must be numeric.");
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      name: newLiquor.name.trim(),
      ml: mlNum,
      dozen: dozenNum,
      quantityFields: [...newLiquor.quantityFields],
    };
    const updatedCat = {
      ...category,
      subLiquors: [...category.subLiquors, newItem],
    };
    updateCategoryInContext(updatedCat);

    Alert.alert("Created", "Liquor info added!");
    setAddModalVisible(false);
  };

  // Add quantity to "newLiquor"
  const addQuantityField = () => {
    if (!tempQuantityValue.trim()) return;
    const qtyNum = parseFloat(tempQuantityValue);
    if (isNaN(qtyNum)) {
      Alert.alert("Invalid", "Quantity must be numeric.");
      return;
    }
    setNewLiquor((prev) => ({
      ...prev,
      quantityFields: [...prev.quantityFields, qtyNum],
    }));
    setTempQuantityValue("");
  };

  // -----------------------------------
  // Edit Sub Liquor
  // -----------------------------------
  const openEditModal = (item) => {
    // Convert numeric fields to string for text inputs
    setEditLiquor({
      ...item,
      ml: String(item.ml),
      dozen: String(item.dozen),
      quantityFields: [...item.quantityFields], // copy array
    });
    setEditTempQty("");
    setEditModalVisible(true);
  };
  const handleSaveEdit = () => {
    if (!editLiquor.name || !editLiquor.ml || !editLiquor.dozen) {
      Alert.alert("Required", "Please fill required fields.");
      return;
    }
    const mlNum = parseFloat(editLiquor.ml);
    const dozenNum = parseFloat(editLiquor.dozen);
    if (isNaN(mlNum) || isNaN(dozenNum)) {
      Alert.alert("Invalid", "ML and Dozen must be numeric.");
      return;
    }
    // parse existing quantities as float if needed
    const updatedQuantities = editLiquor.quantityFields.map((q) =>
      typeof q === "string" ? parseFloat(q) : q
    );
    // Build the updated subLiquor
    const updatedSub = {
      ...editLiquor,
      ml: mlNum,
      dozen: dozenNum,
      quantityFields: updatedQuantities,
    };

    const updatedSubLiquors = category.subLiquors.map((lq) => {
      if (lq.id === updatedSub.id) return updatedSub;
      return lq;
    });
    const updatedCat = { ...category, subLiquors: updatedSubLiquors };
    updateCategoryInContext(updatedCat);

    Alert.alert("Updated", "Liquor info updated!");
    setEditModalVisible(false);
  };

  // Add a new quantity in edit mode
  const addQuantityFieldEdit = () => {
    if (!editTempQty.trim()) return;
    const qtyNum = parseFloat(editTempQty);
    if (isNaN(qtyNum)) {
      Alert.alert("Invalid", "Quantity must be numeric.");
      return;
    }
    setEditLiquor((prev) => ({
      ...prev,
      quantityFields: [...prev.quantityFields, qtyNum],
    }));
    setEditTempQty("");
  };

  // Edit an existing quantity in the array
  const handleEditQuantityField = (index, value) => {
    // user typed a new value for a specific quantity index
    const newArr = [...editLiquor.quantityFields];
    newArr[index] = value; // store as string now
    setEditLiquor((prev) => ({
      ...prev,
      quantityFields: newArr,
    }));
  };

  // -----------------------------------
  // Delete Sub Liquor
  // -----------------------------------
  const handleDeleteLiquor = (id) => {
    Alert.alert("Confirm", "Delete this liquor item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedSub = category.subLiquors.filter((lq) => lq.id !== id);
          const updatedCat = { ...category, subLiquors: updatedSub };
          updateCategoryInContext(updatedCat);

          Alert.alert("Deleted", "Liquor info deleted!");
        },
      },
    ]);
  };

  // If no category found, just show fallback
  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Loading or Category not found...</Text>
      </View>
    );
  }

  // -----------------------------------
  // RENDER TABLE HEADERS + ROWS
  // -----------------------------------
  const renderTableHeader = () => {
    return (
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Name</Text>
        <Text style={styles.tableCellHeader}>ML</Text>
        <Text style={styles.tableCellHeader}>Dozen</Text>
        <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Quantities</Text>
        <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Edit</Text>
        <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Delete</Text>
      </View>
    );
  };

  const renderTableRow = ({ item }) => {
    return (
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.name}</Text>
        <Text style={styles.tableCell}>{item.ml}</Text>
        <Text style={styles.tableCell}>{item.dozen}</Text>
        <Text style={[styles.tableCell, { flex: 1.5 }]}>
          {item.quantityFields.join(", ")}
        </Text>
        <View style={[styles.tableCell, { flex: 0.8, alignItems: "center" }]}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Ionicons name="create-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={[styles.tableCell, { flex: 0.8, alignItems: "center" }]}>
          <TouchableOpacity onPress={() => handleDeleteLiquor(item.id)}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Add Liquor Info" onPress={openAddModal} />

      {/* ScrollView horizontally if you have many columns */}
      <ScrollView horizontal style={{ marginTop: 16 }}>
        <View style={{ width: 900 }}> 
          {/* Adjust width so the table looks bigger/spacious */}
          {renderTableHeader()}
          <FlatList
            data={category.subLiquors}
            keyExtractor={(item) => item.id}
            renderItem={renderTableRow}
          />
        </View>
      </ScrollView>

      {/* ADD MODAL */}
      <Modal visible={addModalVisible} transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Add Liquor Info</Text>

          <Text>Name</Text>
          <TextInput
            style={styles.textInput}
            value={newLiquor.name}
            onChangeText={(val) =>
              setNewLiquor((prev) => ({ ...prev, name: val }))
            }
          />

          <Text>Milliliters</Text>
          <TextInput
            style={styles.textInput}
            value={newLiquor.ml}
            onChangeText={(val) => setNewLiquor((prev) => ({ ...prev, ml: val }))}
            keyboardType="numeric"
          />

          <Text>Dozen</Text>
          <TextInput
            style={styles.textInput}
            value={newLiquor.dozen}
            onChangeText={(val) =>
              setNewLiquor((prev) => ({ ...prev, dozen: val }))
            }
            keyboardType="numeric"
          />

          {/* Add quantity fields */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "bold" }}>Add Quantities</Text>
            <TextInput
              style={styles.textInput}
              value={tempQuantityValue}
              onChangeText={setTempQuantityValue}
              keyboardType="numeric"
              placeholder="e.g. 1, 2..."
            />
            <Button title="Add Quantity" onPress={addQuantityField} />
            <Text>Current: {newLiquor.quantityFields.join(", ")}</Text>
          </View>

          <View style={styles.btnRow}>
            <Button title="Save" onPress={handleAddLiquor} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setAddModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent={false}>
        <ScrollView style={styles.modalScroll}>
          <View style={styles.modalContainer}>
            {editLiquor && (
              <>
                <Text style={styles.heading}>Edit Liquor</Text>

                <Text>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editLiquor.name}
                  onChangeText={(val) =>
                    setEditLiquor((prev) => ({ ...prev, name: val }))
                  }
                />

                <Text>Milliliters</Text>
                <TextInput
                  style={styles.textInput}
                  value={editLiquor.ml}
                  onChangeText={(val) =>
                    setEditLiquor((prev) => ({ ...prev, ml: val }))
                  }
                  keyboardType="numeric"
                />

                <Text>Dozen</Text>
                <TextInput
                  style={styles.textInput}
                  value={editLiquor.dozen}
                  onChangeText={(val) =>
                    setEditLiquor((prev) => ({ ...prev, dozen: val }))
                  }
                  keyboardType="numeric"
                />

                {/* Edit existing quantity fields individually */}
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Edit Existing Quantities</Text>
                  {editLiquor.quantityFields.map((q, index) => (
                    <View key={index} style={styles.quantityRow}>
                      <Text style={{ marginRight: 8 }}>Qty {index + 1}:</Text>
                      <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        value={String(q)}
                        onChangeText={(val) => handleEditQuantityField(index, val)}
                        keyboardType="numeric"
                      />
                    </View>
                  ))}
                </View>

                {/* Add new quantities */}
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Add More Quantities</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editTempQty}
                    onChangeText={setEditTempQty}
                    keyboardType="numeric"
                    placeholder="e.g. 1, 2..."
                  />
                  <Button title="Add Qty" onPress={addQuantityFieldEdit} />
                  <Text>
                    Current: {editLiquor.quantityFields.join(", ")}
                  </Text>
                </View>

                <View style={styles.btnRow}>
                  <Button title="Save" onPress={handleSaveEdit} />
                  <Button
                    title="Cancel"
                    color="red"
                    onPress={() => setEditModalVisible(false)}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

// -----------------------------------
// STYLES
// -----------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  modalScroll: {
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
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    padding: 8,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  // Table header / rows
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#dcdcdc",
    paddingVertical: 8,
  },
  tableCellHeader: {
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableCell: {
    padding: 8,
    fontSize: 14,
    textAlign: "center",
    flex: 1,
  },
  // quantity row in edit
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
