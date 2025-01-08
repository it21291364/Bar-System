// screens/LoginScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Import the background image
const backgroundImage = require("../assets/bg.jpg"); // Adjust the path as needed

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "6699") {
      onLogin(); // Notify App.js about successful login
    } else {
      Alert.alert("Invalid Password", "Please enter the correct password.");
      setPassword("");
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.innerContainer}>
            <Ionicons name="lock-closed-outline" size={100} color="#fff" />
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Please enter your password to continue.</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={24} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                placeholderTextColor="#ddd"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                keyboardType="numeric"
                maxLength={4}
                accessible={true}
                accessibilityLabel="Password Input"
                accessibilityHint="Enter the 4-digit password"
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              accessibilityLabel="Login Button"
              accessibilityHint="Attempts to log you into the app"
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Copyright 2025 © Nukara Solutions. All Rights Reserved.</Text>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  innerContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 20,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: "#fff",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
