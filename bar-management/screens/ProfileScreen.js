// screens/ProfileScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Image,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Import images
const backgroundImage = require("../assets/cat.jpg"); // Adjust the path as needed
const defaultProfile = require("../assets/pf.png"); // Adjust the path as needed

export default function ProfileScreen({ handleLogout }) {
  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: handleLogout }, // Trigger handleLogout
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Password change feature coming soon!");
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Image source={defaultProfile} style={styles.profileImage} />
          <Text style={styles.title}>Profile</Text>

          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Ionicons name="key-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Copyright 2022 © NUKARA SOLUTION. All Rights Reserved.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4CAF50",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    justifyContent: "center",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
  footer: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
});
