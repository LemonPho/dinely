import Messages from "../util-components/messages.jsx";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUserContext } from "../application-context/user-context.jsx";
import { useAuthenticationContext } from "../application-context/authentication-context.jsx";
import "../styles/global.css";

export default function Layout() {
  const { user } = useUserContext();
  const { logout } = useAuthenticationContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout(navigate);
  }

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
            {user ? (
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "inherit",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Cerrar sesión
              </button>
            ) : (
              <Link to="/login">Iniciar sesión</Link>
            )}
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

