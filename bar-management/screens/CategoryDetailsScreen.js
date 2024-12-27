// screens/CategoryDetailsScreen.js
import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { DataContext } from "../context/DataContext";

export default function CategoryDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { liquorItems, setLiquorItems } = useContext(DataContext);

  const { categoryId } = route.params;
  const [category, setCategory] = useState(null);

  // Locally tracked emptyIn/emptyOut
  const [tempEmptyIn, setTempEmptyIn] = useState("");
  const [tempEmptyOut, setTempEmptyOut] = useState("");

  // Multiplying each by 100
  const calcEmptyIn = parseFloat(tempEmptyIn) || 0;
  const calcEmptyOut = parseFloat(tempEmptyOut) || 0;
  const finalEmptyIn = calcEmptyIn * 100;
  const finalEmptyOut = calcEmptyOut * 100;
  const totalEmpty = finalEmptyIn + finalEmptyOut;

  useEffect(() => {
    const found = liquorItems.find((cat) => cat.id === categoryId);
    if (found) {
      setCategory(found);

      // If the category has saved emptyIn/out, load them
      const savedIn =
        found.emptyIn !== undefined ? String(found.emptyIn) : "";
      const savedOut =
        found.emptyOut !== undefined ? String(found.emptyOut) : "";
      setTempEmptyIn(savedIn);
      setTempEmptyOut(savedOut);
    }
  }, [liquorItems, categoryId]);

  // Helper to update the category in context
  const updateCategory = (updatedCat) => {
    setLiquorItems((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
  };

  const handleSaveEmpty = () => {
    if (!category) return;

    // Convert to number
    const newEmptyIn = parseFloat(tempEmptyIn) || 0;
    const newEmptyOut = parseFloat(tempEmptyOut) || 0;

    const updatedCat = {
      ...category,
      emptyIn: newEmptyIn,
      emptyOut: newEmptyOut,
    };
    updateCategory(updatedCat);

    Alert.alert("Saved", "Empty in/out stock saved to DB!");
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{category.name}</Text>

      {/* Navigation Buttons */}
      <View style={styles.btnContainer}>
        <Button
          title="Liquor Info"
          onPress={() => navigation.navigate("LiquorInfo", { categoryId })}
        />
        <Button
          title="Stock & Sales"
          onPress={() => navigation.navigate("StockAndSales", { categoryId })}
        />
      </View>

      {/* Input Fields for Empty In/Out */}
      <View style={styles.emptyFields}>
        <Text>Empty In Stock</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="e.g. 2"
          value={tempEmptyIn}
          onChangeText={setTempEmptyIn}
        />

        <Text style={{ marginTop: 16 }}>Empty Out Stock</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="e.g. 3"
          value={tempEmptyOut}
          onChangeText={setTempEmptyOut}
        />

        <Button title="Save Empty Data" onPress={handleSaveEmpty} />
      </View>

      {/* Display the three rows of calculations */}
      <View style={styles.calcContainer}>
        <Text style={styles.calcRow}>
          Calculated In: Rs {finalEmptyIn.toFixed(2)}
        </Text>
        <Text style={styles.calcRow}>
          Calculated Out: Rs {finalEmptyOut.toFixed(2)}
        </Text>
        <Text style={[styles.calcRow, { fontWeight: "bold" }]}>
          Total Empty Amount: Rs {totalEmpty.toFixed(2)}
        </Text>
      </View>

      {/* Show what's currently saved */}
      <View style={styles.savedContainer}>
        <Text>Saved emptyIn: {category.emptyIn || 0}</Text>
        <Text>Saved emptyOut: {category.emptyOut || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  emptyFields: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginVertical: 8,
    padding: 8,
  },
  calcContainer: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  calcRow: {
    fontSize: 15,
    marginVertical: 4,
  },
  savedContainer: {
    marginTop: 10,
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 6,
  },
});
