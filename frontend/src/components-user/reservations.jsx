import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

export default function MisReservas() {
  const [search, setSearch] = useState({
    code: "",
    email: "",
  });

  const [reservation, setReservation] = useState(null);        // reserva cargada
  const [editDataForm, setEditDataForm] = useState(null);      // copia editable
  const [editMode, setEditMode] = useState(false);
  const [reservationState, setReservationState] = useState(null); // true | false

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReservationSearch = (e) => {
    e.preventDefault();

    // ⚠️ AQUÍ IRÁ EL BACKEND:
    // Ejemplo: fetch(`/api/reservas?codigo=${search.codigo}&email=${search.email}`)
    // Por ahora simulamos que siempre se encuentra una reserva:

    const simulatedReservation = {
      code: search.code || "DIN-ABC123",
      name: "Ana López",
      email: search.email || "ana.ejemplo@email.com",
      phone: "55 1234 5678",
      date: "2025-05-20",
      time: "20:00",
      people: "4",
      zone: "terraza",
      comments: "Mesa cerca de la ventana.",
      plate: "Pollo a la parrilla con verduras",
    };

    setReservation(simulatedReservation);
    setEditDataForm(simulatedReservation);
    setReservationState(true);
    setEditMode(false);
  };

  const handleEditFormDataChange = (e) => {
    const { name, value } = e.target;
    setEditDataForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas guardar los cambios en tu reserva?"
    );
    if (!confirmation) return;

    // ⚠️ AQUÍ IRÍA UN PUT/PATCH AL BACKEND
    // Ejemplo: fetch(`/api/reservas/${reserva.codigo}`, { method: "PUT", body: JSON.stringify(editDataForm) })

    setReservation(editDataForm);
    setEditMode(false);
  };

  const handleCancelReservation = () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas cancelar tu reserva? Esta acción no se puede deshacer."
    );
    if (!confirmation) return;

    // ⚠️ AQUÍ IRÍA UN DELETE / POST cancelación AL BACKEND

    setReservationState(false);
  };

  return (
    <section className="my-reservations-page">
          <div className="container">
            {/* ENCABEZADO */}
            <header className="my-reservations-header">
              <p className="my-res-eyebrow">Mis reservas</p>
              <h1>Consulta, modifica o cancela tu reserva</h1>
              <p>
                Ingresa el código de tu reserva y tu email electrónico para
                ver los detalles. Desde aquí podrás modificar algunos datos o
                cancelar la reserva si ya no la necesitas.
              </p>
            </header>

            <div className="my-reservations-grid">
              {/* TARJETA DE BÚSQUEDA */}
              <section className="my-res-card">
                <h2>Buscar mi reserva</h2>
                <form onSubmit={handleReservationSearch} className="my-res-search-form">
                  <div className="form-group">
                    <label htmlFor="code">Código de reserva</label>
                    <input id="code" name="code" type="text" placeholder="Ej. DIN-ABC123" value={search.code} onChange={handleSearchChange} required/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="emailBusqueda">Correo electrónico</label>
                    <input id="emailBusqueda" name="email" type="email" placeholder="tuemail@ejemplo.com" value={search.email} onChange={handleSearchChange} required/>
                  </div>

                  <button type="submit" className="btn-primary">
                    Buscar reserva
                  </button>
                </form>
              </section>

              {/* TARJETA DE DETALLE / EDICIÓN */}
              <section className="my-res-card my-res-detail-card">
                <h2>Detalle de la reserva</h2>

                {!reservation && (
                  <p className="my-res-empty">
                    Aquí verás los detalles de tu reserva una vez que la
                    busques. Introduce tu código y email en el formulario de la
                    izquierda.
                  </p>
                )}

                {reservation && (
                  <>
                    <div className="my-res-status-row">
                      <span className="my-res-code">{reservation.code}</span>
                      <span className={["my-res-status-pill", reservationState ? "status-activa" : "status-cancelada",].join(" ")}>
                        {reservationState ? "Activa" : "Cancelada"}
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
                          <li>
                            <strong>Teléfono:</strong> {reservation.phone}
                          </li>
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
                            <strong>Zona:</strong> {reservation.zone}
                          </li>
                          {reservation.plate && (
                            <li>
                              <strong>Platillo preseleccionado:</strong>{" "}
                              {reservation.plate}
                            </li>
                          )}
                          {reservation.comments && (
                            <li>
                              <strong>Comentarios:</strong> {reservation.comments}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {editMode && editDataForm && (
                      <form className="my-res-edit-form" onSubmit={(e) => {e.preventDefault(); handleSaveChanges(); }}>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="fechaEdit">Fecha</label>
                            <input id="fechaEdit" name="date" type="date" value={editDataForm.date} onChange={handleEditFormDataChange} required/>
                          </div>

                          <div className="form-group">
                            <label htmlFor="horaEdit">Hora</label>
                            <input id="horaEdit" name="time" type="time" value={editDataForm.time} onChange={handleEditFormDataChange} required/>
                          </div>

                          <div className="form-group">
                            <label htmlFor="personasEdit">Personas</label>
                            <select id="personasEdit" name="people" value={editDataForm.people} onChange={handleEditFormDataChange}>
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
                            <select id="zonaEdit" name="zone" value={editDataForm.zone} onChange={handleEditFormDataChange}>
                              <option value="interior">Interior</option>
                              <option value="terraza">Terraza</option>
                              <option value="barra">Barra</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="comentariosEdit">
                              Comentarios / peticiones
                            </label>
                            <textarea id="comentariosEdit" name="comments" rows="3" value={editDataForm.comments} onChange={handleEditFormDataChange}/>
                          </div>
                        </div>

                        <div className="my-res-actions">
                          <button type="submit" className="btn-primary">
                            Guardar cambios
                          </button>
                          <button type="button" className="btn-secondary" onClick={() => {setEditMode(false);setEditDataForm(reservation);}}>
                            Cancelar edición
                          </button>
                        </div>
                      </form>
                    )}

                    {/* BOTONES PRINCIPALES (MODIFICAR / CANCELAR) */}
                    {reservation && !editMode && (
                      <div className="my-res-actions">
                        {reservationState && (
                          <>
                            <button type="button" className="btn-primary" onClick={() => {setEditMode(true);}}>
                              Modificar reserva
                            </button>
                            <button type="button" className="btn-secondary" onClick={handleCancelReservation}>
                              Cancelar reserva
                            </button>
                          </>
                        )}
                        {!reservationState && (
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