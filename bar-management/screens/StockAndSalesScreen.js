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
  ImageBackground,
  Dimensions,
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

  // Sum (dozen * quantityFields)
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
  const calcInStockBalance = (inStock, sellingPrice) =>
    inStock * sellingPrice;

  // Convert each subLiquor
  const getStockSalesRow = (sub) => {
    const buyingPrice = parseFloat(sub.buyingPrice) || 0;
    const sellingPrice = parseFloat(sub.sellingPrice) || 0;
    const inStock = parseFloat(sub.inStock) || 0;

    const pStockTotal = calcPurchasingStockTotal(sub); // Should be equal to previous inStock
    const soldItems = calcSoldItems(pStockTotal, inStock);
    const sale = calcSale(soldItems, sellingPrice);
    const inStockBalance = calcInStockBalance(inStock, sellingPrice);

    return {
      id: sub.id,
      name: sub.name,
      ml: sub.ml,
      buyingPrice,
      sellingPrice,
      purchasingStockTotal: pStockTotal,
      soldItems,
      inStock,
      sale,
      inStockBalance,
    };
  };

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

  // Edit
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
    if (
      !buyingPrice.trim() ||
      !sellingPrice.trim() ||
      !inStock.trim()
    ) {
      Alert.alert(
        "Required Fields",
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

    Alert.alert("Success", "Stock & Sales information updated!");
    setEditModalVisible(false);
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>
          Category not found or loading...
        </Text>
      </View>
    );
  }

  // Table Header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 1.2, textAlign: "left" }]}>Name</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>ML</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Buy Price (Rs)</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Sell Price (Rs)</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>P. Stock T.</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Sold</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>In Stock</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Sale (Rs)</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>InStk Bal (Rs)</Text>
      <Text style={[styles.headerCell, { flex: 0.8, textAlign: "center" }]}>Edit</Text>
    </View>
  );

  // Table Row
  const renderRow = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.evenRow : styles.oddRow, // Apply alternate row colors
      ]}
    >
      <Text style={[styles.cell, { flex: 1.2, textAlign: "left" }]}>{item.name}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.ml}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.buyingPrice.toFixed(2)}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.sellingPrice.toFixed(2)}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.purchasingStockTotal}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.soldItems}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.inStock}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.sale.toFixed(2)}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.inStockBalance.toFixed(2)}</Text>

      <View
        style={[
          styles.cell,
          { flex: 0.8, alignItems: "center" },
        ]}
      >
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          accessibilityLabel={`Edit ${item.name} Stock and Sales`}
          accessibilityHint={`Opens the edit modal for ${item.name}`}
        >
          <Ionicons name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("../assets/cat1.jpg")} // Ensure this image exists in your assets folder
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="stats-chart-outline" size={40} color="#4CAF50" />
          <Text style={styles.heading}>Stock & Sales</Text>
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <Text style={styles.totalsText}>
            Total Sale: Rs {totalSale.toFixed(2)}
          </Text>
          <Text style={styles.totalsText}>
            Total In Stock: Rs {totalInStockVal.toFixed(2)}
          </Text>
        </View>

        {/* Liquor Information Table */}
        <ScrollView horizontal>
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            {subLiquorRows.length > 0 ? (
              <FlatList
                data={subLiquorRows}
                keyExtractor={(item) => item.id}
                renderItem={renderRow}
              />
            ) : (
              <View style={styles.emptyTableContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={50}
                  color="#ccc"
                />
                <Text style={styles.emptyTableText}>
                  No Stock & Sales Data Available.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* EDIT MODAL */}
        <Modal
          visible={editModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <View style={styles.modalContent}>
                {editSubLiquor && (
                  <>
                    <Text style={styles.modalHeading}>
                      Edit Stock & Sales
                    </Text>

                    {/* Buying Price */}
                    <Text style={styles.modalLabel}>
                      <Ionicons
                        name="cash-outline"
                        size={18}
                        color="#555"
                      />{" "}
                      Buying Price (Rs)
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={editSubLiquor.buyingPrice}
                      onChangeText={(val) =>
                        setEditSubLiquor((p) => ({
                          ...p,
                          buyingPrice: val,
                        }))
                      }
                      keyboardType="numeric"
                      placeholder="Enter Buying Price"
                      accessibilityLabel="Buying Price Input"
                      accessibilityHint="Enter the buying price of the liquor"
                    />

                    {/* Selling Price */}
                    <Text style={styles.modalLabel}>
                      <Ionicons
                        name="cash-outline"
                        size={18}
                        color="#555"
                      />{" "}
                      Selling Price (Rs)
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={editSubLiquor.sellingPrice}
                      onChangeText={(val) =>
                        setEditSubLiquor((p) => ({
                          ...p,
                          sellingPrice: val,
                        }))
                      }
                      keyboardType="numeric"
                      placeholder="Enter Selling Price"
                      accessibilityLabel="Selling Price Input"
                      accessibilityHint="Enter the selling price of the liquor"
                    />

                    {/* In Stock */}
                    <Text style={styles.modalLabel}>
                      <Ionicons
                        name="archive-outline"
                        size={18}
                        color="#555"
                      />{" "}
                      In Stock
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={editSubLiquor.inStock}
                      onChangeText={(val) =>
                        setEditSubLiquor((p) => ({
                          ...p,
                          inStock: val,
                        }))
                      }
                      keyboardType="numeric"
                      placeholder="Enter In Stock Quantity"
                      accessibilityLabel="In Stock Input"
                      accessibilityHint="Enter the current stock quantity of the liquor"
                    />

                    {/* Save and Cancel Buttons */}
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        style={[styles.modalButton, styles.saveButton]}
                        accessibilityLabel="Save Changes"
                        accessibilityHint="Saves the edited stock and sales information"
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.modalButtonText}>Save</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setEditModalVisible(false)}
                        style={[styles.modalButton, styles.cancelButton]}
                        accessibilityLabel="Cancel Editing"
                        accessibilityHint="Closes the edit modal without saving changes"
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={20}
                          color="#fff"
                        />
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

const screenWidth = Dimensions.get("window").width;

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
    color: "black",
  },
  totalsContainer: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#f1f8e9",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tableContainer: {
    minWidth: 1300, // Adjust based on content
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
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
  evenRow: {
    backgroundColor: "#f9f9f9", // Light gray for even rows
  },
  oddRow: {
    backgroundColor: "#fff", // White for odd rows
  },
  cell: {
    flex: 1,
    padding: 6,
    textAlign: "center",
    fontSize: 14,
    color: "#555",
  },
  notFoundText: {
    fontSize: 18,
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
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
