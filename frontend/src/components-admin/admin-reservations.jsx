import React, { useState, useEffect } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";
import { createReservation, editReservation, deleteReservation, getReservations, getTables } from "../fetch/admin.jsx";
import Messages from "../util-components/messages.jsx";

export default function AdminReservationsPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();
  const { setErrorMessage, setSuccessMessage, setLoadingMessage, resetMessages } = useMessagesContext();

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingReservation, setViewingReservation] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    customerName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    partySize: "",
    tableNumber: "",
    status: "active",
    comments: "",
  });

  // Load reservations and tables on mount
  useEffect(() => {
    async function loadData() {
      const reservationsResponse = await getReservations();
      if (reservationsResponse.status === 200) {
        setReservations(reservationsResponse.reservations);
      }

      const tablesResponse = await getTables();
      if (tablesResponse.status === 200) {
        setTables(tablesResponse.tables);
      }
    }

    loadData();
  }, []);

  function formatDateTimeForDisplay(dateTime) {
    if (!dateTime) return { date: "", time: "" };
    const dt = new Date(dateTime);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().split(' ')[0].substring(0, 5);
    return { date, time };
  }

  function combineDateTime(date, time) {
    if (!date || !time) return null;
    // Create datetime string in restaurant's timezone (America/Mexico_City, UTC-6)
    // This ensures the date/time is interpreted as the restaurant's local time
    const dateTimeString = `${date}T${time}:00`;
    
    // Format as ISO string with restaurant's timezone offset (-06:00 for Mexico City)
    return `${dateTimeString}-06:00`;
  }

  function handleReservationClick(reservation) {
    setViewingReservation(reservation);
    setIsEditing(false);
    setIsCreating(false);
    openModal(`view-reservation-${reservation.id}`);
  }

  function handleEditClick() {
    if (!viewingReservation) return;
    setIsEditing(true);
    setIsCreating(false);
    const { date, time } = formatDateTimeForDisplay(viewingReservation.date_time);
    setFormData({
      id: viewingReservation.id || "",
      customerName: viewingReservation.name || "",
      email: viewingReservation.email || "",
      phone: viewingReservation.phone_number || "",
      date: date,
      time: time,
      partySize: viewingReservation.amount_people?.toString() || "",
      tableNumber: viewingReservation.table?.code || "",
      status: viewingReservation.state || "active",
      comments: viewingReservation.notes || "",
    });
    closeModal();
    openModal(`edit-reservation-${viewingReservation.id}`);
  }

  function handleCreateClick() {
    setIsEditing(false);
    setIsCreating(true);
    setViewingReservation(null);
    setFormData({
      id: "",
      customerName: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      partySize: "",
      tableNumber: "",
      status: "active",
      comments: "",
    });
    openModal("create-reservation");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleDeleteReservation() {
    resetMessages();
    if (!formData.id) {
      return;
    }

    // Confirm deletion
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la reservación?`)) {
      return;
    }

    const apiResponse = await deleteReservation(formData.id);

    if (apiResponse.status === 201) {
      // Remove reservation from state
      setReservations((prevReservations) => prevReservations.filter((reservation) => reservation.id !== formData.id));
      
      // Clear form and close modal
      setFormData({
        id: "",
        customerName: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        partySize: "",
        tableNumber: "",
        status: "active",
        comments: "",
      });
      setIsEditing(false);
      setIsCreating(false);
      setViewingReservation(null);
      closeModal();
      
      setSuccessMessage("Reservación eliminada exitosamente");
    } else {
      setErrorMessage("Error al eliminar la reservación. Por favor intenta de nuevo.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();

    setLoadingMessage("Cargando...");

    const dateTime = combineDateTime(formData.date, formData.time);
    if (!dateTime) {
      setLoadingMessage("");
      setErrorMessage("Por favor ingresa una fecha y hora válidas");
      return;
    }

    const reservationData = {
      name: formData.customerName,
      email: formData.email || "",
      phone_number: formData.phone || "",
      date_time: dateTime,
      table: formData.tableNumber || null,
      amount_people: parseInt(formData.partySize),
      state: formData.status,
      notes: formData.comments || "",
    };

    // Determine if creating or editing
    const isEditingReservation = isEditing && formData.id;
    const reservationResponse = isEditingReservation
      ? await editReservation({ ...reservationData, id: formData.id })
      : await createReservation(reservationData);
    
    setLoadingMessage("");

    if (reservationResponse.status === 500 || reservationResponse.error) {
      setErrorMessage("Hubo un error al intentar procesar la solicitud");
      return;
    }
    
    if (reservationResponse.status === 400) {
      // Errores de validación del backend
      const errors = reservationResponse.validationErrors || {};
      let errorMessage = `Error al ${isEditingReservation ? 'actualizar' : 'crear'} la reservación:\n`;
      
      // Handle validator errors (valid_* fields)
      if (errors.valid_name === false) {
        errorMessage += "- El nombre es requerido\n";

      }
      if (errors.valid_email === false) {
        errorMessage += "- El formato del email no es válido\n";

      }
      if (errors.valid_date_time === false) {
        errorMessage += "- La fecha y hora son requeridas y deben ser en el futuro\n";

      }
      if (errors.valid_table === false) {
        errorMessage += "- La mesa seleccionada no existe\n";

      }
      if (errors.valid_amount_people === false) {
        errorMessage += "- El número de personas debe ser mayor a 0\n";

      }
      if (errors.valid_state === false) {
        errorMessage += "- El estado es requerido\n";

      }
      if (errors.valid_notes === false) {
        errorMessage += "- Los comentarios no pueden exceder 2048 caracteres\n";

      }
      
      // Set error message (always show base message + specific errors if found)
      setErrorMessage(errorMessage);
      return;
    } else if (reservationResponse.status === 201) {
      if (isCreating) {
        // Use the returned reservation data to update state
        if (reservationResponse.reservation) {
          setReservations([...reservations, reservationResponse.reservation]);
        }
        setSuccessMessage("Reservación creada con éxito!");
      } else {
        // Edit reservation - update state manually from formData (no response data)
        const updatedReservations = reservations.map((reservation) => {
          if (reservation.id === formData.id) {
            const { date, time } = formatDateTimeForDisplay(dateTime);
            return {
              ...reservation,
              name: formData.customerName,
              email: formData.email || null,
              phone_number: formData.phone || null,
              date_time: dateTime,
              table: tables.find(t => t.code === formData.tableNumber) || null,
              amount_people: parseInt(formData.partySize),
              state: formData.status,
              notes: formData.comments || null,
            };
          }
          return reservation;
        });
        setReservations(updatedReservations);
        setSuccessMessage("Reservación actualizada con éxito!");
      }
      
      closeModal();
      setIsEditing(false);
      setIsCreating(false);
      setViewingReservation(null);
    } else {
      setErrorMessage(`Error desconocido con código de estatus: ${reservationResponse.status}`);
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "active":
        return "Activa";
      case "in_progress":
        return "En Curso";
      case "in_course":
        return "En Curso";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      case "finalized":
        return "Finalizada";
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
      case "in_course":
        return "status-in-progress";
      case "cancelled":
        return "status-occupied";
      case "completed":
        return "status-reserved";
      case "finalized":
        return "status-reserved";
      default:
        return "";
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
          {reservations.length === 0 ? (
            <div>No hay reservaciones registradas</div>
          ) : (
            [...reservations].sort((a, b) => {
              // Sort by date_time (newest first)
              const dateA = new Date(a.date_time);
              const dateB = new Date(b.date_time);
              return dateB - dateA;
            }).map((reservation) => {
              const { date, time } = formatDateTimeForDisplay(reservation.date_time);
              return (
                <div
                  key={reservation.id}
                  className="admin-reservation-row-item"
                  onClick={() => handleReservationClick(reservation)}
                >
                  <div className="admin-reservation-row-left">
                    <span className="admin-reservation-row-code">{reservation.code}</span>
                    <h3>{reservation.name}</h3>
                    <span className="admin-reservation-row-info">
                      {date} · {time} · {reservation.table ? `Mesa ${reservation.table.code}` : "Sin mesa"} · {reservation.amount_people} personas
                    </span>
                  </div>
                  <div className="admin-reservation-row-right">
                    <span className={`admin-table-status ${getStatusColor(reservation.state)}`}>
                      {getStatusLabel(reservation.state)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {(viewingReservation || isEditing || isCreating) && (
        <Modal isOpen={
          (viewingReservation && !isEditing && openedModal === `view-reservation-${viewingReservation.id}`) ||
          (isEditing && openedModal === `edit-reservation-${formData.id}`) ||
          (isCreating && openedModal === "create-reservation")
        }>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {isCreating 
                  ? "Crear Nueva Reservación" 
                  : isEditing 
                    ? "Editar Reservación" 
                    : "Detalles de Reservación"}
              </h2>
              <div className="admin-modal-header-actions">
                {viewingReservation && !isEditing && (
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
            <Messages/>
            {isEditing || isCreating ? (
              <form className="admin-modal-form" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label htmlFor="customerName">Nombre del Cliente *</label>
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
                    placeholder="ej: 55 1234 5678"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="date">Fecha *</label>
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
                  <label htmlFor="time">Hora *</label>
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
                  <label htmlFor="partySize">Número de Personas *</label>
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
                  <label htmlFor="tableNumber">Mesa</label>
                  <div className="dropdown-div">
                    <button
                      type="button"
                      className="admin-select-dropdown-button"
                      id="table-button"
                      onClick={(e) => toggleDropdown("table-dropdown")}
                    >
                      {formData.tableNumber ? (
                        <span>{formData.tableNumber}</span>
                      ) : (
                        <span>Seleccionar mesa...</span>
                      )}
                    </button>
                    <Dropdown isOpen={openedDropdown === "table-dropdown"}>
                      <ul
                        className="admin-select-dropdown-menu"
                        id="table-dropdown"
                        style={{ overflowY: "scroll", maxHeight: "15rem" }}
                      >
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChange({
                                target: { name: "tableNumber", value: "" },
                              });
                              closeDropdown();
                            }}
                          >
                            Sin mesa
                          </a>
                        </li>
                        {tables.map((table) => (
                          <li key={table.id}>
                            <a
                              className="dropdown-item"
                              onClick={() => {
                                handleChange({
                                  target: { name: "tableNumber", value: table.code },
                                });
                                closeDropdown();
                              }}
                            >
                              {table.code}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Dropdown>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="status">Estado *</label>
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
                      ) : formData.status === "in_course" ? (
                        <span>En Curso</span>
                      ) : formData.status === "cancelled" ? (
                        <span>Cancelada</span>
                      ) : formData.status === "completed" ? (
                        <span>Completada</span>
                      ) : formData.status === "finalized" ? (
                        <span>Finalizada</span>
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
                                target: { name: "status", value: "in_course" },
                              });
                              closeDropdown();
                            }}
                          >
                            En Curso (in_course)
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
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChange({
                                target: { name: "status", value: "finalized" },
                              });
                              closeDropdown();
                            }}
                          >
                            Finalizada
                          </a>
                        </li>
                      </ul>
                    </Dropdown>
                  </div>
                </div>

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
                  {isEditing && formData.id && (
                    <button
                      type="button"
                      className="admin-btn-danger large"
                      onClick={handleDeleteReservation}
                      style={{ marginRight: "auto" }}
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={closeModal}
                  >
                    Cancelar
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
                          <span className="admin-view-value">{viewingReservation.name}</span>
                        </div>
                        {viewingReservation.email && (
                          <div className="admin-view-item">
                            <span className="admin-view-label">Email:</span>
                            <span className="admin-view-value">{viewingReservation.email}</span>
                          </div>
                        )}
                        {viewingReservation.phone_number && (
                          <div className="admin-view-item">
                            <span className="admin-view-label">Teléfono:</span>
                            <span className="admin-view-value">{viewingReservation.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-view-section">
                      <h3>Detalles de la Reservación</h3>
                      <div className="admin-view-grid">
                        <div className="admin-view-item">
                          <span className="admin-view-label">Código:</span>
                          <span className="admin-view-value admin-view-code">{viewingReservation.code}</span>
                        </div>
                        {(() => {
                          const { date, time } = formatDateTimeForDisplay(viewingReservation.date_time);
                          return (
                            <>
                              <div className="admin-view-item">
                                <span className="admin-view-label">Fecha:</span>
                                <span className="admin-view-value">{date}</span>
                              </div>
                              <div className="admin-view-item">
                                <span className="admin-view-label">Hora:</span>
                                <span className="admin-view-value">{time}</span>
                              </div>
                            </>
                          );
                        })()}
                        <div className="admin-view-item">
                          <span className="admin-view-label">Mesa:</span>
                          <span className="admin-view-value">{viewingReservation.table ? viewingReservation.table.code : "Sin mesa"}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Grupo:</span>
                          <span className="admin-view-value">{viewingReservation.amount_people} personas</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Estado:</span>
                          <span className={`admin-table-status ${getStatusColor(viewingReservation.state)}`}>
                            {getStatusLabel(viewingReservation.state)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {viewingReservation.notes && (
                      <div className="admin-view-section">
                        <h3>Comentarios</h3>
                        <p className="admin-view-comments">{viewingReservation.notes}</p>
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
