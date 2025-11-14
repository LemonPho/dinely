import React, { useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function AdminPlatesPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();

  // Mock data - no API calls
  const [plates, setPlates] = useState([
    {
      id: 1,
      name: "Guacamole con totopos",
      price: 115,
      category: "entrada",
      description: "",
    },
    {
      id: 2,
      name: "Papas fritas con cheddar",
      price: 120,
      category: "entrada",
      description: "",
    },
    {
      id: 3,
      name: "Bruschettas con jitomate y albahaca",
      price: 130,
      category: "entrada",
      description: "",
    },
    {
      id: 4,
      name: "Pollo a la parrilla con verduras",
      price: 210,
      category: "comida",
      description: "",
    },
    {
      id: 5,
      name: "Hamburguesa gourmet Dinely",
      price: 190,
      category: "comida",
      description: "",
    },
    {
      id: 6,
      name: "Pasta al pesto",
      price: 185,
      category: "comida",
      description: "",
    },
    {
      id: 7,
      name: "Limonada natural",
      price: 55,
      category: "bebida",
      description: "",
    },
    {
      id: 8,
      name: "Smoothie de fresa",
      price: 70,
      category: "bebida",
      description: "",
    },
    {
      id: 9,
      name: "Café latte",
      price: 60,
      category: "bebida",
      description: "",
    },
  ]);

  const [editingPlate, setEditingPlate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "entrada",
    description: "",
  });

  function handlePlateClick(plate) {
    setEditingPlate(plate);
    setIsCreating(false);
    setFormData({
      name: plate.name,
      price: plate.price.toString(),
      category: plate.category,
      description: plate.description || "",
    });
    openModal(`edit-plate-${plate.id}`);
  }

  function handleCreateClick() {
    setEditingPlate(null);
    setIsCreating(true);
    setFormData({
      name: "",
      price: "",
      category: "entrada",
      description: "",
    });
    openModal("create-plate");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (isCreating) {
      // Crear nuevo platillo
      const newPlate = {
        id: Math.max(...plates.map(p => p.id)) + 1,
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
      };
      setPlates([...plates, newPlate]);
    } else if (editingPlate) {
      // Editar platillo existente
      const updatedPlates = plates.map((plate) =>
        plate.id === editingPlate.id
          ? {
              ...plate,
              name: formData.name,
              price: parseFloat(formData.price),
              category: formData.category,
              description: formData.description,
            }
          : plate
      );
      setPlates(updatedPlates);
    }

    closeModal();
    setEditingPlate(null);
    setIsCreating(false);
  }

  function getCategoryLabel(category) {
    switch (category) {
      case "entrada":
        return "Entrada";
      case "comida":
        return "Comida";
      case "bebida":
        return "Bebida";
      default:
        return category;
    }
  }

  function getCategoryColor(category) {
    switch (category) {
      case "entrada":
        return "category-entrada";
      case "comida":
        return "category-comida";
      case "bebida":
        return "category-bebida";
      default:
        return "";
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Gestionar Platillos</h1>
            <p>Ver y gestionar los elementos del menú</p>
          </div>
          <button
            className="admin-btn-primary"
            onClick={handleCreateClick}
          >
            Crear Platillo
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-tables-grid">
          {plates.map((plate) => (
            <div
              key={plate.id}
              className="admin-table-card"
              onClick={() => handlePlateClick(plate)}
            >
              <div className="admin-table-header">
                <h3>{plate.name}</h3>
                <span className={`admin-table-status ${getCategoryColor(plate.category)}`}>
                  {getCategoryLabel(plate.category)}
                </span>
              </div>
              <div className="admin-table-details">
                <p>Precio: ${plate.price} MXN</p>
                {plate.description && <p className="admin-table-notes">{plate.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {(editingPlate || isCreating) && (
        <Modal isOpen={openedModal === `edit-plate-${editingPlate?.id}` || openedModal === "create-plate"}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{isCreating ? "Crear Nuevo Platillo" : `Editar Platillo`}</h2>
              <button
                className="admin-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="admin-form-group full-width">
                <label htmlFor="name">Nombre del Platillo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="ej: Guacamole con totopos"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="price">Precio (MXN)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="category">Categoría</label>
                <div className="dropdown-div">
                  <button
                    type="button"
                    className="admin-select-dropdown-button"
                    id="category-button"
                    onClick={(e) => toggleDropdown("category-dropdown")}
                  >
                    {formData.category === "entrada" ? (
                      <span>Entrada</span>
                    ) : formData.category === "comida" ? (
                      <span>Comida</span>
                    ) : formData.category === "bebida" ? (
                      <span>Bebida</span>
                    ) : (
                      <span>Seleccionar categoría...</span>
                    )}
                  </button>
                  <Dropdown isOpen={openedDropdown === "category-dropdown"}>
                    <ul
                      className="admin-select-dropdown-menu"
                      id="category-dropdown"
                      style={{ overflowY: "scroll", maxHeight: "15rem" }}
                    >
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "category", value: "entrada" },
                            });
                            closeDropdown();
                          }}
                        >
                          Entrada
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "category", value: "comida" },
                            });
                            closeDropdown();
                          }}
                        >
                          Comida
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "category", value: "bebida" },
                            });
                            closeDropdown();
                          }}
                        >
                          Bebida
                        </a>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>

              <div className="admin-form-group full-width">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Descripción del platillo (opcional)..."
                />
              </div>

              <div className="admin-form-actions full-width">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
