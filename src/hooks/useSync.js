// src/hooks/useSync.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { getUser, updateUser } from "../users";

const LOCAL_KEY = "user_data_";

export default function useSync(userId) {
  const [data, setData] = useState(null);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Detectar conexión a internet
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected);
    });
    return () => unsub();
  }, []);

  // Cargar datos locales + remotos
  useEffect(() => {
    async function load() {
      try {
        const localRaw = await AsyncStorage.getItem(LOCAL_KEY + userId);
        const local = localRaw ? JSON.parse(localRaw) : null;

        // Si no hay internet → usar datos locales
        if (!online) {
          setData(local);
          return;
        }

        // Obtener remoto
        const remote = await getUser(userId);

        if (!remote) {
          setData(local);
          return;
        }

        // Comparar timestamps
        if (!local || remote.updatedAt > local.updatedAt) {
          setData(remote);
          await AsyncStorage.setItem(LOCAL_KEY + userId, JSON.stringify(remote));
        } else {
          setData(local);
          await updateUser(userId, local);
        }
      } catch (e) {
        console.log("Error en load():", e);
      }
    }

    load();
  }, [userId, online]);

  // 🔁 AUTO-UPDATE cada 2 segundos
  useEffect(() => {
    if (!online || !data) return;

    const interval = setInterval(async () => {
      const remote = await getUser(userId);

      if (remote && remote.updatedAt > data.updatedAt) {
        setData(remote);
        await AsyncStorage.setItem(LOCAL_KEY + userId, JSON.stringify(remote));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userId, online, data]);

  // Guardar cambios
  async function saveChanges(field, value) {
    const updated = {
      ...data,
      [field]: value,
      updatedAt: Date.now(),
    };

    setData(updated);
    await AsyncStorage.setItem(LOCAL_KEY + userId, JSON.stringify(updated));

    if (online) {
      setSyncing(true);
      await updateUser(userId, updated);
      setSyncing(false);
    }
  }

  return { data, saveChanges, online, syncing };
}
