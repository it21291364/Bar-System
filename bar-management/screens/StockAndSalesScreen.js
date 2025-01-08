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

  /**************************************
   * CALCULATION UTILITIES
   **************************************/
  // Calculate Purchasing Stock Total
  const calcPurchasingStockTotal = (sub) => {
    const dozen = parseFloat(sub.dozen) || 0;
    const quantityFields = Array.isArray(sub.quantityFields)
      ? sub.quantityFields
      : [];
    return quantityFields.reduce((acc, q) => acc + dozen * q, 0);
  };

  // Calculate how many items sold
  const calcSoldItems = (pStockTotal, inStock) => {
    const sold = pStockTotal - inStock;
    return sold < 0 ? 0 : sold;
  };

  // Calculate total sale for subLiquor
  const calcSale = (soldItems, sellingPrice) => soldItems * sellingPrice;
  // Calculate inStockBalance for subLiquor
  const calcInStockBalance = (inStock, sellingPrice) => inStock * sellingPrice;

  /**************************************
   * BUILD ROW DATA
   **************************************/
  const getStockSalesRow = (sub) => {
    const buyingPrice = parseFloat(sub.buyingPrice) || 0;
    const sellingPrice = parseFloat(sub.sellingPrice) || 0;
    const inStock = parseFloat(sub.inStock) || 0;

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
      purchasingStockTotal: pStockTotal,
      soldItems,
      inStock,
      sale,
      inStockBalance,
    };
  };

  /**************************************
   * COMPUTE TOTALS
   **************************************/
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

  /**************************************
   * EDIT MODAL HANDLERS
   **************************************/
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

    // Basic validation
    if (!buyingPrice.trim() || !sellingPrice.trim() || !inStock.trim()) {
      Alert.alert(
        "Required Fields",
        "Buying Price, Selling Price, and In Stock are required."
      );
      return;
    }

    // Convert to numbers
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

  /**************************************
   * TABLE HEADER & ROW RENDERERS
   **************************************/
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 1.5, textAlign: "left" }]}>Name</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>ML</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Buy Price</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Sell Price</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>P.Stock</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Sold</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>In Stock</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>Sale</Text>
      <Text style={[styles.headerCell, { textAlign: "right" }]}>InStkBal</Text>
      <Text style={[styles.headerCell, { flex: 0.8, textAlign: "center" }]}>Edit</Text>
    </View>
  );

  const renderRow = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
    >
      <Text style={[styles.cell, { flex: 1.5, textAlign: "left" }]}>{item.name}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.ml}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>
        {item.buyingPrice.toFixed(2)}
      </Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>
        {item.sellingPrice.toFixed(2)}
      </Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>
        {item.purchasingStockTotal}
      </Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.soldItems}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>{item.inStock}</Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>
        {item.sale.toFixed(2)}
      </Text>
      <Text style={[styles.cell, { textAlign: "right" }]}>
        {item.inStockBalance.toFixed(2)}
      </Text>
      <View style={[styles.cell, { flex: 0.8, alignItems: "center" }]}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </View>
  );

  /**************************************
   * RENDER: IF NO CATEGORY
   **************************************/
  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Category not found or loading...</Text>
      </View>
    );
  }

  /**************************************
   * MAIN RENDER
   **************************************/
  return (
    <ImageBackground
      source={require("../assets/cat1.jpg")} // Ensure you have this image in assets
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="stats-chart-outline" size={38} color="#2E7D32" />
          <Text style={styles.heading}>Stock & Sales</Text>
        </View>

        {/* TOTALS SECTION */}
        <View style={styles.totalsContainer}>
          <Text style={styles.totalsText}>
            <Ionicons name="cash-outline" size={16} color="#555" />
            {"  "}Total Sale:{" "}
            <Text style={styles.totalsValue}>{totalSale.toFixed(2)}</Text>
          </Text>
          <Text style={styles.totalsText}>
            <Ionicons name="archive-outline" size={16} color="#555" />
            {"  "}In Stock Value:{" "}
            <Text style={styles.totalsValue}>{totalInStockVal.toFixed(2)}</Text>
          </Text>
        </View>

        {/* TABLE SCROLLING (HORIZONTAL + NESTED VERTICAL) */}
        <ScrollView
          horizontal
          style={{ marginTop: 8 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.tableContainer}>
            {renderTableHeader()}

            <FlatList
              data={subLiquorRows}
              keyExtractor={(item) => item.id}
              renderItem={renderRow}
              nestedScrollEnabled={true}
            />
          </View>
        </ScrollView>

        {/* EDIT MODAL */}
        <Modal
          visible={editModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            {/* Single ScrollView for content */}
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                {editSubLiquor && (
                  <>
                    <Text style={styles.modalHeading}>Edit Stock & Sales</Text>

                    {/* Buying Price */}
                    <Text style={styles.modalLabel}>
                      <Ionicons name="cash-outline" size={18} color="#555" />{" "}
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
                    />

                    {/* Selling Price */}
                    <Text style={styles.modalLabel}>
                      <Ionicons name="pricetag-outline" size={18} color="#555" />{" "}
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
                    />

                    {/* In Stock */}
                    <Text style={styles.modalLabel}>
                      <Ionicons name="cube-outline" size={18} color="#555" />{" "}
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
                    />

                    {/* BUTTONS */}
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        style={[styles.modalButton, styles.saveButton]}
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
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

/*********************************************
 * STYLES
 *********************************************/
const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)", // A slightly less opaque overlay
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
    marginLeft: 8,
    color: "#2E7D32",
  },
  totalsContainer: {
    backgroundColor: "#e8f5e9",
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 12,
  },
  totalsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  tableContainer: {
    minWidth: 1300,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  notFoundText: {
    fontSize: 18,
    color: "#F44336",
    textAlign: "center",
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
    elevation: 5,
  },
  modalScroll: {
    paddingBottom: 20, // extra spacing if content overflows
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
    marginTop: 24,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
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
