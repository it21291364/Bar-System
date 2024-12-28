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
  ScrollView,
  ImageBackground,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { DataContext } from "../context/DataContext";

export default function LiquorScreen() {
  const { liquorItems, setLiquorItems } = useContext(DataContext);
  const navigation = useNavigation();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // ADD
  const openAddModal = () => {
    setNewCategoryName("");
    setAddModalVisible(true);
  };
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Required Fields", "Please enter the category name.");
      return;
    }
    const newCat = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      subLiquors: [],
    };
    setLiquorItems((prev) => [...prev, newCat]);
    Alert.alert("Success", "Category created successfully!");
    setAddModalVisible(false);
  };

  // EDIT
  const openEditModal = (cat) => {
    setEditCategory({ ...cat });
    setEditModalVisible(true);
  };
  const handleSaveEdit = () => {
    if (!editCategory.name.trim()) {
      Alert.alert("Required Fields", "Please enter the category name.");
      return;
    }
    setLiquorItems((prev) =>
      prev.map((c) => (c.id === editCategory.id ? editCategory : c))
    );
    Alert.alert("Success", "Category updated successfully!");
    setEditModalVisible(false);
  };

  // DELETE
  const handleDelete = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this category?", [
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

  // RENDER
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryRow}
      onPress={() => {
        navigation.navigate("CategoryDetails", { categoryId: item.id });
      }}
      accessibilityLabel={`Navigate to details of ${item.name}`}
      accessibilityHint={`Opens the details screen for ${item.name} category`}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="wine-outline" size={24} color="#4CAF50" />
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={styles.actionIcon}
          accessibilityLabel={`Edit ${item.name} category`}
          accessibilityHint={`Opens the edit modal for ${item.name} category`}
        >
          <Ionicons name="create-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.actionIcon}
          accessibilityLabel={`Delete ${item.name} category`}
          accessibilityHint={`Deletes the ${item.name} category`}
        >
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../assets/cat1.jpg")} // Replace with your background image
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="wine-outline" size={40} color="#fff" />
          <Text style={styles.heading}>Liquor Categories</Text>
        </View>

        {/* Add Category Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
            <Text style={styles.addButtonText}>Add Liquor Category</Text>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        {liquorItems.length > 0 ? (
          <FlatList
            data={liquorItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="wine-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No Liquor Categories Found. Add a new category!</Text>
          </View>
        )}

        {/* ADD MODAL */}
        <Modal visible={addModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>Create Liquor Category</Text>

                <Text style={styles.modalLabel}>
                  <Ionicons name="wine-outline" size={18} color="#555" /> Category Name
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Whiskey, Vodka"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  accessibilityLabel="Category Name Input"
                  accessibilityHint="Enter the name of the new liquor category"
                />

                {/* Save and Cancel Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={handleAddCategory}
                    style={[styles.modalButton, styles.saveButton]}
                    accessibilityLabel="Save Category"
                    accessibilityHint="Saves the new liquor category"
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setAddModalVisible(false)}
                    style={[styles.modalButton, styles.cancelButton]}
                    accessibilityLabel="Cancel Adding Category"
                    accessibilityHint="Closes the add category modal without saving"
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
                {editCategory && (
                  <>
                    <Text style={styles.modalHeading}>Edit Category</Text>
                    <Text style={styles.modalLabel}>
                      <Ionicons name="wine-outline" size={18} color="#555" /> Category Name
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Whiskey, Vodka"
                      value={editCategory.name}
                      onChangeText={(val) =>
                        setEditCategory((prev) => ({ ...prev, name: val }))
                      }
                      accessibilityLabel="Edit Category Name Input"
                      accessibilityHint="Modify the name of the liquor category"
                    />

                    {/* Save and Cancel Buttons */}
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        style={[styles.modalButton, styles.saveButton]}
                        accessibilityLabel="Save Edited Category"
                        accessibilityHint="Saves the edited liquor category"
                      >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        <Text style={styles.modalButtonText}>Save</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setEditModalVisible(false)}
                        style={[styles.modalButton, styles.cancelButton]}
                        accessibilityLabel="Cancel Editing Category"
                        accessibilityHint="Closes the edit category modal without saving"
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)", // Semi-transparent overlay for readability
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#333",
  },
  addButtonContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
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
  categoryRow: {
    flexDirection: "row",
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
    marginLeft: "auto",
  },
  actionIcon: {
    padding: 6,
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
