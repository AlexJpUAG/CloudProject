// app/(tabs)/index.tsx
import { View } from "react-native";
import UserSelectScreen from "../../src/screens/UserSelectScreen";

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <UserSelectScreen />
    </View>
  );
}
