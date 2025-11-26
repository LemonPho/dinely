import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { employeeNavItems } from "../main.jsx";
import { useAuthenticationContext } from "../application-context/authentication-context.jsx";
import Messages from "../util-components/messages.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeLayoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuthenticationContext();

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
        <Messages />
        <Outlet />
      </main>
    </div>
  );
}

