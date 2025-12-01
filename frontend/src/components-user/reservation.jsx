import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../application-context/user-context.jsx";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import { createUserReservation, getTableAreas } from "../fetch/user.jsx";
import Messages from "../util-components/messages.jsx";

export default function Reserva() {
  const { user, userLoading } = useUserContext();
  const { setErrorMessage, setSuccessMessage, setLoadingMessage, resetMessages } = useMessagesContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    people: "2",
    tableArea: "",
    comments: "",
  });

  const [tableAreas, setTableAreas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSummary, setReservationSummary] = useState(null);

  // Load table areas on mount
  useEffect(() => {
    async function loadTableAreas() {
      const response = await getTableAreas();
      if (response.status === 200) {
        setTableAreas(response.tableAreas);
      } else {
        setErrorMessage("Error al cargar las áreas disponibles");
      }
    }

    loadTableAreas();
  }, []);

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user && !userLoading) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
      }));
    }
  }, [user, userLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function combineDateTime(date, time) {
    if (!date || !time) return null;
    const dateTimeString = `${date}T${time}:00`;
    return new Date(dateTimeString).toISOString();
  }

  function formatDateTimeForDisplay(dateTime) {
    if (!dateTime) return { date: "", time: "" };
    const dt = new Date(dateTime);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().split(' ')[0].substring(0, 5);
    return { date, time };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setIsSubmitting(true);
    setLoadingMessage("Creando reserva...");

    const dateTime = combineDateTime(formData.date, formData.time);
    if (!dateTime) {
      setLoadingMessage("");
      setIsSubmitting(false);
      setErrorMessage("Por favor ingresa una fecha y hora válidas");
      return;
    }

    const reservationData = {
      name: formData.name,
      email: formData.email || "",
      phone_number: formData.phone || "",
      date_time: dateTime,
      table_area: formData.tableArea || null,
      amount_people: parseInt(formData.people),
      notes: formData.comments || "",
    };

    const response = await createUserReservation(reservationData);

    setLoadingMessage("");
    setIsSubmitting(false);

    if (response.status === 500 || response.error) {
      setErrorMessage("Hubo un error al intentar procesar la solicitud");
      return;
    }

    if (response.status === 400) {
      // Validation errors
      const errors = response.validationErrors || {};
      let errorMessage = "Error al crear la reservación:\n";

      if (errors.valid_name === false) {
        errorMessage += "- El nombre es requerido\n";
      }
      if (errors.valid_email === false) {
        errorMessage += "- El formato del email no es válido\n";
      }
      if (errors.valid_date_time === false) {
        errorMessage += "- La fecha y hora son requeridas y deben ser en el futuro\n";
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

    if (response.status === 201) {
      if (response.reservation) {
        const { date, time } = formatDateTimeForDisplay(response.reservation.date_time);
        setReservationSummary({
          code: response.reservation.code,
          name: response.reservation.name,
          email: response.reservation.email,
          phone: response.reservation.phone_number,
          date: date,
          time: time,
          people: response.reservation.amount_people,
          area: formData.tableArea || "Sin preferencia",
        });
        setSuccessMessage("Reservación creada con éxito!");
      }
    } else {
      setErrorMessage(`Error desconocido con código de estatus: ${response.status}`);
    }
  };

  const isUserLoggedIn = user && !userLoading;

  return (
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

            <form className="reservation-form" onSubmit={handleSubmit}>
              <Messages />

              {/* Nombre y email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Ana López"
                    required={!isUserLoggedIn}
                    readOnly={isUserLoggedIn}
                    style={isUserLoggedIn ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tuemail@ejemplo.com"
                    required={!isUserLoggedIn}
                    readOnly={isUserLoggedIn}
                    style={isUserLoggedIn ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Teléfono de contacto</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej. 55 1234 5678"
                    readOnly={isUserLoggedIn}
                    style={isUserLoggedIn ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
                  />
                </div>
              </div>

              {/* Fecha, hora, personas */}
              <div className="form-row">
                <div className="form-group">
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

                <div className="form-group">
                  <label htmlFor="time">Hora aproximada</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="people">Número de personas</label>
                  <select
                    id="people"
                    name="people"
                    value={formData.people}
                    onChange={handleChange}
                    required
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
                  <label htmlFor="tableArea">Preferencia de zona</label>
                  <select
                    id="tableArea"
                    name="tableArea"
                    value={formData.tableArea}
                    onChange={handleChange}
                  >
                    <option value="">Sin preferencia</option>
                    {tableAreas.map((area) => (
                      <option key={area.id} value={area.label}>
                        {area.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comentarios */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="comments">
                    Comentarios o peticiones especiales
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ej. Cumpleaños, alergias, silla para bebé..."
                  />
                </div>
              </div>

              {/* Botón enviar */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creando reserva..." : "Crear reserva"}
                </button>
              </div>

              {/* RESUMEN DE RESERVA CONFIRMADA */}
              {reservationSummary && (
                <div className="reservation-summary">
                  <h3>Tu reserva ha sido registrada</h3>
                  <p className="summary-code">
                    Código de reserva:{" "}
                    <span>{reservationSummary.code}</span>
                  </p>
                  <ul>
                    <li>
                      <strong>Nombre:</strong> {reservationSummary.name}
                    </li>
                    <li>
                      <strong>Correo:</strong> {reservationSummary.email}
                    </li>
                    {reservationSummary.phone && (
                      <li>
                        <strong>Teléfono:</strong>{" "}
                        {reservationSummary.phone}
                      </li>
                    )}
                    <li>
                      <strong>Fecha:</strong> {reservationSummary.date}
                    </li>
                    <li>
                      <strong>Hora:</strong> {reservationSummary.time}
                    </li>
                    <li>
                      <strong>Personas:</strong> {reservationSummary.people}
                    </li>
                    <li>
                      <strong>Zona:</strong> {reservationSummary.area}
                    </li>
                  </ul>
                  <p className="summary-note">
                    Guarda este código. Más adelante podrás usarlo para
                    consultar o cancelar tu reserva.
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
