import { useState } from "react";
import { Link } from "react-router-dom";

export default function Reserva() {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    fecha: "",
    hora: "",
    personas: "2",
    zona: "interior",
    comentarios: "",
  });

  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]); // horarios simulados
  const [selectedSlot, setSelectedSlot] = useState(null); // horario elegido

  // Preselección de platillo
  const [quierePlato, setQuierePlato] = useState("no"); // "no" | "si"
  const [platoSeleccionado, setPlatoSeleccionado] = useState("");

  // NUEVO: resumen de reserva confirmada
  const [resumenReserva, setResumenReserva] = useState(null);

  // Menú resumido para preselección
  const menuPreseleccion = {
    entrada: [
      { nombre: "Guacamole con totopos", precio: "$115 MXN" },
      { nombre: "Papas fritas con cheddar", precio: "$120 MXN" },
      { nombre: "Bruschettas con jitomate y albahaca", precio: "$130 MXN" },
    ],
    comida: [
      { nombre: "Pollo a la parrilla con verduras", precio: "$210 MXN" },
      { nombre: "Hamburguesa gourmet Dinely", precio: "$190 MXN" },
      { nombre: "Pasta al pesto", precio: "$185 MXN" },
    ],
    bebida: [
      { nombre: "Limonada natural", precio: "$55 MXN" },
      { nombre: "Smoothie de fresa", precio: "$70 MXN" },
      { nombre: "Café latte", precio: "$60 MXN" },
    ],
  };

  const handleCambio = (e) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnviar = (e) => {
    e.preventDefault();

    // Cada vez que se busca disponibilidad, limpiamos el resumen previo
    setResumenReserva(null);

    const horariosBase = [
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00",
    ];

    const slots = horariosBase.map((horaSlot) => ({
      hora: horaSlot,
      disponible: Math.random() > 0.3, // simulación de disponibilidad
    }));

    setDisponibilidad(slots);
    setSelectedSlot(null);

    const hayDisponibles = slots.some((s) => s.disponible);

    let mensajeBase;
    if (hayDisponibles) {
      mensajeBase = `Estos son los horarios disponibles para tu visita de ${
        datosFormulario.personas
      } persona(s) el día ${datosFormulario.fecha || "(fecha por definir)"}:`;
    } else {
      mensajeBase =
        "No encontramos horarios disponibles para la fecha seleccionada. Prueba con otro horario o día.";
    }

    if (platoSeleccionado) {
      mensajeBase += ` Has preseleccionado el platillo "${platoSeleccionado}".`;
    }

    setMensajeConfirmacion(mensajeBase);
  };

  // NUEVO: confirmar reserva y generar código
  const handleConfirmReserva = () => {
    if (!selectedSlot) return;

    const codigo = "DIN-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    setResumenReserva({
      codigo,
      nombre: datosFormulario.nombre,
      correo: datosFormulario.correo,
      telefono: datosFormulario.telefono,
      fecha: datosFormulario.fecha,
      hora: selectedSlot,
      personas: datosFormulario.personas,
      zona: datosFormulario.zona,
      platillo: platoSeleccionado || null,
    });
  };

  return (
    <div className="app-root">
      <main>
        <section className="reservation-page">
          <div className="container">
            {/* ENCABEZADO */}
            <div className="reservation-header">
              <h1>Reserva tu mesa</h1>
              <p>
                Completa los datos de tu visita y envía tu solicitud. Nosotros
                nos encargamos de tener tu mesa lista para que solo llegues a
                disfrutar.
              </p>
            </div>

            {/* GRID PRINCIPAL */}
            <div className="reservation-grid">
              {/* TARJETA DEL FORMULARIO */}
              <div className="reservation-card">
                <h2>Datos de tu reserva</h2>

                <form className="reservation-form" onSubmit={handleEnviar}>
                  {/* Nombre y correo */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre completo</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={datosFormulario.nombre}
                        onChange={handleCambio}
                        placeholder="Ej. Ana López"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="correo">Correo electrónico</label>
                      <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={datosFormulario.correo}
                        onChange={handleCambio}
                        placeholder="tucorreo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono de contacto</label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={datosFormulario.telefono}
                        onChange={handleCambio}
                        placeholder="Ej. 55 1234 5678"
                      />
                    </div>
                  </div>

                  {/* Fecha, hora, personas */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fecha">Fecha</label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={datosFormulario.fecha}
                        onChange={handleCambio}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="hora">Hora aproximada</label>
                      <input
                        type="time"
                        id="hora"
                        name="hora"
                        value={datosFormulario.hora}
                        onChange={handleCambio}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="personas">Número de personas</label>
                      <select
                        id="personas"
                        name="personas"
                        value={datosFormulario.personas}
                        onChange={handleCambio}
                      >
                        <option value="1">1 persona</option>
                        <option value="2">2 personas</option>
                        <option value="3">3 personas</option>
                        <option value="4">4 personas</option>
                        <option value="5">5 personas</option>
                        <option value="6">6 personas</option>
                        <option value="7">7 personas</option>
                        <option value="8">8 personas</option>
                      </select>
                    </div>
                  </div>

                  {/* Zona preferida */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Preferencia de zona</label>
                      <div className="zone-options">
                        <label>
                          <input
                            type="radio"
                            name="zona"
                            value="interior"
                            checked={datosFormulario.zona === "interior"}
                            onChange={handleCambio}
                          />
                          Interior
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="zona"
                            value="terraza"
                            checked={datosFormulario.zona === "terraza"}
                            onChange={handleCambio}
                          />
                          Terraza
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="zona"
                            value="barra"
                            checked={datosFormulario.zona === "barra"}
                            onChange={handleCambio}
                          />
                          Barra
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Comentarios */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="comentarios">
                        Comentarios o peticiones especiales
                      </label>
                      <textarea
                        id="comentarios"
                        name="comentarios"
                        value={datosFormulario.comentarios}
                        onChange={handleCambio}
                        rows="3"
                        placeholder="Ej. Cumpleaños, alergias, silla para bebé..."
                      />
                    </div>
                  </div>

                  {/* ¿Preseleccionar platillo? */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>¿Quieres preseleccionar algún platillo?</label>
                      <div className="zone-options">
                        <label>
                          <input
                            type="radio"
                            name="preseleccion"
                            value="no"
                            checked={quierePlato === "no"}
                            onChange={() => setQuierePlato("no")}
                          />
                          No, decidiré al llegar
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="preseleccion"
                            value="si"
                            checked={quierePlato === "si"}
                            onChange={() => setQuierePlato("si")}
                          />
                          Sí, quiero ver el menú
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* MENÚ COMPACTO PARA PRESELECCIÓN */}
                  {quierePlato === "si" && (
                    <div className="preselect-section">
                      <h3>Elige un platillo de nuestro menú</h3>
                      <p className="preselect-sub">
                        Esta selección es opcional y podrás cambiarla al llegar
                        al restaurante.
                      </p>

                      <div className="preselect-columns">
                        {/* Entrada */}
                        <div className="preselect-column">
                          <h4>Entrada</h4>
                          <ul className="preselect-list">
                            {menuPreseleccion.entrada.map((item) => (
                              <li key={item.nombre}>
                                <button
                                  type="button"
                                  className={[
                                    "preselect-item-btn",
                                    platoSeleccionado === item.nombre
                                      ? "preselect-item-btn-selected"
                                      : "",
                                  ].join(" ")}
                                  onClick={() =>
                                    setPlatoSeleccionado(item.nombre)
                                  }
                                >
                                  <span>{item.nombre}</span>
                                  <span className="preselect-price">
                                    {item.precio}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Comida */}
                        <div className="preselect-column">
                          <h4>Plato fuerte</h4>
                          <ul className="preselect-list">
                            {menuPreseleccion.comida.map((item) => (
                              <li key={item.nombre}>
                                <button
                                  type="button"
                                  className={[
                                    "preselect-item-btn",
                                    platoSeleccionado === item.nombre
                                      ? "preselect-item-btn-selected"
                                      : "",
                                  ].join(" ")}
                                  onClick={() =>
                                    setPlatoSeleccionado(item.nombre)
                                  }
                                >
                                  <span>{item.nombre}</span>
                                  <span className="preselect-price">
                                    {item.precio}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Bebida */}
                        <div className="preselect-column">
                          <h4>Bebida</h4>
                          <ul className="preselect-list">
                            {menuPreseleccion.bebida.map((item) => (
                              <li key={item.nombre}>
                                <button
                                  type="button"
                                  className={[
                                    "preselect-item-btn",
                                    platoSeleccionado === item.nombre
                                      ? "preselect-item-btn-selected"
                                      : "",
                                  ].join(" ")}
                                  onClick={() =>
                                    setPlatoSeleccionado(item.nombre)
                                  }
                                >
                                  <span>{item.nombre}</span>
                                  <span className="preselect-price">
                                    {item.precio}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {platoSeleccionado && (
                        <p className="reservation-message">
                          Has preseleccionado:{" "}
                          <strong>{platoSeleccionado}</strong>.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botón buscar disponibilidad */}
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Buscar disponibilidad
                    </button>
                  </div>

                  {/* Mensaje de disponibilidad */}
                  {mensajeConfirmacion && (
                    <p className="reservation-message">
                      {mensajeConfirmacion}
                    </p>
                  )}

                  {/* LISTA DE HORARIOS */}
                  {disponibilidad.length > 0 && (
                    <div className="availability-section">
                      <h3>Horarios para elegir</h3>
                      <div className="availability-grid">
                        {disponibilidad.map((slot) => {
                          const isSelected = selectedSlot === slot.hora;
                          const isDisabled = !slot.disponible;

                          return (
                            <button
                              key={slot.hora}
                              type="button"
                              className={[
                                "slot-button",
                                slot.disponible
                                  ? "slot-available"
                                  : "slot-unavailable",
                                isSelected ? "slot-selected" : "",
                              ].join(" ")}
                              disabled={isDisabled}
                              onClick={() => {
                                if (!isDisabled) {
                                  setSelectedSlot(slot.hora);
                                }
                              }}
                            >
                              {slot.hora}
                            </button>
                          );
                        })}
                      </div>

                      {selectedSlot && (
                        <>
                          <p className="reservation-message">
                            Has elegido el horario{" "}
                            <strong>{selectedSlot}</strong>. Ahora puedes
                            confirmar tu reserva.
                          </p>
                          <button
                            type="button"
                            className="btn-primary confirm-reservation-btn"
                            onClick={handleConfirmReserva}
                          >
                            Confirmar reserva
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* RESUMEN DE RESERVA CONFIRMADA */}
                  {resumenReserva && (
                    <div className="reservation-summary">
                      <h3>Tu reserva ha sido registrada</h3>
                      <p className="summary-code">
                        Código de reserva:{" "}
                        <span>{resumenReserva.codigo}</span>
                      </p>
                      <ul>
                        <li>
                          <strong>Nombre:</strong> {resumenReserva.nombre}
                        </li>
                        <li>
                          <strong>Correo:</strong> {resumenReserva.correo}
                        </li>
                        {resumenReserva.telefono && (
                          <li>
                            <strong>Teléfono:</strong>{" "}
                            {resumenReserva.telefono}
                          </li>
                        )}
                        <li>
                          <strong>Fecha:</strong> {resumenReserva.fecha}
                        </li>
                        <li>
                          <strong>Hora:</strong> {resumenReserva.hora}
                        </li>
                        <li>
                          <strong>Personas:</strong> {resumenReserva.personas}
                        </li>
                        <li>
                          <strong>Zona:</strong> {resumenReserva.zona}
                        </li>
                        {resumenReserva.platillo && (
                          <li>
                            <strong>Platillo preseleccionado:</strong>{" "}
                            {resumenReserva.platillo}
                          </li>
                        )}
                      </ul>
                      <p className="summary-note">
                        Guarda este código. Más adelante podrás usarlo para
                        consultar o cancelar tu reserva cuando el sistema esté
                        conectado al backend.
                      </p>
                    </div>
                  )}
                </form>
              </div>

              {/* COLUMNA LATERAL */}
              <aside className="reservation-info">
                <h3>Antes de tu visita</h3>
                <p>
                  Te recomendamos llegar 10 minutos antes de la hora elegida
                  para asegurar que tu mesa esté lista y puedas acomodarte con
                  calma.
                </p>
                <ul>
                  <li>
                    Las reservas se guardan con un tiempo de tolerancia de 15
                    minutos.
                  </li>
                </ul>
                <p>
                  Si tienes alguna alergia o requerimiento especial, escríbelo
                  en los comentarios para que el equipo pueda prepararse.
                </p>
              </aside>
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
