import React, { useEffect, useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import { getTableAreas, getTables, getWaiterReservations, assignTableToReservation } from "../fetch/shared";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeTablesPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();

  const [tables, setTables] = useState({});
  const [tableAreas, setTableAreas] = useState([]);
  const [flatTables, setFlatTables] = useState([]);

  const [assigningTable, setAssigningTable] = useState(null);
  const [assignFormData, setAssignFormData] = useState({
    customerName: "",
    partySize: "",
  });

  // Reservations state
  const [reservations, setReservations] = useState([]);
  const [assigningReservation, setAssigningReservation] = useState(null);
  const [reservationTableFormData, setReservationTableFormData] = useState({
    tableCode: "",
  });
  const [reservationError, setReservationError] = useState(null);

  function groupTablesByArea(tables) {
    // Organizar las mesas por área
    // Las mesas ya vienen ordenadas por área desde el backend
    const tablesByArea = {};
    tables.forEach((table) => {
      const areaLabel = table.area?.label || "Sin área";
      if (!tablesByArea[areaLabel]) {
        tablesByArea[areaLabel] = [];
      }
      tablesByArea[areaLabel].push(table);
    });
    return tablesByArea;
  }

  async function retrieveTableAreas() {
    const apiResponse = await getTableAreas();
    if (apiResponse.status === 200) {
      setTableAreas(apiResponse.tableAreas);
    }
  }

  async function retrieveTables() {
    const apiResponse = await getTables();
    if (apiResponse.status === 200) {
      setFlatTables(apiResponse.tables);
      const tablesByArea = groupTablesByArea(apiResponse.tables);
      setTables(tablesByArea);
    }
  }

  async function retrieveReservations() {
    const apiResponse = await getWaiterReservations();
    if (apiResponse.status === 200) {
      setReservations(apiResponse.reservations);
    }
  }

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
      tableNumber: assigningTable.code,
      waiterName: "currentEmployee",
      total: 0,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      status: "current",
      items: [],
    };

    // Aquí se haría la llamada a la API
    alert(`Cliente ${assignFormData.customerName} asignado a Mesa ${assigningTable.code}`);
    
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

  function getAreaLabel(area) {
    return area?.label || "Sin área";
  }

  // Reservation table assignment handlers
  function handleAssignReservationTable(reservation) {
    setAssigningReservation(reservation);
    setReservationTableFormData({ tableCode: "" });
    setReservationError(null);
    openModal(`assign-reservation-table-${reservation.id}`);
  }

  async function handleAssignReservationTableSubmit(e) {
    e.preventDefault();
    setReservationError(null);

    const apiResponse = await assignTableToReservation(
      assigningReservation.id,
      reservationTableFormData.tableCode
    );

    if (apiResponse.status === 200) {
      // Update local reservations state
      setReservations((prevReservations) =>
        prevReservations.map((res) =>
          res.id === assigningReservation.id ? apiResponse.reservation : res
        )
      );
      // Refresh tables to reflect changes
      await retrieveTables();
      closeModal();
      setAssigningReservation(null);
      setReservationTableFormData({ tableCode: "" });
    } else {
      setReservationError(apiResponse.errorMessage || "Error al asignar mesa");
    }
  }

  function handleReservationTableFormChange(e) {
    const { name, value } = e.target;
    setReservationTableFormData({
      ...reservationTableFormData,
      [name]: value,
    });
  }

  function formatReservationTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  }

  // Filter tables for dropdown based on reservation's table area preference
  function getAvailableTablesForReservation(reservation) {
    let availableTables = flatTables.filter((table) => table.state === "available");
    // If reservation has a table_area preference, filter by it
    if (reservation.table_area) {
      const preferredAreaTables = availableTables.filter(
        (table) => table.area?.id === reservation.table_area.id
      );
      // If there are tables in the preferred area, show those first
      if (preferredAreaTables.length > 0) {
        return preferredAreaTables;
      }
    }
    return availableTables;
  }

  useEffect(() => {
    async function fetchData() {
      await retrieveTableAreas();
      await retrieveTables();
      await retrieveReservations();
    }

    fetchData();
  }, []);

  const totalTablesCount = Object.values(tables).reduce((sum, areaTables) => sum + (areaTables?.length || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Mesas Disponibles</h1>
          <p>Gestionar asignación de clientes a mesas</p>
        </div>
      </div>

      <div className="admin-content-card">
        {Object.keys(tables).map((areaLabel, areaIndex) => (
          <div key={areaLabel}>
            {areaIndex > 0 && (
              <hr style={{
                margin: "2rem 0",
                border: "none",
                borderTop: "1px solid #e0e0e0",
              }} />
            )}
            <h3 style={{ 
              fontSize: "1.1rem", 
              fontWeight: 600, 
              color: "var(--color-text)", 
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "2px solid var(--color-bg)"
            }}>
              {areaLabel}
            </h3>
            <div className="admin-tables-grid">
              {tables[areaLabel].map((table) => (
                <div
                  key={table.id}
                  className="admin-table-card"
                  onClick={() => handleAssignTable(table)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-table-header">
                    <h3>Mesa {table.code}</h3>
                    <span className={`admin-table-status status-${table.state || "available"}`}>
                      {table.state === "available" ? "Disponible" : table.state || "Disponible"}
                    </span>
                  </div>
                  <div className="admin-table-details">
                    <p>Capacidad: {table.capacity} personas</p>
                    {table.notes && <p className="admin-table-notes">{table.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {totalTablesCount === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            No hay mesas registradas
          </div>
        )}
      </div>

      {/* Reservations Section */}
      <div className="admin-content-card" style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>
          Reservaciones del Día
        </h2>
        {reservations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            No hay reservaciones activas para hoy
          </div>
        ) : (
          <div className="admin-tables-grid">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="admin-table-card"
                onClick={() => !reservation.table && handleAssignReservationTable(reservation)}
                style={{ cursor: reservation.table ? "default" : "pointer" }}
              >
                <div className="admin-table-header">
                  <h3>{reservation.code}</h3>
                  <span className={`admin-table-status status-${reservation.table ? "occupied" : "available"}`}>
                    {reservation.table ? `Mesa ${reservation.table.code}` : "Sin mesa"}
                  </span>
                </div>
                <div className="admin-table-details">
                  <p><strong>Cliente:</strong> {reservation.first_name} {reservation.last_name}</p>
                  <p><strong>Hora:</strong> {formatReservationTime(reservation.date_time)}</p>
                  <p><strong>Personas:</strong> {reservation.people}</p>
                  {reservation.table_area && (
                    <p><strong>Área preferida:</strong> {reservation.table_area.label}</p>
                  )}
                  {reservation.table && (
                    <p style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                      ✓ Mesa asignada: {reservation.table.code}
                    </p>
                  )}
                </div>
                {!reservation.table && (
                  <button
                    className="admin-btn-primary"
                    style={{ marginTop: "0.75rem", width: "100%" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignReservationTable(reservation);
                    }}
                  >
                    Asignar Mesa
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para asignar mesa a reservación */}
      {assigningReservation && (
        <Modal isOpen={openedModal === `assign-reservation-table-${assigningReservation.id}`}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Asignar Mesa a Reservación</h2>
              <button
                className="admin-modal-close"
                onClick={() => {
                  closeModal();
                  setAssigningReservation(null);
                  setReservationError(null);
                }}
              >
                ×
              </button>
            </div>
            <form className="admin-modal-form" onSubmit={handleAssignReservationTableSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Reservation Info (read-only) */}
              <div className="admin-form-group">
                <label>Reservación</label>
                <input
                  type="text"
                  value={assigningReservation.code}
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

              <div className="admin-form-group">
                <label>Cliente</label>
                <input
                  type="text"
                  value={`${assigningReservation.first_name} ${assigningReservation.last_name}`}
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

              <div className="admin-form-group">
                <label>Hora de Reservación</label>
                <input
                  type="text"
                  value={formatReservationTime(assigningReservation.date_time)}
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

              <div className="admin-form-group">
                <label>Número de Personas</label>
                <input
                  type="text"
                  value={assigningReservation.people}
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

              {assigningReservation.table_area && (
                <div className="admin-form-group">
                  <label>Área Preferida</label>
                  <input
                    type="text"
                    value={assigningReservation.table_area.label}
                    disabled
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                  />
                </div>
              )}

              {/* Table Selection */}
              <div className="admin-form-group">
                <label htmlFor="tableCode">Seleccionar Mesa *</label>
                <select
                  id="tableCode"
                  name="tableCode"
                  value={reservationTableFormData.tableCode}
                  onChange={handleReservationTableFormChange}
                  required
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
                >
                  <option value="">-- Seleccionar mesa --</option>
                  {getAvailableTablesForReservation(assigningReservation).map((table) => (
                    <option key={table.id} value={table.code}>
                      Mesa {table.code} - {getAreaLabel(table.area)} (Cap: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {reservationError && (
                <div style={{ color: "#e74c3c", padding: "0.75rem", backgroundColor: "#fdf2f2", borderRadius: "8px", fontSize: "0.9rem" }}>
                  {reservationError}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  style={{ width: "100%" }}
                >
                  Asignar Mesa
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    closeModal();
                    setAssigningReservation(null);
                    setReservationError(null);
                  }}
                  style={{ width: "100%" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal para asignar cliente a mesa */}
      {assigningTable && (
        <Modal isOpen={openedModal === `assign-table-${assigningTable.id}`}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Asignar Cliente a Mesa {assigningTable.code}</h2>
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
            <form className="admin-modal-form" onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="admin-form-group">
                <label htmlFor="tableNumber">Mesa</label>
                <input
                  type="text"
                  id="tableNumber"
                  value={`Mesa ${assigningTable.code} - ${getAreaLabel(assigningTable.area)}`}
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

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

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  style={{ width: "100%" }}
                >
                  Asignar Cliente
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    closeModal();
                    setAssigningTable(null);
                  }}
                  style={{ width: "100%" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
