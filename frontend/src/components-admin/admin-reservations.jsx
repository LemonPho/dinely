import React, { useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function AdminReservationsPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();

  // Mock data - no API calls
  const [reservations, setReservations] = useState([
    {
      id: 1,
      code: "DIN-ABC123",
      customerName: "Juan Pérez",
      email: "juan.perez@email.com",
      phone: "55 1234 5678",
      date: "2024-01-20",
      time: "19:00",
      partySize: 4,
      zone: "interior",
      tableNumber: "5",
      status: "active",
      comments: "Mesa cerca de la ventana",
    },
    {
      id: 2,
      code: "DIN-XYZ789",
      customerName: "María García",
      email: "maria.garcia@email.com",
      phone: "55 9876 5432",
      date: "2024-01-20",
      time: "19:30",
      partySize: 2,
      zone: "patio",
      tableNumber: "12",
      status: "active",
      comments: "",
    },
    {
      id: 3,
      code: "DIN-DEF456",
      customerName: "Carlos López",
      email: "carlos.lopez@email.com",
      phone: "55 5555 1234",
      date: "2024-01-21",
      time: "20:00",
      partySize: 6,
      zone: "interior",
      tableNumber: "8",
      status: "active",
      comments: "Celebración de cumpleaños",
    },
    {
      id: 4,
      code: "DIN-GHI321",
      customerName: "Ana Martínez",
      email: "ana.martinez@email.com",
      phone: "55 4444 5678",
      date: "2024-01-19",
      time: "18:00",
      partySize: 3,
      zone: "interior",
      tableNumber: "15",
      status: "cancelled",
      comments: "",
    },
    {
      id: 5,
      code: "DIN-JKL654",
      customerName: "Roberto Sánchez",
      email: "roberto.sanchez@email.com",
      phone: "55 3333 9876",
      date: "2024-01-22",
      time: "21:00",
      partySize: 2,
      zone: "patio",
      tableNumber: "3",
      status: "in_progress",
      comments: "",
      plate: "Pasta al pesto",
    },
  ]);

  const [editingReservation, setEditingReservation] = useState(null);
  const [viewingReservation, setViewingReservation] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    customerName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    partySize: "",
    zone: "interior",
    tableNumber: "",
    status: "active",
    comments: "",
    plate: "",
  });

  function handleReservationClick(reservation) {
    setViewingReservation(reservation);
    setEditingReservation(null);
    setIsCreating(false);
    setIsEditMode(false);
    openModal(`view-reservation-${reservation.id}`);
  }

  function handleEditClick() {
    if (!viewingReservation) return;
    setEditingReservation(viewingReservation);
    setIsEditMode(true);
    closeModal();
    openModal(`edit-reservation-${viewingReservation.id}`);
    setFormData({
      code: viewingReservation.code,
      customerName: viewingReservation.customerName,
      email: viewingReservation.email,
      phone: viewingReservation.phone,
      date: viewingReservation.date,
      time: viewingReservation.time,
      partySize: viewingReservation.partySize.toString(),
      zone: viewingReservation.zone,
      tableNumber: viewingReservation.tableNumber,
      status: viewingReservation.status,
      comments: viewingReservation.comments || "",
      plate: viewingReservation.plate || "",
    });
  }

  function handleCreateClick() {
    setEditingReservation(null);
    setViewingReservation(null);
    setIsCreating(true);
    setIsEditMode(true);
    setFormData({
      code: "",
      customerName: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      partySize: "",
      zone: "interior",
      tableNumber: "",
      status: "active",
      comments: "",
      plate: "",
    });
    openModal("create-reservation");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    
    // Si se cambia el estado y no es "in_progress", limpiar el campo plate
    if (name === "status" && value !== "in_progress") {
      updatedFormData.plate = "";
    }
    
    setFormData(updatedFormData);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (isCreating) {
      // Crear nueva reservación
      const newReservation = {
        id: Math.max(...reservations.map(r => r.id)) + 1,
        code: formData.code || `DIN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        partySize: parseInt(formData.partySize),
        zone: formData.zone,
        tableNumber: formData.tableNumber,
        status: formData.status,
        comments: formData.comments,
        plate: formData.status === "in_progress" ? formData.plate : "",
      };
      setReservations([...reservations, newReservation]);
      closeModal();
      setEditingReservation(null);
      setViewingReservation(null);
      setIsCreating(false);
      setIsEditMode(false);
    } else if (editingReservation) {
      // Editar reservación existente
      const updatedReservation = {
        ...editingReservation,
        code: formData.code,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        partySize: parseInt(formData.partySize),
        zone: formData.zone,
        tableNumber: formData.tableNumber,
        status: formData.status,
        comments: formData.comments,
        plate: formData.status === "in_progress" ? formData.plate : "",
      };
      
      const updatedReservations = reservations.map((reservation) =>
        reservation.id === editingReservation.id
          ? updatedReservation
          : reservation
      );
      setReservations(updatedReservations);
      
      // Volver a modo vista con la reservación actualizada
      setViewingReservation(updatedReservation);
      setEditingReservation(null);
      setIsEditMode(false);
      closeModal();
      openModal(`view-reservation-${updatedReservation.id}`);
    }
  }

  function handleCancelEdit() {
    setIsEditMode(false);
    setEditingReservation(null);
    // Volver a modo vista
    if (viewingReservation) {
      closeModal();
      openModal(`view-reservation-${viewingReservation.id}`);
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "active":
        return "Activa";
      case "in_progress":
        return "En Curso";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return status;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "active":
        return "status-available";
      case "in_progress":
        return "status-in-progress";
      case "cancelled":
        return "status-occupied";
      case "completed":
        return "status-reserved";
      default:
        return "";
    }
  }

  function getZoneLabel(zone) {
    switch (zone) {
      case "interior":
        return "Interior";
      case "patio":
        return "Terraza";
      case "bar":
        return "Bar";
      default:
        return zone;
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Gestionar Reservaciones</h1>
            <p>Ver y gestionar las reservaciones del restaurante</p>
          </div>
          <button
            className="admin-btn-primary"
            onClick={handleCreateClick}
          >
            Crear Reservación
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-reservations-list-vertical">
          {[...reservations].sort((a, b) => {
            // Ordenar por fecha primero, luego por hora
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
          }).map((reservation) => (
            <div
              key={reservation.id}
              className="admin-reservation-row-item"
              onClick={() => handleReservationClick(reservation)}
            >
              <div className="admin-reservation-row-left">
                <span className="admin-reservation-row-code">{reservation.code}</span>
                <h3>{reservation.customerName}</h3>
                <span className="admin-reservation-row-info">
                  {reservation.date} · {reservation.time} · Mesa {reservation.tableNumber} · {reservation.partySize} personas
                </span>
              </div>
              <div className="admin-reservation-row-right">
                <span className={`admin-table-status ${getStatusColor(reservation.status)}`}>
                  {getStatusLabel(reservation.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(viewingReservation || editingReservation || isCreating) && (
        <Modal isOpen={
          (viewingReservation && openedModal === `view-reservation-${viewingReservation.id}`) ||
          (editingReservation && openedModal === `edit-reservation-${editingReservation.id}`) ||
          (isCreating && openedModal === "create-reservation")
        }>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {isCreating 
                  ? "Crear Nueva Reservación" 
                  : isEditMode 
                    ? "Editar Reservación" 
                    : "Detalles de Reservación"}
              </h2>
              <div className="admin-modal-header-actions">
                {viewingReservation && !isEditMode && (
                  <button
                    type="button"
                    className="admin-btn-edit"
                    onClick={handleEditClick}
                  >
                    Editar
                  </button>
                )}
                <button
                  className="admin-modal-close"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </div>
            {isEditMode || isCreating ? (
              <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label htmlFor="code">Código de Reservación</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Se generará automáticamente si se deja vacío"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="customerName">Nombre del Cliente</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="ej: Juan Pérez"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="ej: cliente@email.com"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="ej: 55 1234 5678"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="date">Fecha</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="time">Hora</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="partySize">Número de Personas</label>
                <input
                  type="number"
                  id="partySize"
                  name="partySize"
                  value={formData.partySize}
                  onChange={handleChange}
                  required
                  min="1"
                  max="20"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="zone">Zona</label>
                <div className="dropdown-div">
                  <button
                    type="button"
                    className="admin-select-dropdown-button"
                    id="zone-button"
                    onClick={(e) => toggleDropdown("zone-dropdown")}
                  >
                    {formData.zone === "interior" ? (
                      <span>Interior</span>
                    ) : formData.zone === "patio" ? (
                      <span>Terraza</span>
                    ) : formData.zone === "bar" ? (
                      <span>Bar</span>
                    ) : (
                      <span>Seleccionar zona...</span>
                    )}
                  </button>
                  <Dropdown isOpen={openedDropdown === "zone-dropdown"}>
                    <ul
                      className="admin-select-dropdown-menu"
                      id="zone-dropdown"
                      style={{ overflowY: "scroll", maxHeight: "15rem" }}
                    >
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "zone", value: "interior" },
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
                              target: { name: "zone", value: "patio" },
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
                              target: { name: "zone", value: "bar" },
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

              <div className="admin-form-group">
                <label htmlFor="tableNumber">Mesa</label>
                <input
                  type="text"
                  id="tableNumber"
                  name="tableNumber"
                  value={formData.tableNumber}
                  onChange={handleChange}
                  required
                  placeholder="ej: 5, A1, VIP-1"
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
                    {formData.status === "active" ? (
                      <span>Activa</span>
                    ) : formData.status === "in_progress" ? (
                      <span>En Curso</span>
                    ) : formData.status === "cancelled" ? (
                      <span>Cancelada</span>
                    ) : formData.status === "completed" ? (
                      <span>Completada</span>
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
                              target: { name: "status", value: "active" },
                            });
                            closeDropdown();
                          }}
                        >
                          Activa
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "status", value: "in_progress" },
                            });
                            closeDropdown();
                          }}
                        >
                          En Curso
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "status", value: "cancelled" },
                            });
                            closeDropdown();
                          }}
                        >
                          Cancelada
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={() => {
                            handleChange({
                              target: { name: "status", value: "completed" },
                            });
                            closeDropdown();
                          }}
                        >
                          Completada
                        </a>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>

              {formData.status === "in_progress" && (
                <div className="admin-form-group full-width">
                  <label htmlFor="plate">Platillo</label>
                  <input
                    type="text"
                    id="plate"
                    name="plate"
                    value={formData.plate}
                    onChange={handleChange}
                    placeholder="Platillo que está consumiendo (opcional)"
                  />
                </div>
              )}

              <div className="admin-form-group full-width">
                <label htmlFor="comments">Comentarios</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Comentarios adicionales (opcional)..."
                />
              </div>

              <div className="admin-form-actions full-width">
                {isEditMode && !isCreating && (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={closeModal}
                >
                  Cerrar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {isCreating ? "Crear" : "Guardar Cambios"}
                </button>
              </div>
            </form>
            ) : (
              <div className="admin-modal-view">
                {viewingReservation && (
                  <>
                    <div className="admin-view-section">
                      <h3>Información del Cliente</h3>
                      <div className="admin-view-grid">
                        <div className="admin-view-item">
                          <span className="admin-view-label">Nombre:</span>
                          <span className="admin-view-value">{viewingReservation.customerName}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Email:</span>
                          <span className="admin-view-value">{viewingReservation.email}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Teléfono:</span>
                          <span className="admin-view-value">{viewingReservation.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-view-section">
                      <h3>Detalles de la Reservación</h3>
                      <div className="admin-view-grid">
                        <div className="admin-view-item">
                          <span className="admin-view-label">Código:</span>
                          <span className="admin-view-value admin-view-code">{viewingReservation.code}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Fecha:</span>
                          <span className="admin-view-value">{viewingReservation.date}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Hora:</span>
                          <span className="admin-view-value">{viewingReservation.time}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Mesa:</span>
                          <span className="admin-view-value">{viewingReservation.tableNumber}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Grupo:</span>
                          <span className="admin-view-value">{viewingReservation.partySize} personas</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Zona:</span>
                          <span className="admin-view-value">{getZoneLabel(viewingReservation.zone)}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Estado:</span>
                          <span className={`admin-table-status ${getStatusColor(viewingReservation.status)}`}>
                            {getStatusLabel(viewingReservation.status)}
                          </span>
                        </div>
                        {viewingReservation.status === "in_progress" && viewingReservation.plate && (
                          <div className="admin-view-item">
                            <span className="admin-view-label">Platillo:</span>
                            <span className="admin-view-value">{viewingReservation.plate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {viewingReservation.comments && (
                      <div className="admin-view-section">
                        <h3>Comentarios</h3>
                        <p className="admin-view-comments">{viewingReservation.comments}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
