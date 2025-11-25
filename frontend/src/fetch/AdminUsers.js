// frontend/fetch/AdminUsers.js

export async function fetchUsers() {
  try {
    const res = await fetch("http://localhost:8000/api/admin/list-users/", {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Error en la petición", res.status);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("Error al conectar con el servidor:", err);
    return [];
  }
}
