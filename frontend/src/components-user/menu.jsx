import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import Messages from "../util-components/messages.jsx";
import "../styles/global.css";
import "../styles/admin.css";
import { getPlates } from "../fetch/shared.jsx";

export default function Menu() {
  const { setErrorMessage, resetMessages } = useMessagesContext();
  const [plates, setPlates] = useState({});

  function groupPlatesByCategory(plates) {
    // Organizar los platillos por categoría
    const platesByCategory = {};
    plates.forEach((plate) => {
      const categoryLabel = plate.category?.label || "Sin categoría";
      if (!platesByCategory[categoryLabel]) {
        platesByCategory[categoryLabel] = [];
      }
      platesByCategory[categoryLabel].push(plate);
    });
    return platesByCategory;
  }

  async function retrievePlates() {
    resetMessages();
    const apiResponse = await getPlates();
    if (apiResponse.status === 200) {
      const platesByCategory = groupPlatesByCategory(apiResponse.plates);
      setPlates(platesByCategory);
    } else {
      setErrorMessage("Hubo un error al obtener los platillos");
    }
  }

  useEffect(() => {
    retrievePlates();
  }, []);

  const totalPlatesCount = Object.values(plates).reduce((sum, catPlates) => sum + (catPlates?.length || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Menú Dinely</h1>
            <p>Elige qué se te antoja hoy</p>
          </div>
        </div>
      </div>

      <Messages />

      <div>
        {Object.keys(plates).map((category) => (
          <div key={category} className="admin-content-card" style={{ marginBottom: "2rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ marginBottom: "0.5rem" }}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h2>
              <p style={{ color: "#666", fontSize: "0.95rem" }}>
                {category === "entrada"
                  ? "Para abrir el apetito"
                  : category === "platillo"
                  ? "El plato fuerte de tu visita"
                  : category === "bebida"
                  ? "Para acompañar cada bocado"
                  : ""}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {plates[category].map((plate) => (
                <div
                  key={plate.id}
                  style={{
                    padding: "1rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: "0.25rem", marginTop: 0 }}>
                      {plate.name}
                    </h3>
                    {plate.description && (
                      <p style={{ color: "#666", fontSize: "0.9rem", margin: 0 }}>
                        {plate.description}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#2563eb",
                      whiteSpace: "nowrap",
                      marginLeft: "1rem",
                    }}
                  >
                    ${plate.price} MXN
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {totalPlatesCount === 0 && (
          <div className="admin-content-card" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            No hay platillos disponibles en este momento
          </div>
        )}
      </div>

      {/* BOTÓN VOLVER AL INICIO */}
      <div className="back-home-container">
        <Link to="/" className="btn-back-home">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}