import Messages from "../util-components/messages.jsx";
import { Link, Outlet } from "react-router-dom";
import "../styles/global.css";

export default function Layout() {
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
        <Messages />

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

