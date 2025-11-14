import { useMessagesContext } from "../application-context/messages-context";
import { Link, Outlet } from "react-router-dom";
import "../styles/global.css";

export default function Layout() {
  const { errorMessage, successMessage, loadingMessage, resetMessages } = useMessagesContext();

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
        {/* ALERTAS DE MENSAJES */}
        <div className="alert-container">
          {errorMessage && (
            <div
              className="alert alert-danger my-2 alert-positioning d-flex align-items-center"
              style={{ whiteSpace: "pre-line" }}
              onClick={(e) => {
                e.stopPropagation();
                resetMessages();
              }}
            >
              {errorMessage}
              <button className="ms-auto btn btn-link link-no-decorations p-0">
                <h4 aria-hidden="true">&times;</h4>
              </button>
            </div>
          )}
          {successMessage && (
            <div
              className="alert alert-success my-2 alert-positioning d-flex align-items-center"
              style={{ whiteSpace: "pre-line" }}
              onClick={(e) => {
                e.stopPropagation();
                resetMessages();
              }}
            >
              {successMessage}
              <button className="ms-auto btn btn-link link-no-decorations p-0">
                <h4 aria-hidden="true">&times;</h4>
              </button>
            </div>
          )}
          {loadingMessage && (
            <div
              className="alert alert-secondary my-2 alert-positioning d-flex align-items-center"
              style={{ whiteSpace: "pre-line" }}
              onClick={(e) => {
                e.stopPropagation();
                resetMessages();
              }}
            >
              {loadingMessage}
              <button className="ms-auto btn btn-link link-no-decorations p-0">
                <h4 aria-hidden="true">&times;</h4>
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO DE LA PÁGINA ACTUAL */}
        <Outlet />
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

