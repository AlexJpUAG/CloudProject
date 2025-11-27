import { ScrollView, StyleSheet, Text, View } from "react-native";
import UserForm from "../components/UserForm";

export default function TwoUsersScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sincronización entre dos usuarios</Text>

      <View style={styles.userBox}>
        <Text style={styles.userLabel}>Usuario 1</Text>
        <UserForm userId={1} />
      </View>

      <View style={styles.userBox}>
        <Text style={styles.userLabel}>Usuario 2</Text>
        <UserForm userId={2} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  userBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  userLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
