import { StyleSheet, Text, TextInput, View } from "react-native";
import useSync from "../hooks/useSync";

export default function UserForm({ userId }) {
  const { data, saveChanges, syncing, online } = useSync(userId);

  if (!data) return <Text>Cargando usuario {userId}...</Text>;

  return (
    <View>
      <Text style={styles.title}>Usuario {userId}</Text>

      {syncing && <Text style={styles.sync}>🔄 Sincronizando…</Text>}
      {!online && <Text style={styles.offline}>⚠ Modo sin internet</Text>}

      <TextInput
        style={styles.input}
        value={data.name}
        onChangeText={(t) => saveChanges("name", t)}
        placeholder="Nombre"
      />

      <TextInput
        style={styles.input}
        value={String(data.age || "")}
        onChangeText={(t) => saveChanges("age", Number(t))}
        placeholder="Edad"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={String(data.height || "")}
        onChangeText={(t) => saveChanges("height", Number(t))}
        placeholder="Altura"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={String(data.weight || "")}
        onChangeText={(t) => saveChanges("weight", Number(t))}
        placeholder="Peso"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={data.bloodType || ""}
        onChangeText={(t) => saveChanges("bloodType", t)}
        placeholder="Tipo de sangre"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sync: { color: "#007AFF" },
  offline: { color: "red" },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
});
