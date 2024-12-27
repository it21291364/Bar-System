// screens/LiquorScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DataContext } from "../context/DataContext";
import { useNavigation } from "@react-navigation/native";

export default function LiquorScreen() {
  const { liquorItems, setLiquorItems } = useContext(DataContext);
  const navigation = useNavigation();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // ----------------------
  // ADD CATEGORY
  // ----------------------
  const openAddModal = () => {
    setNewCategoryName("");
    setAddModalVisible(true);
  };
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Required", "Please enter the category name.");
      return;
    }
    const newCat = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      subLiquors: [],
    };
    setLiquorItems((prev) => [...prev, newCat]);
    Alert.alert("Created", "Category created successfully!");
    setAddModalVisible(false);
  };

  // ----------------------
  // EDIT CATEGORY
  // ----------------------
  const openEditModal = (cat) => {
    setEditCategory({ ...cat });
    setEditModalVisible(true);
  };
  const handleSaveEdit = () => {
    if (!editCategory.name.trim()) {
      Alert.alert("Required", "Please enter the category name.");
      return;
    }
    setLiquorItems((prev) =>
      prev.map((c) => (c.id === editCategory.id ? editCategory : c))
    );
    Alert.alert("Updated", "Category updated successfully!");
    setEditModalVisible(false);
  };

  // ----------------------
  // DELETE CATEGORY
  // ----------------------
  const handleDelete = (id) => {
    Alert.alert("Confirm", "Are you sure to delete this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setLiquorItems((prev) => prev.filter((c) => c.id !== id));
          Alert.alert("Deleted", "Category deleted successfully!");
        },
      },
    ]);
  };

  // ----------------------
  // RENDER CATEGORIES
  // ----------------------
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryRow}
      onPress={() => {
        // Navigate to CategoryDetails screen
        navigation.navigate("CategoryDetails", { categoryId: item.id });
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={32} color="green" />
          <Text style={{ marginLeft: 8 }}>Add Liquor Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={liquorItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* ADD MODAL */}
      <Modal visible={addModalVisible} transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Create Liquor Category</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Category Name"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <View style={styles.iconButtonRow}>
            {/* Icon button for Save */}
            <TouchableOpacity style={styles.iconButton} onPress={handleAddCategory}>
              <Ionicons name="checkmark-circle-outline" size={34} color="green" />
              <Text>Save</Text>
            </TouchableOpacity>

            {/* Icon button for Cancel */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setAddModalVisible(false)}
            >
              <Ionicons name="close-circle-outline" size={34} color="red" />
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent={false}>
        <View style={styles.modalContainer}>
          {editCategory && (
            <>
              <Text style={styles.heading}>Edit Category</Text>
              <TextInput
                style={styles.textInput}
                value={editCategory.name}
                onChangeText={(val) =>
                  setEditCategory((prev) => ({ ...prev, name: val }))
                }
              />
              <View style={styles.iconButtonRow}>
                <TouchableOpacity style={styles.iconButton} onPress={handleSaveEdit}>
                  <Ionicons name="checkmark-circle-outline" size={34} color="green" />
                  <Text>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Ionicons name="close-circle-outline" size={34} color="red" />
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addButtonContainer: {
    alignItems: "flex-end",
    margin: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  categoryName: { fontSize: 16, fontWeight: "bold" },
  actions: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
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
  iconButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 20,
  },
});
