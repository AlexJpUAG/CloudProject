// src/screens/UserSelectScreen.js
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import UserScreen from "./UserScreen";

export default function UserSelectScreen() {
  const [selectedUser, setSelectedUser] = useState(null);

  if (selectedUser) {
    return <UserScreen userId={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un usuario</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelectedUser(1)}
      >
        <Text style={styles.buttonText}>Usuario 1</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelectedUser(2)}
      >
        <Text style={styles.buttonText}>Usuario 2</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 10,
    marginVertical: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});
