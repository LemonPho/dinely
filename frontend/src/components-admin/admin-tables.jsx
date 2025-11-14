import React, { useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function AdminTablesPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();

  // Mock data - no API calls
  const [tables, setTables] = useState([
    {
      id: 1,
      number: 1,
      capacity: 2,
      status: "available",
      location: "interior",
      notes: "",
    },
    {
      id: 2,
      number: 2,
      capacity: 4,
      status: "occupied",
      location: "interior",
      notes: "Vista a la ventana",
    },
    {
      id: 3,
      number: 3,
      capacity: 2,
      status: "available",
      location: "patio",
      notes: "",
    },
    {
      id: 4,
      number: 4,
      capacity: 6,
      status: "reserved",
      location: "interior",
      notes: "Mesa grande",
    },
    {
      id: 5,
      number: 5,
      capacity: 4,
      status: "available",
      location: "interior",
      notes: "",
    },
    {
      id: 6,
      number: 6,
      capacity: 2,
      status: "available",
      location: "patio",
      notes: "",
    },
    {
      id: 7,
      number: 7,
      capacity: 8,
      status: "occupied",
      location: "interior",
      notes: "Sección VIP",
    },
    {
      id: 8,
      number: 8,
      capacity: 4,
      status: "available",
      location: "interior",
      notes: "",
    },
  ]);

  const [editingTable, setEditingTable] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    capacity: "",
    status: "available",
    location: "interior",
    notes: "",
  });

  function handleTableClick(table) {
    setEditingTable(table);
    setIsCreating(false);
    setFormData({
      number: typeof table.number === 'number' ? table.number.toString() : table.number,
      capacity: table.capacity.toString(),
      status: table.status,
      location: table.location,
      notes: table.notes || "",
    });
    openModal(`edit-table-${table.id}`);
  }

  function handleCreateClick() {
    setEditingTable(null);
    setIsCreating(true);
    setFormData({
      number: "",
      capacity: "",
      status: "available",
      location: "interior",
      notes: "",
    });
    openModal("create-table");
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
      // Crear nueva mesa
      const newTable = {
        id: Math.max(...tables.map(t => t.id)) + 1,
        number: formData.number,
        capacity: parseInt(formData.capacity),
        status: formData.status,
        location: formData.location,
        notes: formData.notes,
      };
      setTables([...tables, newTable]);
    } else if (editingTable) {
      // Editar mesa existente
      const updatedTables = tables.map((table) =>
        table.id === editingTable.id
          ? {
              ...table,
              number: formData.number,
              capacity: parseInt(formData.capacity),
              status: formData.status,
              location: formData.location,
              notes: formData.notes,
            }
          : table
      );
      setTables(updatedTables);
    }

    closeModal();
    setEditingTable(null);
    setIsCreating(false);
  }

  function getStatusColor(status) {
    switch (status) {
      case "available":
        return "status-available";
      case "occupied":
        return "status-occupied";
      case "reserved":
        return "status-reserved";
      default:
        return "";
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "available":
        return "Disponible";
      case "occupied":
        return "Ocupada";
      case "reserved":
        return "Reservada";
      default:
        return status;
    }
  }

  function getLocationLabel(location) {
    switch (location) {
      case "interior":
        return "Interior";
      case "patio":
        return "Terraza";
      case "bar":
        return "Bar";
      default:
        return location;
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Gestionar Mesas</h1>
            <p>Ver y gestionar las mesas del restaurante</p>
          </div>
          <button
            className="admin-btn-primary"
            onClick={handleCreateClick}
          >
            Crear Mesa
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-tables-grid">
          {tables.map((table) => (
            <div
              key={table.id}
              className="admin-table-card"
              onClick={() => handleTableClick(table)}
            >
              <div className="admin-table-header">
                <h3>Mesa {table.number}</h3>
                <span className={`admin-table-status ${getStatusColor(table.status)}`}>
                  {getStatusLabel(table.status)}
                </span>
              </div>
              <div className="admin-table-details">
                <p>Capacidad: {table.capacity} personas</p>
                <p>Ubicación: {getLocationLabel(table.location)}</p>
                {table.notes && <p className="admin-table-notes">{table.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {(editingTable || isCreating) && (
        <Modal isOpen={openedModal === `edit-table-${editingTable?.id}` || openedModal === "create-table"}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{isCreating ? "Crear Nueva Mesa" : `Editar Mesa ${editingTable.number}`}</h2>
              <button
                className="admin-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label htmlFor="number">Código de Mesa</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                  placeholder="ej: A1, VIP-1, Mesa-5"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="capacity">Capacidad</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  max="20"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="status">Estado</label>
                <div className="dropdown-div">
                  <button
                    type="button"
                    className="admin-select-dropdown-button"
                    id="status-button"
                    onClick={(e) => toggleDropdown("status-dropdown")}
                  >
                    {formData.status === "available" ? (
                      <span>Disponible</span>
                    ) : formData.status === "occupied" ? (
                      <span>Ocupada</span>
                    ) : formData.status === "reserved" ? (
                      <span>Reservada</span>
                    ) : (
                      <span>Seleccionar estado...</span>
                    )}
                  </button>
                  <Dropdown isOpen={openedDropdown === "status-dropdown"}>
                    <ul
                      className="admin-select-dropdown-menu"
                      id="status-dropdown"
                      style={{ overflowY: "scroll", maxHeight: "15rem" }}
                    >
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "status", value: "available" },
                            });
                            closeDropdown();
                          }}
                        >
                          Disponible
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "status", value: "occupied" },
                            });
                            closeDropdown();
                          }}
                        >
                          Ocupada
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "status", value: "reserved" },
                            });
                            closeDropdown();
                          }}
                        >
                          Reservada
                        </a>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="location">Ubicación</label>
                <div className="dropdown-div">
                  <button
                    type="button"
                    className="admin-select-dropdown-button"
                    id="location-button"
                    onClick={(e) => toggleDropdown("location-dropdown")}
                  >
                    {formData.location === "interior" ? (
                      <span>Interior</span>
                    ) : formData.location === "patio" ? (
                      <span>Terraza</span>
                    ) : formData.location === "bar" ? (
                      <span>Bar</span>
                    ) : (
                      <span>Seleccionar ubicación...</span>
                    )}
                  </button>
                  <Dropdown isOpen={openedDropdown === "location-dropdown"}>
                    <ul
                      className="admin-select-dropdown-menu"
                      id="location-dropdown"
                      style={{ overflowY: "scroll", maxHeight: "15rem" }}
                    >
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "location", value: "interior" },
                            });
                            closeDropdown();
                          }}
                        >
                          Interior
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "location", value: "patio" },
                            });
                            closeDropdown();
                          }}
                        >
                          Terraza
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "location", value: "bar" },
                            });
                            closeDropdown();
                          }}
                        >
                          Bar
                        </a>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>

              <div className="admin-form-group full-width">
                <label htmlFor="notes">Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Notas adicionales sobre esta mesa..."
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
