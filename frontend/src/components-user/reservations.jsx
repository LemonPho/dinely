import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import { useUserContext } from "../application-context/user-context.jsx";
import { getUserReservation, getUserReservations, editUserReservation, cancelUserReservation, getTableAreas } from "../fetch/user.jsx";
import Messages from "../util-components/messages.jsx";
import "../styles/global.css";

export default function MisReservas() {
  const { setErrorMessage, setSuccessMessage, resetMessages } = useMessagesContext();
  const { user, userLoading } = useUserContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState({
    code: "",
    email: "",
    phone_number: "",
  });

  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editDataForm, setEditDataForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [tableAreas, setTableAreas] = useState([]);
  const [autoLoading, setAutoLoading] = useState(false);

  // Load table areas on mount
  useEffect(() => {
    async function loadTableAreas() {
      const response = await getTableAreas();
      if (response.status === 200) {
        setTableAreas(response.tableAreas);
      }
    }

    loadTableAreas();
  }, []);

  // Auto-fetch user's reservations if logged in
  useEffect(() => {
    async function loadUserReservations() {
      if (userLoading) return;
      
      if (user && user.email) {
        setAutoLoading(true);
        const response = await getUserReservations(user.email);
        setAutoLoading(false);
        
        if (response.status === 200 && response.reservations) {
          const transformedReservations = response.reservations.map(transformReservationData);
          setReservations(transformedReservations);
          // Select the first active reservation, or the first one if none are active
          const activeReservation = transformedReservations.find(r => r.state === "active");
          if (activeReservation) {
            setSelectedReservation(activeReservation);
            setEditDataForm(activeReservation);
          } else if (transformedReservations.length > 0) {
            setSelectedReservation(transformedReservations[0]);
            setEditDataForm(transformedReservations[0]);
          }
        }
        // If 404 or empty, user has no reservations - that's fine, we'll show the message
      }
    }

    loadUserReservations();
  }, [user, userLoading]);

  function formatDateTimeForDisplay(dateTime) {
    if (!dateTime) return { date: "", time: "" };
    // Parse the ISO string directly to avoid timezone conversion issues
    // Backend sends: "2025-12-05T19:13:00-06:00"
    // Extract date and time from the ISO string directly
    const isoMatch = dateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}/);
    if (isoMatch) {
      return { date: isoMatch[1], time: isoMatch[2] };
    }
    // Fallback to Date object parsing if format is different
    const dt = new Date(dateTime);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().split(' ')[0].substring(0, 5);
    return { date, time };
  }

  function transformReservationData(apiReservation) {
    const { date, time } = formatDateTimeForDisplay(apiReservation.date_time);
    return {
      code: apiReservation.code,
      name: apiReservation.name,
      email: apiReservation.email,
      phone: apiReservation.phone_number || "",
      date: date,
      time: time,
      people: apiReservation.amount_people.toString(),
      area: apiReservation.table?.area?.label || "Sin preferencia",
      comments: apiReservation.notes || "",
      state: apiReservation.state,
    };
  }

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReservationSearch = async (e) => {
    e.preventDefault();
    resetMessages();

    // At least one field must be filled
    if (!search.code.trim() && !search.email.trim() && !search.phone_number.trim()) {
      setErrorMessage("Por favor ingresa el código de reserva, tu correo electrónico o tu número de teléfono");
      return;
    }

    setIsSearching(true);

    // If searching by code, use get_user_reservation (single)
    // If searching by email or phone, use get_user_reservations (multiple)
    if (search.code.trim()) {
      const response = await getUserReservation(
        search.code.trim(),
        null,
        null
      );

      setIsSearching(false);

      if (response.status === 500 || response.error) {
        setErrorMessage("Hubo un error al intentar buscar la reservación");
        return;
      }

      if (response.status === 404 || response.status === 400) {
        setErrorMessage(response.errorMessage || "No se encontró la reservación");
        setReservations([]);
        setSelectedReservation(null);
        setEditDataForm(null);
        return;
      }

      if (response.status === 200 && response.reservation) {
        const transformedReservation = transformReservationData(response.reservation);
        setReservations([transformedReservation]);
        setSelectedReservation(transformedReservation);
        setEditDataForm(transformedReservation);
        setEditMode(false);
        setSuccessMessage("Reservación encontrada");
      }
    } else if (search.email.trim() || search.phone_number.trim()) {
      // Search by email or phone - get all reservations
      const response = await getUserReservations(
        search.email.trim() || null,
        search.phone_number.trim() || null
      );

      setIsSearching(false);

      if (response.status === 500 || response.error) {
        setErrorMessage("Hubo un error al intentar buscar las reservaciones");
        return;
      }

      if (response.status === 400) {
        setErrorMessage(response.errorMessage || "Error al buscar las reservaciones");
        setReservations([]);
        setSelectedReservation(null);
        setEditDataForm(null);
        return;
      }

      if (response.status === 200 && response.reservations) {
        if (response.reservations.length === 0) {
          const searchType = search.email.trim() ? "correo electrónico" : "número de teléfono";
          setErrorMessage(`No se encontraron reservaciones para este ${searchType}`);
          setReservations([]);
          setSelectedReservation(null);
          setEditDataForm(null);
          return;
        }

        const transformedReservations = response.reservations.map(transformReservationData);
        setReservations(transformedReservations);
        // Select the first active reservation, or the first one if none are active
        const activeReservation = transformedReservations.find(r => r.state === "active");
        if (activeReservation) {
          setSelectedReservation(activeReservation);
          setEditDataForm(activeReservation);
        } else if (transformedReservations.length > 0) {
          setSelectedReservation(transformedReservations[0]);
          setEditDataForm(transformedReservations[0]);
        }
        setEditMode(false);
        setSuccessMessage(`${transformedReservations.length} reservación${transformedReservations.length > 1 ? 'es' : ''} encontrada${transformedReservations.length > 1 ? 's' : ''}`);
      }
    }
  };

  const handleEditFormDataChange = (e) => {
    const { name, value } = e.target;
    setEditDataForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function combineDateTime(date, time) {
    if (!date || !time) return null;
    const dateTimeString = `${date}T${time}:00`;
    return new Date(dateTimeString).toISOString();
  }

  const handleSaveChanges = async () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas guardar los cambios en tu reserva?"
    );
    if (!confirmation) return;

    resetMessages();
    setIsEditing(true);

    const dateTime = combineDateTime(editDataForm.date, editDataForm.time);
    if (!dateTime) {
      setIsEditing(false);
      setErrorMessage("Por favor ingresa una fecha y hora válidas");
      return;
    }

    const reservationData = {
      code: selectedReservation.code,
      email: selectedReservation.email,
      date_time: dateTime,
      table_area: editDataForm.area === "Sin preferencia" ? null : editDataForm.area,
      amount_people: parseInt(editDataForm.people),
      notes: editDataForm.comments || "",
    };

    const response = await editUserReservation(reservationData);

    setIsEditing(false);

    if (response.status === 500 || response.error) {
      setErrorMessage("Hubo un error al intentar procesar la solicitud");
      return;
    }

    if (response.status === 400) {
      // Validation errors
      const errors = response.validationErrors || {};
      let errorMessage = "Error al editar la reservación:\n";

      if (errors.valid_date_time === false) {
        errorMessage += "- La fecha y hora deben ser en el futuro\n";
      }
      if (errors.valid_table_area === false) {
        errorMessage += "- El área seleccionada no existe\n";
      }
      if (errors.valid_amount_people === false) {
        errorMessage += "- El número de personas debe ser mayor a 0\n";
      }
      if (errors.valid_notes === false) {
        errorMessage += "- Los comentarios no pueden exceder 2048 caracteres\n";
      }

      setErrorMessage(errorMessage);
      return;
    }

    if (response.status === 403 || response.status === 404) {
      setErrorMessage(response.errorMessage || "No se pudo editar la reservación");
      return;
    }

    if (response.status === 201 && response.reservation) {
      const transformedReservation = transformReservationData(response.reservation);
      // Update the reservation in the list
      setReservations(prev => 
        prev.map(r => r.code === transformedReservation.code ? transformedReservation : r)
      );
      setSelectedReservation(transformedReservation);
      setEditDataForm(transformedReservation);
      setEditMode(false);
      setSuccessMessage("Reservación actualizada con éxito");
    } else {
      setErrorMessage(`Error desconocido con código de estatus: ${response.status}`);
    }
  };

  const handleCancelReservation = async () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas cancelar tu reserva? Esta acción no se puede deshacer."
    );
    if (!confirmation) return;

    resetMessages();
    setIsCancelling(true);

    const response = await cancelUserReservation(
      selectedReservation.code,
      selectedReservation.email,
      selectedReservation.phone || null
    );

    setIsCancelling(false);

    if (response.status === 500 || response.error) {
      setErrorMessage("Hubo un error al intentar cancelar la reservación");
      return;
    }

    if (response.status === 400 || response.status === 403 || response.status === 404) {
      setErrorMessage(response.errorMessage || "No se pudo cancelar la reservación");
      return;
    }

    if (response.status === 201 && response.reservation) {
      const transformedReservation = transformReservationData(response.reservation);
      setReservation(transformedReservation);
      setEditDataForm(transformedReservation);
      setSuccessMessage("Reservación cancelada con éxito");
    } else {
      setErrorMessage(`Error desconocido con código de estatus: ${response.status}`);
    }
  };

  const isReservationActive = selectedReservation?.state === "active";
  const isLoggedIn = user && !userLoading;
  const hasNoReservations = isLoggedIn && !autoLoading && reservations.length === 0;

  return (
    <section className="my-reservations-page">
      <div className="container">
        {/* ENCABEZADO */}
        <header className="my-reservations-header">
          <p className="my-res-eyebrow">Mis reservas</p>
          <h1>Consulta, modifica o cancela tu reserva</h1>
          <p>
            {isLoggedIn 
              ? "Aquí puedes ver, modificar o cancelar tus reservas."
              : "Ingresa el código de tu reserva o tu correo electrónico para ver los detalles. Desde aquí podrás modificar algunos datos o cancelar la reserva si ya no la necesitas."}
          </p>
        </header>

        {isLoggedIn ? (
          // LOGGED IN USER VIEW
          <div className="my-reservations-grid">
            {/* RESERVATIONS LIST */}
            <section className="my-res-card">
              <h2>Mis Reservas</h2>
              <Messages />
              
              {autoLoading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p>Cargando tus reservas...</p>
                </div>
              ) : hasNoReservations ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p className="my-res-empty" style={{ marginBottom: "1.5rem" }}>
                    No tienes ninguna reserva actualmente.
                  </p>
                  <Link to="/reserva" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                    Crear una reserva
                  </Link>
                </div>
              ) : reservations.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {reservations.map((res) => {
                    const isActive = res.state === "active";
                    return (
                      <div
                        key={res.code}
                        onClick={() => {
                          setSelectedReservation(res);
                          setEditDataForm(res);
                          setEditMode(false);
                        }}
                        style={{
                          padding: "1rem",
                          border: selectedReservation?.code === res.code ? "2px solid var(--color-primary)" : "1px solid #ddd",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: selectedReservation?.code === res.code ? "#f5f5f5" : "white",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{res.code}</span>
                          <span
                            className={[
                              "my-res-status-pill",
                              isActive ? "status-activa" : "status-cancelada",
                            ].join(" ")}
                            style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
                          >
                            {isActive ? "Activa" : "Cancelada"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                          <div>Fecha: {res.date} a las {res.time}</div>
                          <div>Personas: {res.people}</div>
                          <div>Zona: {res.area}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>

            {/* RESERVATION DETAIL */}
            <section className="my-res-card my-res-detail-card">
              <h2>Detalle de la Reserva</h2>
              
              {!selectedReservation ? (
                <p className="my-res-empty">
                  Selecciona una reserva de la lista para ver sus detalles.
                </p>
              ) : (
                <>
                  <div className="my-res-status-row">
                    <span className="my-res-code">{selectedReservation.code}</span>
                    <span
                      className={[
                        "my-res-status-pill",
                        isReservationActive ? "status-activa" : "status-cancelada",
                      ].join(" ")}
                    >
                      {isReservationActive ? "Activa" : "Cancelada"}
                    </span>
                  </div>

                  {!editMode && (
                    <div className="my-res-summary">
                      <ul>
                        <li>
                          <strong>Nombre:</strong> {selectedReservation.name}
                        </li>
                        <li>
                          <strong>Correo:</strong> {selectedReservation.email}
                        </li>
                        {selectedReservation.phone && (
                          <li>
                            <strong>Teléfono:</strong> {selectedReservation.phone}
                          </li>
                        )}
                        <li>
                          <strong>Fecha:</strong> {selectedReservation.date}
                        </li>
                        <li>
                          <strong>Hora:</strong> {selectedReservation.time}
                        </li>
                        <li>
                          <strong>Personas:</strong> {selectedReservation.people}
                        </li>
                        <li>
                          <strong>Zona:</strong> {selectedReservation.area}
                        </li>
                        {selectedReservation.comments && (
                          <li>
                            <strong>Comentarios:</strong> {selectedReservation.comments}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {editMode && editDataForm && (
                    <form
                      className="my-res-edit-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveChanges();
                      }}
                    >
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="fechaEdit">Fecha</label>
                          <input
                            id="fechaEdit"
                            name="date"
                            type="date"
                            value={editDataForm.date}
                            onChange={handleEditFormDataChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="horaEdit">Hora</label>
                          <input
                            id="horaEdit"
                            name="time"
                            type="time"
                            value={editDataForm.time}
                            onChange={handleEditFormDataChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="personasEdit">Personas</label>
                          <select
                            id="personasEdit"
                            name="people"
                            value={editDataForm.people}
                            onChange={handleEditFormDataChange}
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="zonaEdit">Zona</label>
                          <select
                            id="zonaEdit"
                            name="area"
                            value={editDataForm.area}
                            onChange={handleEditFormDataChange}
                          >
                            <option value="Sin preferencia">Sin preferencia</option>
                            {tableAreas.map((area) => (
                              <option key={area.id} value={area.label}>
                                {area.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="comentariosEdit">
                            Comentarios / peticiones
                          </label>
                          <textarea
                            id="comentariosEdit"
                            name="comments"
                            rows="3"
                            value={editDataForm.comments}
                            onChange={handleEditFormDataChange}
                          />
                        </div>
                      </div>

                      <div className="my-res-actions">
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={isEditing}
                        >
                          {isEditing ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditMode(false);
                            setEditDataForm(selectedReservation);
                          }}
                          disabled={isEditing}
                        >
                          Cancelar edición
                        </button>
                      </div>
                    </form>
                  )}

                  {/* BOTONES PRINCIPALES (MODIFICAR / CANCELAR) */}
                  {selectedReservation && !editMode && (
                    <div className="my-res-actions">
                      {isReservationActive && (
                        <>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              setEditMode(true);
                            }}
                            disabled={isCancelling}
                          >
                            Modificar reserva
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCancelReservation}
                            disabled={isCancelling}
                          >
                            {isCancelling ? "Cancelando..." : "Cancelar reserva"}
                          </button>
                        </>
                      )}
                      {!isReservationActive && (
                        <p className="reservation-message">
                          Esta reserva se encuentra cancelada.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        ) : (
          // NOT LOGGED IN - SHOW SEARCH FORM
          <div className="my-reservations-grid">
            {/* TARJETA DE BÚSQUEDA */}
            <section className="my-res-card">
              <h2>Buscar mi reserva</h2>
              <form onSubmit={handleReservationSearch} className="my-res-search-form">
                <Messages />
                <div className="form-group">
                  <label htmlFor="code">Código de reserva</label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Ej. RES-ABC123"
                    value={search.code}
                    onChange={handleSearchChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emailBusqueda">Correo electrónico</label>
                  <input
                    id="emailBusqueda"
                    name="email"
                    type="email"
                    placeholder="tuemail@ejemplo.com"
                    value={search.email}
                    onChange={handleSearchChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneBusqueda">Número de teléfono</label>
                  <input
                    id="phoneBusqueda"
                    name="phone_number"
                    type="tel"
                    placeholder="1234567890"
                    value={search.phone_number}
                    onChange={handleSearchChange}
                  />
                </div>

                <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                  Ingresa al menos uno de los campos para buscar tu reserva. Si buscas por correo o teléfono, verás todas tus reservas.
                </p>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSearching}
                >
                  {isSearching ? "Buscando..." : "Buscar reserva"}
                </button>
              </form>
            </section>

            {/* RESERVATIONS LIST (shown when searching by email) */}
            {reservations.length > 1 && (
              <section className="my-res-card">
                <h2>Mis Reservas</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {reservations.map((res) => {
                    const isActive = res.state === "active";
                    return (
                      <div
                        key={res.code}
                        onClick={() => {
                          setSelectedReservation(res);
                          setEditDataForm(res);
                          setEditMode(false);
                        }}
                        style={{
                          padding: "1rem",
                          border: selectedReservation?.code === res.code ? "2px solid var(--color-primary)" : "1px solid #ddd",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: selectedReservation?.code === res.code ? "#f5f5f5" : "white",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{res.code}</span>
                          <span
                            className={[
                              "my-res-status-pill",
                              isActive ? "status-activa" : "status-cancelada",
                            ].join(" ")}
                            style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
                          >
                            {isActive ? "Activa" : "Cancelada"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                          <div>Fecha: {res.date} a las {res.time}</div>
                          <div>Personas: {res.people}</div>
                          <div>Zona: {res.area}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* TARJETA DE DETALLE / EDICIÓN */}
            <section className="my-res-card my-res-detail-card">
              <h2>Detalle de la reserva</h2>

              {!selectedReservation && (
                <p className="my-res-empty">
                  Aquí verás los detalles de tu reserva una vez que la
                  busques. Introduce tu código o email en el formulario de la
                  izquierda.
                </p>
              )}

              {selectedReservation && (
                <>
                  <div className="my-res-status-row">
                    <span className="my-res-code">{selectedReservation.code}</span>
                    <span
                      className={[
                        "my-res-status-pill",
                        isReservationActive ? "status-activa" : "status-cancelada",
                      ].join(" ")}
                    >
                      {isReservationActive ? "Activa" : "Cancelada"}
                    </span>
                  </div>

                  {!editMode && (
                    <div className="my-res-summary">
                      <ul>
                        <li>
                          <strong>Nombre:</strong> {selectedReservation.name}
                        </li>
                        <li>
                          <strong>Correo:</strong> {selectedReservation.email}
                        </li>
                        {selectedReservation.phone && (
                          <li>
                            <strong>Teléfono:</strong> {selectedReservation.phone}
                          </li>
                        )}
                        <li>
                          <strong>Fecha:</strong> {selectedReservation.date}
                        </li>
                        <li>
                          <strong>Hora:</strong> {selectedReservation.time}
                        </li>
                        <li>
                          <strong>Personas:</strong> {selectedReservation.people}
                        </li>
                        <li>
                          <strong>Zona:</strong> {selectedReservation.area}
                        </li>
                        {selectedReservation.comments && (
                          <li>
                            <strong>Comentarios:</strong> {selectedReservation.comments}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {editMode && editDataForm && (
                    <form
                      className="my-res-edit-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveChanges();
                      }}
                    >
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="fechaEdit">Fecha</label>
                          <input
                            id="fechaEdit"
                            name="date"
                            type="date"
                            value={editDataForm.date}
                            onChange={handleEditFormDataChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="horaEdit">Hora</label>
                          <input
                            id="horaEdit"
                            name="time"
                            type="time"
                            value={editDataForm.time}
                            onChange={handleEditFormDataChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="personasEdit">Personas</label>
                          <select
                            id="personasEdit"
                            name="people"
                            value={editDataForm.people}
                            onChange={handleEditFormDataChange}
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="zonaEdit">Zona</label>
                          <select
                            id="zonaEdit"
                            name="area"
                            value={editDataForm.area}
                            onChange={handleEditFormDataChange}
                          >
                            <option value="Sin preferencia">Sin preferencia</option>
                            {tableAreas.map((area) => (
                              <option key={area.id} value={area.label}>
                                {area.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="comentariosEdit">
                            Comentarios / peticiones
                          </label>
                          <textarea
                            id="comentariosEdit"
                            name="comments"
                            rows="3"
                            value={editDataForm.comments}
                            onChange={handleEditFormDataChange}
                          />
                        </div>
                      </div>

                      <div className="my-res-actions">
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={isEditing}
                        >
                          {isEditing ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditMode(false);
                            setEditDataForm(selectedReservation);
                          }}
                          disabled={isEditing}
                        >
                          Cancelar edición
                        </button>
                      </div>
                    </form>
                  )}

                  {/* BOTONES PRINCIPALES (MODIFICAR / CANCELAR) */}
                  {selectedReservation && !editMode && (
                    <div className="my-res-actions">
                      {isReservationActive && (
                        <>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              setEditMode(true);
                            }}
                            disabled={isCancelling}
                          >
                            Modificar reserva
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCancelReservation}
                            disabled={isCancelling}
                          >
                            {isCancelling ? "Cancelando..." : "Cancelar reserva"}
                          </button>
                        </>
                      )}
                      {!isReservationActive && (
                        <p className="reservation-message">
                          Esta reserva se encuentra cancelada.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
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
