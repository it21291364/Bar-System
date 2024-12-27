// screens/CategoryDetailsScreen.js
import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { DataContext } from "../context/DataContext";

export default function CategoryDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { liquorItems } = useContext(DataContext);

  const { categoryId } = route.params; 
  const [category, setCategory] = useState(null);

  // For "Empty In" / "Empty Out"
  const [emptyIn, setEmptyIn] = useState("");
  const [emptyOut, setEmptyOut] = useState("");

  // Suppose you want to multiply emptyIn by 100, emptyOut by 500, etc.
  // Adjust as needed:
  const finalEmptyIn = parseFloat(emptyIn) ? parseFloat(emptyIn) * 100 : 0;
  const finalEmptyOut = parseFloat(emptyOut) ? parseFloat(emptyOut) * 500 : 0;

  useEffect(() => {
    // find the category by ID
    const found = liquorItems.find((cat) => cat.id === categoryId);
    if (found) {
      setCategory(found);
    }
  }, [liquorItems, categoryId]);

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

      <View style={styles.emptyFields}>
        <Text>Empty In Stock</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="e.g. 2"
          value={emptyIn}
          onChangeText={setEmptyIn}
        />
        <Text>
          Calculated In: Rs {finalEmptyIn.toFixed(2)}
        </Text>

        <Text style={{ marginTop: 16 }}>Empty Out Stock</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="e.g. 3"
          value={emptyOut}
          onChangeText={setEmptyOut}
        />
        <Text>
          Calculated Out: Rs {finalEmptyOut.toFixed(2)}
        </Text>
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
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginVertical: 8,
    padding: 8,
  },
});
