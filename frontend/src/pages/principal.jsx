import { useContextoMensajes } from "../application-context/contexto-mensajes";
import "../styles/global.css";
import { Link } from "react-router-dom";

export default function Principal() {
  const {mensajeError, mensajeExito, mensajeCarga} = useContextoMensajes();

  return (
    <div className="app-root">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-logo">Dinely</div>
          <nav className="navbar-links">
            <Link to="/">Inicio</Link>
            <Link to="/reserva">Reservar mesa</Link>
            <Link to="/menu">Menú</Link>
            <Link to="/ubicacion">Ubicación / Contacto</Link>
            <Link to="/opiniones">Opiniones</Link>
             <Link to="/mis-reservas">Mis reservas</Link>
             <Link to="/login">Iniciar sesión</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <div className="alert-container">
          {mensajeError && 
          <div className="alert alert-danger my-2 alert-positioning d-flex align-items-center" style={{whiteSpace: "pre-line"}} onClick={(e) => {e.stopPropagation();resetApplicationMessages();}}>
              {mensajeError}
              <button className="ms-auto btn btn-link link-no-decorations p-0">
                  <h4 aria-hidden="true">&times;</h4>
              </button>
          </div>
          }
          {mensajeExito && 
          <div className="alert alert-success my-2 alert-positioning d-flex align-items-center" style={{whiteSpace: "pre-line"}} onClick={(e) => {e.stopPropagation();resetApplicationMessages();}}>
              {mensajeExito}
              <button className="ms-auto btn btn-link link-no-decorations p-0">
                  <h4 aria-hidden="true">&times;</h4>
              </button>
          </div>
          }
          {mensajeCarga && 
          <div className="alert alert-secondary my-2 alert-positioning d-flex align-items-center" style={{whiteSpace: "pre-line"}} onClick={(e) => {e.stopPropagation();resetApplicationMessages();}}>
              {mensajeCarga}
              <button className="ms-auto btn btn-link link-no-decorations p-0">
                  <h4 aria-hidden="true">&times;</h4>
              </button>
          </div>
          }
        </div>
        <section id="inicio" className="hero">
          <div className="hero-overlay">
            <div className="container hero-content">
              <h1 className="hero-title">
                RESERVA TU MESA EN SEGUNDOS SIN LLAMADAS NI FILAS
              </h1>
              <p className="hero-subtitle">
                Elige la hora, el día y el número de personas desde tu celular
                o computadora y llega directo a disfrutar. Tu mesa ya estará
                lista.
              </p>

           <div className="hero-buttons">
                <Link to="/reserva" className="btn-primary">
                  Reservar ahora
                </Link>

                <Link to="/menu" className="btn-secondary">
                  Ver menú
                </Link>
            </div>

            </div>
          </div>
        </section>

        {/* SECCIÓN INTERMEDIA (por qué usar Dinely) */}
        <section id="reservar" className="features">
          <div className="container">
            <h2 className="section-title">Haz tu reserva sin complicaciones</h2>
            <p className="section-subtitle">
              Con Dinely reservas en pocos pasos, sin llamadas y sin hacer fila.
              Solo eliges tu horario, confirmas y te olvidas de esperar.
            </p>

            <div className="features-grid">
              <article className="feature-card">
                <h3>Reserva en minutos</h3>
                <p>
                  Selecciona la fecha, la hora y el número de personas en una
                  interfaz clara. En un instante tendrás tu confirmación.
                </p>
              </article>

              <article className="feature-card">
                <h3>Olvídate de las filas</h3>
                <p>
                  Llega directo a tu mesa sin hacer fila en la entrada. Tú solo
                  te preocupas por disfrutar la comida y la compañía.
                </p>
              </article>

              <article className="feature-card">
                <h3>Todo en un solo lugar</h3>
                <p>
                  Consulta tus reservas futuras, detalles de la mesa y horario
                  cuando quieras, desde el mismo lugar donde reservaste.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* BANNER “VEN Y DEGUSTA NUESTROS PLATILLOS” */}
        <section id="menu" className="cta-banner">
          <div className="cta-overlay">
            <div className="container cta-content">
              <h2>VEN Y DEGUSTA NUESTROS PLATILLOS</h2>
              <p>
                Descubre tus nuevos favoritos: desde entradas y platillos
                fuertes hasta postres y bebidas especiales. Reserva tu mesa y
                disfruta cada momento sin prisas.
              </p>
              <button className="btn-cta">Ver menú del restaurante</button>
            </div>
          </div>
        </section>

        {/* SECCIÓN UBICACIÓN / CONTACTO */}
        <section id="ubicacion" className="info-section">
          <div className="container info-grid">
            <div>
              <h2 className="section-title">Ubicación y contacto</h2>
              <p className="section-subtitle">
                Encuéntranos fácilmente y haznos llegar cualquier duda sobre tu
                reserva. Estamos listos para recibirte.
              </p>
              <ul className="info-list">
                <li>📍 Calle Ejemplo #123, Ciudad, País</li>
                <li>📞 +52 55 1234 5678</li>
                <li>✉️ reservas@dinely.com</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Horario de servicio</h3>
              <p>Lunes a viernes: 13:00 - 22:00</p>
              <p>Sábados y domingos: 12:00 - 23:30</p>
              <p style={{ marginTop: "0.8rem", fontSize: "0.9rem" }}>
                Elige el horario que más te convenga y reserva tu mesa con
                anticipación.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN OPINIONES */}
        <section id="opiniones" className="reviews-section">
          <div className="container">
            <h2 className="section-title">Lo que dicen nuestros clientes</h2>
            <div className="features-grid">
              <article className="feature-card">
                <p>
                  “Reservar con Dinely fue súper sencillo. Llegamos a la hora
                  acordada y nuestra mesa ya estaba lista.”
                </p>
                <span className="review-name">— Ana, comensal frecuente</span>
              </article>
              <article className="feature-card">
                <p>
                  “Me encantó no tener que llamar al restaurante. En dos
                  minutos ya tenía mi reserva confirmada.”
                </p>
                <span className="review-name">— Luis, usuario de primera vez</span>
              </article>
              <article className="feature-card">
                <p>
                  “Ideal para salir en pareja o con amigos. Reservas desde el
                  celular y solo te preocupas por pasarla bien.”
                </p>
                <span className="review-name">— Sofía, le encanta salir a cenar</span>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} Dinely · Sistema de reservas</span>
          <span>Proyecto de Ingeniería de Software</span>
        </div>
      </footer>
    </div>
  );
}