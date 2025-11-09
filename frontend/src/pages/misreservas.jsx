import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

function MisReservas() {
  const [busqueda, setBusqueda] = useState({
    codigo: "",
    correo: "",
  });

  const [reserva, setReserva] = useState(null);        // reserva cargada
  const [editData, setEditData] = useState(null);      // copia editable
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [estadoReserva, setEstadoReserva] = useState(null); // "activa" | "cancelada"

  const handleBusquedaChange = (e) => {
    const { name, value } = e.target;
    setBusqueda((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBuscarReserva = (e) => {
    e.preventDefault();

    // ⚠️ AQUÍ IRÁ EL BACKEND:
    // Ejemplo: fetch(`/api/reservas?codigo=${busqueda.codigo}&correo=${busqueda.correo}`)
    // Por ahora simulamos que siempre se encuentra una reserva:

    const reservaSimulada = {
      codigo: busqueda.codigo || "DIN-ABC123",
      nombre: "Ana López",
      correo: busqueda.correo || "ana.ejemplo@correo.com",
      telefono: "55 1234 5678",
      fecha: "2025-05-20",
      hora: "20:00",
      personas: "4",
      zona: "terraza",
      comentarios: "Mesa cerca de la ventana.",
      platillo: "Pollo a la parrilla con verduras",
    };

    setReserva(reservaSimulada);
    setEditData(reservaSimulada);
    setEstadoReserva("activa");
    setModoEdicion(false);
    setMensaje("Reserva encontrada. Puedes modificarla o cancelarla.");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardarCambios = () => {
    const seguro = window.confirm(
      "¿Estás seguro de que deseas guardar los cambios en tu reserva?"
    );
    if (!seguro) return;

    // ⚠️ AQUÍ IRÍA UN PUT/PATCH AL BACKEND
    // Ejemplo: fetch(`/api/reservas/${reserva.codigo}`, { method: "PUT", body: JSON.stringify(editData) })

    setReserva(editData);
    setModoEdicion(false);
    setMensaje(
      "Tu reserva ha sido actualizada. Cuando el sistema esté conectado al backend, los cambios se guardarán definitivamente."
    );
  };

  const handleCancelarReserva = () => {
    const seguro = window.confirm(
      "¿Estás seguro de que deseas cancelar tu reserva? Esta acción no se puede deshacer."
    );
    if (!seguro) return;

    // ⚠️ AQUÍ IRÍA UN DELETE / POST cancelación AL BACKEND

    setEstadoReserva("cancelada");
    setMensaje(
      "Tu reserva ha sido marcada como cancelada. Cuando el sistema esté conectado al backend, se reflejará en el sistema."
    );
  };

  return (
    <div className="app-root">
      <main>
        <section className="my-reservations-page">
          <div className="container">
            {/* ENCABEZADO */}
            <header className="my-reservations-header">
              <p className="my-res-eyebrow">Mis reservas</p>
              <h1>Consulta, modifica o cancela tu reserva</h1>
              <p>
                Ingresa el código de tu reserva y tu correo electrónico para
                ver los detalles. Desde aquí podrás modificar algunos datos o
                cancelar la reserva si ya no la necesitas.
              </p>
            </header>

            <div className="my-reservations-grid">
              {/* TARJETA DE BÚSQUEDA */}
              <section className="my-res-card">
                <h2>Buscar mi reserva</h2>
                <form onSubmit={handleBuscarReserva} className="my-res-search-form">
                  <div className="form-group">
                    <label htmlFor="codigo">Código de reserva</label>
                    <input
                      id="codigo"
                      name="codigo"
                      type="text"
                      placeholder="Ej. DIN-ABC123"
                      value={busqueda.codigo}
                      onChange={handleBusquedaChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="correoBusqueda">Correo electrónico</label>
                    <input
                      id="correoBusqueda"
                      name="correo"
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={busqueda.correo}
                      onChange={handleBusquedaChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary">
                    Buscar reserva
                  </button>
                </form>

                {mensaje && (
                  <p className="reservation-message" style={{ marginTop: "0.8rem" }}>
                    {mensaje}
                  </p>
                )}
              </section>

              {/* TARJETA DE DETALLE / EDICIÓN */}
              <section className="my-res-card my-res-detail-card">
                <h2>Detalle de la reserva</h2>

                {!reserva && (
                  <p className="my-res-empty">
                    Aquí verás los detalles de tu reserva una vez que la
                    busques. Introduce tu código y correo en el formulario de la
                    izquierda.
                  </p>
                )}

                {reserva && (
                  <>
                    <div className="my-res-status-row">
                      <span className="my-res-code">{reserva.codigo}</span>
                      <span
                        className={[
                          "my-res-status-pill",
                          estadoReserva === "cancelada"
                            ? "status-cancelada"
                            : "status-activa",
                        ].join(" ")}
                      >
                        {estadoReserva === "cancelada" ? "Cancelada" : "Activa"}
                      </span>
                    </div>

                    {!modoEdicion && (
                      <div className="my-res-summary">
                        <ul>
                          <li>
                            <strong>Nombre:</strong> {reserva.nombre}
                          </li>
                          <li>
                            <strong>Correo:</strong> {reserva.correo}
                          </li>
                          <li>
                            <strong>Teléfono:</strong> {reserva.telefono}
                          </li>
                          <li>
                            <strong>Fecha:</strong> {reserva.fecha}
                          </li>
                          <li>
                            <strong>Hora:</strong> {reserva.hora}
                          </li>
                          <li>
                            <strong>Personas:</strong> {reserva.personas}
                          </li>
                          <li>
                            <strong>Zona:</strong> {reserva.zona}
                          </li>
                          {reserva.platillo && (
                            <li>
                              <strong>Platillo preseleccionado:</strong>{" "}
                              {reserva.platillo}
                            </li>
                          )}
                          {reserva.comentarios && (
                            <li>
                              <strong>Comentarios:</strong> {reserva.comentarios}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {modoEdicion && editData && (
                      <form
                        className="my-res-edit-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleGuardarCambios();
                        }}
                      >
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="fechaEdit">Fecha</label>
                            <input
                              id="fechaEdit"
                              name="fecha"
                              type="date"
                              value={editData.fecha}
                              onChange={handleEditChange}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="horaEdit">Hora</label>
                            <input
                              id="horaEdit"
                              name="hora"
                              type="time"
                              value={editData.hora}
                              onChange={handleEditChange}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="personasEdit">Personas</label>
                            <select
                              id="personasEdit"
                              name="personas"
                              value={editData.personas}
                              onChange={handleEditChange}
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
                              name="zona"
                              value={editData.zona}
                              onChange={handleEditChange}
                            >
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
                            <textarea
                              id="comentariosEdit"
                              name="comentarios"
                              rows="3"
                              value={editData.comentarios}
                              onChange={handleEditChange}
                            />
                          </div>
                        </div>

                        <div className="my-res-actions">
                          <button type="submit" className="btn-primary">
                            Guardar cambios
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setModoEdicion(false);
                              setEditData(reserva);
                            }}
                          >
                            Cancelar edición
                          </button>
                        </div>
                      </form>
                    )}

                    {/* BOTONES PRINCIPALES (MODIFICAR / CANCELAR) */}
                    {reserva && !modoEdicion && (
                      <div className="my-res-actions">
                        {estadoReserva === "activa" && (
                          <>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => {
                                setModoEdicion(true);
                                setMensaje(
                                  "Estás editando los datos de tu reserva. Recuerda guardar los cambios."
                                );
                              }}
                            >
                              Modificar reserva
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={handleCancelarReserva}
                            >
                              Cancelar reserva
                            </button>
                          </>
                        )}
                        {estadoReserva === "cancelada" && (
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
          </div>
        </section>

        {/* BOTÓN VOLVER AL INICIO */}
        <div className="back-home-container">
          <Link to="/" className="btn-back-home">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}

export default MisReservas;
