import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import Messages from "../util-components/messages.jsx";
import "../styles/global.css";
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

  function getCategoryDescription(category) {
    const descriptions = {
      entrada: "Para abrir el apetito",
      platillo: "El plato fuerte de tu visita",
      comida: "El plato fuerte de tu visita",
      bebida: "Para acompañar cada bocado",
    };
    return descriptions[category.toLowerCase()] || "";
  }

  function getCategoryColor(category) {
    const colors = {
      entrada: { bg: "#ffe9c7", color: "#c56a1a" },
      platillo: { bg: "#fde2ff", color: "#9b4d96" },
      comida: { bg: "#fde2ff", color: "#9b4d96" },
      bebida: { bg: "#dff6ff", color: "#0b7285" },
    };
    return colors[category.toLowerCase()] || { bg: "#f3f4f6", color: "#4b5563" };
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
    <section className="menu-page">
      <div className="container">
        <Messages />

        {/* ENCABEZADO */}
        <header className="menu-header">
          <p className="menu-eyebrow">Menú Dinely</p>
          <h1>Elige qué se te antoja hoy</h1>
          <p>
            Te presentamos una selección de entradas, platos fuertes y
            bebidas, pensada para que tu visita a Dinely sea completa de
            principio a fin.
          </p>
        </header>

        {/* CATEGORÍAS Y PLATILLOS */}
        {Object.keys(plates).map((category) => {
          const categoryColor = getCategoryColor(category);
          const description = getCategoryDescription(category);
          return (
            <section key={category} className="menu-row" style={{ marginBottom: "2.5rem" }}>
              <div className="menu-info">
                <span
                  className="menu-label"
                  style={{
                    backgroundColor: categoryColor.bg,
                    color: categoryColor.color,
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                <ul className="menu-list">
                  {plates[category].map((plate) => (
                    <li key={plate.id}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span>{plate.name}</span>
                        {plate.description && (
                          <span style={{ fontSize: "0.85rem", color: "var(--color-text-soft)", fontWeight: 400 }}>
                            {plate.description}
                          </span>
                        )}
                      </div>
                      <span>${plate.price.toFixed(2)} MXN</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

        {totalPlatesCount === 0 && (
          <div className="menu-header" style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "var(--color-text-soft)", fontSize: "1rem" }}>
              No hay platillos disponibles en este momento
            </p>
          </div>
        )}

        {/* BOTÓN VOLVER AL INICIO */}
        <div className="back-home-container">
          <Link to="/" className="btn-back-home">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}