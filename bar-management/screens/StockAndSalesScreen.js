// screens/StockAndSalesScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { DataContext } from "../context/DataContext";

export default function StockAndSalesScreen() {
  const route = useRoute();
  const { categoryId } = route.params;
  const { liquorItems, setLiquorItems } = useContext(DataContext);

  const [category, setCategory] = useState(null);

  // For editing subLiquor
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSubLiquor, setEditSubLiquor] = useState(null);

  useEffect(() => {
    const foundCat = liquorItems.find((cat) => cat.id === categoryId);
    if (foundCat) {
      setCategory(foundCat);
    }
  }, [liquorItems, categoryId]);

  const updateCategory = (updatedCat) => {
    setLiquorItems((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
  };

  // Build a comma-separated list of numeric results (dozen * quantity)
  const buildPurchasingStockList = (sub) => {
    if (!sub.quantityFields || sub.quantityFields.length === 0) return "";
    const dozen = sub.dozen || 0;
    const parts = sub.quantityFields.map((q) => String(dozen * q));
    return parts.join(", ");
  };

  // Sum (dozen * each quantity)
  const calcPurchasingStockTotal = (sub) => {
    const dozen = sub.dozen || 0;
    if (!sub.quantityFields) return 0;
    return sub.quantityFields.reduce((acc, q) => acc + dozen * q, 0);
  };

  const calcSoldItems = (pStockTotal, inStock) => {
    const sold = pStockTotal - inStock;
    return sold < 0 ? 0 : sold;
  };
  const calcSale = (soldItems, sellingPrice) => soldItems * sellingPrice;
  const calcInStockBalance = (inStock, sellingPrice) => inStock * sellingPrice;

  // Convert each subLiquor to a row
  const getStockSalesRow = (sub) => {
    const buyingPrice = parseFloat(sub.buyingPrice) || 0;
    const sellingPrice = parseFloat(sub.sellingPrice) || 0;
    const inStock = parseFloat(sub.inStock) || 0;

    const purchasingStockString = buildPurchasingStockList(sub);
    const pStockTotal = calcPurchasingStockTotal(sub);

    const soldItems = calcSoldItems(pStockTotal, inStock);
    const sale = calcSale(soldItems, sellingPrice);
    const inStockBalance = calcInStockBalance(inStock, sellingPrice);

    return {
      id: sub.id,
      name: sub.name,
      ml: sub.ml,
      buyingPrice,
      sellingPrice,
      purchasingStockString,
      purchasingStockTotal: pStockTotal,
      soldItems,
      inStock,
      sale,
      inStockBalance,
    };
  };

  // Compute total sale / total in stock
  let totalSale = 0;
  let totalInStockVal = 0;
  let subLiquorRows = [];
  if (category) {
    subLiquorRows = category.subLiquors.map((sub) => {
      const row = getStockSalesRow(sub);
      totalSale += row.sale;
      totalInStockVal += row.inStockBalance;
      return row;
    });
  }

  // Edit logic
  const openEditModal = (row) => {
    setEditSubLiquor({
      ...row,
      buyingPrice: String(row.buyingPrice || ""),
      sellingPrice: String(row.sellingPrice || ""),
      inStock: String(row.inStock || ""),
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editSubLiquor) return;
    const { id, buyingPrice, sellingPrice, inStock } = editSubLiquor;
    if (!buyingPrice.trim() || !sellingPrice.trim() || !inStock.trim()) {
      Alert.alert(
        "Required",
        "Buying Price, Selling Price, and In Stock are required."
      );
      return;
    }

    const updatedSubLiquors = category.subLiquors.map((sub) => {
      if (sub.id === id) {
        return {
          ...sub,
          buyingPrice: parseFloat(buyingPrice) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
          inStock: parseFloat(inStock) || 0,
        };
      }
      return sub;
    });

    const updatedCat = { ...category, subLiquors: updatedSubLiquors };
    updateCategory(updatedCat);

    Alert.alert("Updated", "Stock & Sales info updated!");
    setEditModalVisible(false);
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Category not found or loading...</Text>
      </View>
    );
  }

  // Table
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 1.2 }]}>Name</Text>
      <Text style={styles.headerCell}>ML</Text>
      <Text style={styles.headerCell}>BuyPrice</Text>
      <Text style={styles.headerCell}>SellPrice</Text>
      <Text style={[styles.headerCell, { flex: 1.5 }]}>Purchasing Stock</Text>
      <Text style={styles.headerCell}>P. Stock T.</Text>
      <Text style={styles.headerCell}>Sold</Text>
      <Text style={styles.headerCell}>InStock</Text>
      <Text style={styles.headerCell}>Sale</Text>
      <Text style={styles.headerCell}>InStkBal</Text>
      {/* Edit column with narrower flex */}
      <Text style={[styles.headerCell, { flex: 0.8 }]}>Edit</Text>
    </View>
  );

  const renderRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 1.2 }]}>{item.name}</Text>
      <Text style={styles.cell}>{item.ml}</Text>
      <Text style={styles.cell}>{item.buyingPrice}</Text>
      <Text style={styles.cell}>{item.sellingPrice}</Text>
      <Text style={[styles.cell, { flex: 1.5 }]}>
        {item.purchasingStockString}
      </Text>
      <Text style={styles.cell}>{item.purchasingStockTotal}</Text>
      <Text style={styles.cell}>{item.soldItems}</Text>
      <Text style={styles.cell}>{item.inStock}</Text>
      <Text style={styles.cell}>{item.sale.toFixed(2)}</Text>
      <Text style={styles.cell}>{item.inStockBalance.toFixed(2)}</Text>

      {/* Center the edit icon */}
      <View style={[styles.cell, { flex: 0.8, alignItems: "center" }]}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={22} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.totalsContainer}>
        <Text style={styles.totalsText}>
          Total Sale: Rs {totalSale.toFixed(2)}
        </Text>
        <Text style={styles.totalsText}>
          Total In Stock: Rs {totalInStockVal.toFixed(2)}
        </Text>
      </View>

      <ScrollView horizontal>
        <View style={{ width: 1300 }}>
          {renderTableHeader()}
          <FlatList
            data={subLiquorRows}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
          />
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editModalVisible}
        transparent={false}
        animationType="slide"
      >
        <ScrollView style={styles.modalScroll}>
          <View style={styles.modalContainer}>
            {editSubLiquor && (
              <>
                <Text style={styles.modalHeading}>Edit Stock & Sales</Text>

                <Text>Name</Text>
                <Text style={[styles.readonlyField, { marginBottom: 10 }]}>
                  {editSubLiquor.name}
                </Text>

                <Text>Milliliters</Text>
                <Text style={[styles.readonlyField, { marginBottom: 10 }]}>
                  {editSubLiquor.ml}
                </Text>

                <Text>Buying Price</Text>
                <TextInput
                  style={styles.input}
                  value={editSubLiquor.buyingPrice}
                  onChangeText={(val) =>
                    setEditSubLiquor((p) => ({ ...p, buyingPrice: val }))
                  }
                  keyboardType="numeric"
                />

                <Text>Selling Price</Text>
                <TextInput
                  style={styles.input}
                  value={editSubLiquor.sellingPrice}
                  onChangeText={(val) =>
                    setEditSubLiquor((p) => ({ ...p, sellingPrice: val }))
                  }
                  keyboardType="numeric"
                />

                <Text>In Stock</Text>
                <TextInput
                  style={styles.input}
                  value={editSubLiquor.inStock}
                  onChangeText={(val) =>
                    setEditSubLiquor((p) => ({ ...p, inStock: val }))
                  }
                  keyboardType="numeric"
                />

                {/* Icon buttons for Save/Cancel */}
                <View style={styles.iconButtonRow}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleSaveEdit}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={34}
                      color="green"
                    />
                    <Text>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={34}
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

// -----------------------------------
// STYLES
// -----------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  totalsContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  totalsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#dcdcdc",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#bbb",
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 13,
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 1,
    padding: 6,
    textAlign: "center",
    fontSize: 13,
    justifyContent: "center",
  },
  modalScroll: {
    flex: 1,
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  readonlyField: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f2f2f2",
    color: "#555",
  },
  input: {
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
