import { Link } from "react-router-dom";
import "../styles/global.css";

export default function Ubicacion() {
  return (
    <div className="app-root">
      <main>
        <section className="location-page">
          <div className="container">
            {/* ENCABEZADO */}
            <header className="location-header">
              <p className="location-eyebrow">Ubicación / Contacto</p>
              <h1>Encuentra tu restaurante Dinely</h1>
              <p>
                Aquí podrás ver la ubicación del restaurante, sus horarios y
                formas de contacto para resolver cualquier duda o hacer
                reservaciones especiales.
              </p>
            </header>

            {/* GRID PRINCIPAL */}
            <div className="location-grid">
              {/* TARJETA DE DATOS */}
              <section className="location-card">
                <h2>Datos del restaurante</h2>

                <div className="location-block">
                  <h3>Dirección</h3>
                  <p>
                    Calle Ejemplo #123, Colonia Centro,
                    <br />
                    Ciudad, Estado, País.
                  </p>
                </div>

                <div className="location-block">
                  <h3>Horarios de atención</h3>
                  <ul>
                    <li>Lunes a viernes: 13:00 – 22:00</li>
                    <li>Sábados y domingos: 12:00 – 23:30</li>
                  </ul>
                </div>

                <div className="location-block">
                  <h3>Contacto</h3>
                  <ul>
                    <li>📞 Teléfono: +52 55 1234 5678</li>
                    <li>✉️ Correo: reservas@dinely.com</li>
                    <li>💬 WhatsApp: +52 55 9876 5432</li>
                  </ul>
                </div>

                <p className="location-note">
                  Para grupos mayores a 8 personas o eventos especiales, te
                  recomendamos contactarnos directamente por teléfono o correo.
                </p>
              </section>

              {/* COLUMNA LATERAL */}
              <section className="location-side">
                <div className="map-card">
                  <h2>Cómo llegar</h2>
                  <p>
                    Aquí puedes integrar un mapa más adelante (por ejemplo, un
                    mapa de Google Maps). Por ahora mostramos un espacio
                    reservado con una vista de referencia.
                  </p>
                  <div className="map-placeholder">
                    <span>Mapa próximamente</span>
                  </div>
                </div>

                <div className="contact-card">
                  <h2>Escríbenos un mensaje</h2>
                  <p>
                    Si tienes dudas sobre tu reserva, menú o servicios para
                    eventos, envíanos un mensaje y te responderemos a la
                    brevedad.
                  </p>

                  <form className="contact-form">
                    <div className="form-group">
                      <label htmlFor="nombreContacto">Nombre</label>
                      <input
                        id="nombreContacto"
                        type="text"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="correoContacto">Correo electrónico</label>
                      <input
                        id="correoContacto"
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="mensajeContacto">Mensaje</label>
                      <textarea
                        id="mensajeContacto"
                        rows="3"
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                      />
                    </div>

                    <button type="button" className="btn-primary">
                      Enviar mensaje
                    </button>
                  </form>
                </div>
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