import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import { getUserReservation, editUserReservation, cancelUserReservation, getTableAreas } from "../fetch/user.jsx";
import Messages from "../util-components/messages.jsx";
import "../styles/global.css";

export default function MisReservas() {
  const { setErrorMessage, setSuccessMessage, resetMessages } = useMessagesContext();

  const [search, setSearch] = useState({
    code: "",
    email: "",
  });

  const [reservation, setReservation] = useState(null);
  const [editDataForm, setEditDataForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [tableAreas, setTableAreas] = useState([]);

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

  function formatDateTimeForDisplay(dateTime) {
    if (!dateTime) return { date: "", time: "" };
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
    if (!search.code.trim() && !search.email.trim()) {
      setErrorMessage("Por favor ingresa el código de reserva o tu correo electrónico");
      return;
    }

    setIsSearching(true);

    const response = await getUserReservation(
      search.code.trim() || null,
      search.email.trim() || null
    );

    setIsSearching(false);

    if (response.status === 500 || response.error) {
      setErrorMessage("Hubo un error al intentar buscar la reservación");
      return;
    }

    if (response.status === 404 || response.status === 400) {
      setErrorMessage(response.errorMessage || "No se encontró la reservación");
      setReservation(null);
      setEditDataForm(null);
      return;
    }

    if (response.status === 200 && response.reservation) {
      const transformedReservation = transformReservationData(response.reservation);
      setReservation(transformedReservation);
      setEditDataForm(transformedReservation);
      setEditMode(false);
      setSuccessMessage("Reservación encontrada");
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
      code: reservation.code,
      email: reservation.email,
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
      setReservation(transformedReservation);
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

    const response = await cancelUserReservation(reservation.code, reservation.email);

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

  const isReservationActive = reservation?.state === "active";

  return (
    <section className="my-reservations-page">
      <div className="container">
        {/* ENCABEZADO */}
        <header className="my-reservations-header">
          <p className="my-res-eyebrow">Mis reservas</p>
          <h1>Consulta, modifica o cancela tu reserva</h1>
          <p>
            Ingresa el código de tu reserva o tu correo electrónico para
            ver los detalles. Desde aquí podrás modificar algunos datos o
            cancelar la reserva si ya no la necesitas.
          </p>
        </header>

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

              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                Ingresa al menos uno de los campos para buscar tu reserva
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

          {/* TARJETA DE DETALLE / EDICIÓN */}
          <section className="my-res-card my-res-detail-card">
            <h2>Detalle de la reserva</h2>

            {!reservation && (
              <p className="my-res-empty">
                Aquí verás los detalles de tu reserva una vez que la
                busques. Introduce tu código o email en el formulario de la
                izquierda.
              </p>
            )}

            {reservation && (
              <>
                <div className="my-res-status-row">
                  <span className="my-res-code">{reservation.code}</span>
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
                        <strong>Nombre:</strong> {reservation.name}
                      </li>
                      <li>
                        <strong>Correo:</strong> {reservation.email}
                      </li>
                      {reservation.phone && (
                        <li>
                          <strong>Teléfono:</strong> {reservation.phone}
                        </li>
                      )}
                      <li>
                        <strong>Fecha:</strong> {reservation.date}
                      </li>
                      <li>
                        <strong>Hora:</strong> {reservation.time}
                      </li>
                      <li>
                        <strong>Personas:</strong> {reservation.people}
                      </li>
                      <li>
                        <strong>Zona:</strong> {reservation.area}
                      </li>
                      {reservation.comments && (
                        <li>
                          <strong>Comentarios:</strong> {reservation.comments}
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
                          setEditDataForm(reservation);
                        }}
                        disabled={isEditing}
                      >
                        Cancelar edición
                      </button>
                    </div>
                  </form>
                )}

                {/* BOTONES PRINCIPALES (MODIFICAR / CANCELAR) */}
                {reservation && !editMode && (
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
