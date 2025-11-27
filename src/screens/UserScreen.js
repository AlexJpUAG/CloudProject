// src/screens/UserScreen.js
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import UserForm from "../components/UserForm";

export default function UserScreen({ userId, onBack }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Usuario {userId}</Text>

      <UserForm userId={userId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
