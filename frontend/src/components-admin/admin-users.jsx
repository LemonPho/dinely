import React, { useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function AdminUsersPage() {
  const { openedModal, openModal, closeModal } = useOpenersContext();

  // Mock data - no API calls
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "admin",
      email: "admin@dinely.com",
      is_admin: true,
      is_employee: false,
      date_created: "2024-01-01",
    },
    {
      id: 2,
      username: "mesero1",
      email: "mesero1@dinely.com",
      is_admin: false,
      is_employee: true,
      date_created: "2024-01-05",
    },
    {
      id: 3,
      username: "juan_perez",
      email: "juan.perez@email.com",
      is_admin: false,
      is_employee: false,
      date_created: "2024-01-10",
    },
    {
      id: 4,
      username: "maria_garcia",
      email: "maria.garcia@email.com",
      is_admin: false,
      is_employee: false,
      date_created: "2024-01-12",
    },
    {
      id: 5,
      username: "cocinero1",
      email: "cocinero1@dinely.com",
      is_admin: false,
      is_employee: true,
      date_created: "2024-01-08",
    },
    {
      id: 6,
      username: "carlos_lopez",
      email: "carlos.lopez@email.com",
      is_admin: false,
      is_employee: false,
      date_created: "2024-01-15",
    },
  ]);

  const [editingUser, setEditingUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    is_admin: false,
    is_employee: false,
  });

  function handleUserClick(user) {
    setEditingUser(user);
    setIsCreating(false);
    setFormData({
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      is_employee: user.is_employee,
    });
    openModal(`edit-user-${user.id}`);
  }

  function handleCreateClick() {
    setEditingUser(null);
    setIsCreating(true);
    setFormData({
      username: "",
      email: "",
      is_admin: false,
      is_employee: false,
    });
    openModal("create-user");
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (isCreating) {
      // Crear nuevo usuario
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        username: formData.username,
        email: formData.email,
        is_admin: formData.is_admin,
        is_employee: formData.is_employee,
        date_created: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    } else if (editingUser) {
      // Editar usuario existente
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              username: formData.username,
              email: formData.email,
              is_admin: formData.is_admin,
              is_employee: formData.is_employee,
            }
          : user
      );
      setUsers(updatedUsers);
    }

    closeModal();
    setEditingUser(null);
    setIsCreating(false);
  }

  function getUserRole(user) {
    if (user.is_admin) {
      return "Administrador";
    } else if (user.is_employee) {
      return "Empleado";
    } else {
      return "Cliente";
    }
  }

  function getRoleColor(user) {
    if (user.is_admin) {
      return "role-admin";
    } else if (user.is_employee) {
      return "role-employee";
    } else {
      return "role-customer";
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Gestionar Usuarios</h1>
            <p>Ver y gestionar las cuentas de usuario</p>
          </div>
          <button
            className="admin-btn-primary"
            onClick={handleCreateClick}
          >
            Crear Usuario
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-tables-grid">
          {users.map((user) => (
            <div
              key={user.id}
              className="admin-table-card"
              onClick={() => handleUserClick(user)}
            >
              <div className="admin-table-header">
                <h3>{user.username}</h3>
                <span className={`admin-table-status ${getRoleColor(user)}`}>
                  {getUserRole(user)}
                </span>
              </div>
              <div className="admin-table-details">
                <p>Email: {user.email}</p>
                <p>Creado: {user.date_created}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(editingUser || isCreating) && (
        <Modal isOpen={openedModal === `edit-user-${editingUser?.id}` || openedModal === "create-user"}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{isCreating ? "Crear Nuevo Usuario" : `Editar Usuario`}</h2>
              <button
                className="admin-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="ej: juan_perez"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="ej: usuario@email.com"
                />
              </div>

              <div className="admin-form-group full-width">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_admin"
                    checked={formData.is_admin}
                    onChange={handleChange}
                  />
                  <span>Administrador</span>
                </label>
              </div>

              <div className="admin-form-group full-width">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_employee"
                    checked={formData.is_employee}
                    onChange={handleChange}
                  />
                  <span>Empleado</span>
                </label>
              </div>

              <div className="admin-form-actions full-width">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
