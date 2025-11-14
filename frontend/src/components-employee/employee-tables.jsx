import React, { useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeTablesPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();

  // Mock data - empleado actual
  const currentEmployee = "mesero1";

  // Mock data - mesas disponibles
  const [tables] = useState([
    {
      id: 1,
      number: 1,
      capacity: 2,
      status: "available",
      location: "interior",
    },
    {
      id: 3,
      number: 3,
      capacity: 2,
      status: "available",
      location: "patio",
    },
    {
      id: 5,
      number: 5,
      capacity: 4,
      status: "available",
      location: "interior",
    },
    {
      id: 6,
      number: 6,
      capacity: 2,
      status: "available",
      location: "patio",
    },
    {
      id: 8,
      number: 8,
      capacity: 4,
      status: "available",
      location: "interior",
    },
  ]);

  // Mock data - reservaciones próximas
  const [reservations, setReservations] = useState([
    {
      id: 1,
      code: "DIN-ABC123",
      customerName: "Juan Pérez",
      date: "2024-01-20",
      time: "19:00",
      partySize: 4,
      zone: "interior",
      tableNumber: "5",
      status: "active",
      arrived: false,
    },
    {
      id: 2,
      code: "DIN-XYZ789",
      customerName: "María García",
      date: "2024-01-20",
      time: "19:30",
      partySize: 2,
      zone: "patio",
      tableNumber: "12",
      status: "active",
      arrived: false,
    },
    {
      id: 3,
      code: "DIN-DEF456",
      customerName: "Carlos López",
      date: "2024-01-21",
      time: "20:00",
      partySize: 6,
      zone: "interior",
      tableNumber: "8",
      status: "active",
      arrived: false,
    },
  ]);

  const [assigningTable, setAssigningTable] = useState(null);
  const [assignFormData, setAssignFormData] = useState({
    customerName: "",
    partySize: "",
  });

  const availableTables = tables.map(t => t.number.toString());

  // Agrupar mesas por ubicación
  const tablesByLocation = tables.reduce((acc, table) => {
    const location = table.location;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(table);
    return acc;
  }, {});

  // Orden de las secciones
  const locationOrder = ["interior", "patio", "bar"];

  function handleAssignTable(table) {
    setAssigningTable(table);
    setAssignFormData({
      customerName: "",
      partySize: "",
    });
    openModal(`assign-table-${table.id}`);
  }

  function handleAssignSubmit(e) {
    e.preventDefault();
    
    // Crear nueva cuenta para el cliente
    const newAccount = {
      id: Date.now(),
      code: `CTA-${String(Date.now()).slice(-6)}`,
      tableNumber: assigningTable.number.toString(),
      waiterName: currentEmployee,
      total: 0,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      status: "current",
      items: [],
    };

    // Aquí se haría la llamada a la API
    alert(`Cliente ${assignFormData.customerName} asignado a Mesa ${assigningTable.number}`);
    
    closeModal();
    setAssigningTable(null);
    setAssignFormData({
      customerName: "",
      partySize: "",
    });
  }

  function handleAssignFormChange(e) {
    const { name, value } = e.target;
    setAssignFormData({
      ...assignFormData,
      [name]: value,
    });
  }

  function handleMarkArrived(reservation) {
    setReservations(
      reservations.map((r) =>
        r.id === reservation.id ? { ...r, arrived: true } : r
      )
    );
    alert(`Reservación ${reservation.code} marcada como llegada`);
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
        <div>
          <h1>Mesas Disponibles</h1>
          <p>Gestionar asignación de clientes a mesas</p>
        </div>
      </div>

      <div className="admin-content-card">
        <h2>Mesas Disponibles</h2>
        {locationOrder.map((location) => {
          const locationTables = tablesByLocation[location] || [];
          if (locationTables.length === 0) return null;

          return (
            <div key={location} style={{ marginBottom: "2.5rem" }}>
              <h3 style={{ 
                fontSize: "1.1rem", 
                fontWeight: 600, 
                color: "var(--color-text)", 
                marginBottom: "1rem",
                paddingBottom: "0.5rem",
                borderBottom: "2px solid var(--color-bg)"
              }}>
                {getLocationLabel(location)}
              </h3>
              <div className="admin-tables-grid">
                {locationTables.map((table) => (
                  <div
                    key={table.id}
                    className="admin-table-card"
                    onClick={() => handleAssignTable(table)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="admin-table-header">
                      <h3>Mesa {table.number}</h3>
                      <span className="admin-table-status status-available">
                        Disponible
                      </span>
                    </div>
                    <div className="admin-table-details">
                      <p>Capacidad: {table.capacity} personas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-content-card">
        <h2>Reservaciones Próximas</h2>
        <div className="admin-reservations-list-vertical">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="admin-reservation-row-item"
            >
              <div className="admin-reservation-row-left">
                <span className="admin-reservation-row-code">{reservation.code}</span>
                <h3>{reservation.customerName}</h3>
                <span className="admin-reservation-row-info">
                  {reservation.date} · {reservation.time} · Mesa {reservation.tableNumber} · {reservation.partySize} personas · {getLocationLabel(reservation.zone)}
                </span>
              </div>
              <div className="admin-reservation-row-right">
                {reservation.arrived ? (
                  <span className="admin-table-status status-reserved">
                    Llegó
                  </span>
                ) : (
                  <button
                    className="admin-btn-primary"
                    onClick={() => handleMarkArrived(reservation)}
                    style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                  >
                    Marcar como Llegado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para asignar cliente a mesa */}
      {assigningTable && (
        <Modal isOpen={openedModal === `assign-table-${assigningTable.id}`}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Asignar Cliente a Mesa {assigningTable.number}</h2>
              <button
                className="admin-modal-close"
                onClick={() => {
                  closeModal();
                  setAssigningTable(null);
                }}
              >
                ×
              </button>
            </div>
            <form className="admin-modal-form" onSubmit={handleAssignSubmit}>
              <div className="admin-form-group">
                <label htmlFor="customerName">Nombre del Cliente</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={assignFormData.customerName}
                  onChange={handleAssignFormChange}
                  required
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="partySize">Número de Personas</label>
                <input
                  type="number"
                  id="partySize"
                  name="partySize"
                  value={assignFormData.partySize}
                  onChange={handleAssignFormChange}
                  required
                  min="1"
                  max={assigningTable.capacity}
                  placeholder={`Máximo ${assigningTable.capacity} personas`}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="tableNumber">Mesa</label>
                <input
                  type="text"
                  id="tableNumber"
                  value={`Mesa ${assigningTable.number} - ${getLocationLabel(assigningTable.location)}`}
                  disabled
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    closeModal();
                    setAssigningTable(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                >
                  Asignar Cliente
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

