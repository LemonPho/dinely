import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { employeeNavItems } from "../main.jsx";
import { useAuthenticationContext } from "../application-context/authentication-context.jsx";
import { useMessagesContext } from "../application-context/messages-context";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeLayoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuthenticationContext();
  const { errorMessage, successMessage, loadingMessage, resetMessages } = useMessagesContext();

  function handleLogout() {
    logout(navigate);
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-brand">Dinely Empleado</h2>
        </div>
        <nav className="admin-nav">
          {employeeNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/empleado"}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <span className="admin-nav-label">Volver al sitio</span>
          </Link>
          <button
            onClick={handleLogout}
            className="admin-nav-item admin-logout-btn"
          >
            <span className="admin-nav-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
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
        <Outlet />
      </main>
    </div>
  );
}

