// src/api/users.js

const BASE_URL = "http://192.168.1.74:3000";

export async function getUser(userId) {
  try {
    const id = String(userId);
    const res = await fetch(`${BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error("Error al obtener usuario");
    return await res.json();
  } catch (e) {
    console.log("Error en getUser:", e);
    return null;
  }
}

export async function updateUser(userId, data) {
  try {
    const id = String(userId);
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar usuario");
    return await res.json();
  } catch (e) {
    console.log("Error en updateUser:", e);
    return null;
  }
}
