// screens/CategoryDetailsScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { DataContext } from "../context/DataContext";
import Ionicons from "@expo/vector-icons/Ionicons"; // Ensure @expo/vector-icons is installed

export default function CategoryDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { liquorItems, setLiquorItems } = useContext(DataContext);

  const { categoryId } = route.params;
  const [category, setCategory] = useState(null);

  const [tempEmptyIn, setTempEmptyIn] = useState("");
  const [tempEmptyOut, setTempEmptyOut] = useState("");

  useEffect(() => {
    const found = liquorItems.find((cat) => cat.id === categoryId);
    if (found) {
      setCategory(found);

      // Initialize emptyIn and emptyOut, defaulting to "0" if undefined
      const savedIn = found.emptyIn !== undefined ? String(found.emptyIn) : "0";
      const savedOut = found.emptyOut !== undefined ? String(found.emptyOut) : "0";
      setTempEmptyIn(savedIn);
      setTempEmptyOut(savedOut);
    }
  }, [liquorItems, categoryId]);

  const updateCategory = (updatedCat) => {
    setLiquorItems((prev) =>
      prev.map((c) => (c.id === categoryId ? updatedCat : c))
    );
  };

  const handleSaveEmpty = () => {
    if (!category) return;

    const newEmptyIn = parseFloat(tempEmptyIn);
    const newEmptyOut = parseFloat(tempEmptyOut);

    if (isNaN(newEmptyIn) || isNaN(newEmptyOut)) {
      Alert.alert("Invalid Input", "Please enter valid numbers for empty stocks.");
      return;
    }

    const updatedCat = {
      ...category,
      emptyIn: newEmptyIn,
      emptyOut: newEmptyOut,
    };
    updateCategory(updatedCat);

    Alert.alert("Saved", "Empty in/out stock has been saved.");
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Category not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="wine-outline" size={40} color="#4CAF50" />
        <Text style={styles.heading}>{category.name}</Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navButtonsContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("LiquorInfo", { categoryId })}
        >
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Liquor Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("StockAndSales", { categoryId })}
        >
          <Ionicons name="stats-chart-outline" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Stock & Sales</Text>
        </TouchableOpacity>
      </View>

      {/* Empty Stock Inputs */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>
          <Ionicons name="arrow-down-circle-outline" size={20} color="#4CAF50" /> Empty In Stock
        </Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="e.g. 2"
          value={tempEmptyIn}
          onChangeText={setTempEmptyIn}
        />

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>
          <Ionicons name="arrow-up-circle-outline" size={20} color="#F44336" /> Empty Out Stock
        </Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="e.g. 3"
          value={tempEmptyOut}
          onChangeText={setTempEmptyOut}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmpty}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Empty Data</Text>
        </TouchableOpacity>
      </View>

      {/* Calculations */}
      <View style={styles.calcContainer}>
        <Text style={styles.calcRow}>
          <Ionicons name="cash-outline" size={16} color="#333" /> Calculated In: Rs {(parseFloat(tempEmptyIn) || 0) * 100}
        </Text>
        <Text style={styles.calcRow}>
          <Ionicons name="cash-outline" size={16} color="#333" /> Calculated Out: Rs {(parseFloat(tempEmptyOut) || 0) * 100}
        </Text>
        <Text style={[styles.calcRow, { fontWeight: "bold" }]}>
          <Ionicons name="calculator-outline" size={16} color="#333" /> Total Empty Amount: Rs {((parseFloat(tempEmptyIn) || 0) * 100) + ((parseFloat(tempEmptyOut) || 0) * 100)}
        </Text>
      </View>

      {/* Saved Data */}
      <View style={styles.savedContainer}>
        <Text style={styles.savedText}>
          <Ionicons name="checkmark-done-outline" size={16} color="#4CAF50" /> Saved emptyIn: {category.emptyIn || 0}
        </Text>
        <Text style={styles.savedText}>
          <Ionicons name="checkmark-done-outline" size={16} color="#4CAF50" /> Saved emptyOut: {category.emptyOut || 0}
        </Text>
      </View>
    </ScrollView>
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
  navButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: "center",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
  inputSection: {
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 6,
    justifyContent: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
  },
  calcContainer: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  calcRow: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  savedContainer: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  savedText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
});
