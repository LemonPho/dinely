import React, { useState, useEffect } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import { useUserContext } from "../application-context/user-context.jsx";
import Modal from "../util-components/Modal.jsx";
import "../styles/global.css";
import "../styles/admin.css";
import { createUser, editUser, deleteUser, fetchUsers } from "../fetch/Admin.jsx";

import { useMessagesContext } from "../application-context/messages-context.jsx";


export default function AdminUsersPage() {
  const { openedModal, openModal, closeModal } = useOpenersContext();
  const { setErrorMessage, setSuccessMessage, setLoadingMessage, resetMessages } = useMessagesContext();
  const { user } = useUserContext();

  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    is_admin: false,
    is_waiter: false,
    is_kitchen: false,
  });

  function handleUserClick(user) {
    setIsEditing(true);
    setIsCreating(false);
    setFormData({
      id: user.id || "",
      name: user.name || "",
      email: user.email || "",
      is_admin: user.is_admin || false,
      is_waiter: user.is_waiter || false,
      is_kitchen: user.is_kitchen || false,
    });
    openModal(`edit-user-${user.id}`);
  }

  function handleCreateClick() {
    setIsEditing(false);
    setIsCreating(true);
    setFormData({
      id: "",
      name: "",
      email: "",
      is_admin: false,
      is_waiter: false,
      is_kitchen: false,
    });
    openModal("create-user");
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      // Manejar checkboxes de roles
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      // Manejar otros campos
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  }

  async function handleDeleteUser() {
    resetMessages();
    if (!formData.id) {
      return;
    }

    if (user.id == formData.id){
      setErrorMessage("No puedes eliminar a tu mismo.");
      return;
    }

    // Confirmar eliminación
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el usuario "${formData.name}"?`)) {
      return;
    }

    const apiResponse = await deleteUser(formData.id);

    if (apiResponse.status === 201) {
      // Eliminar el usuario del estado local
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== formData.id));
      
      // Limpiar el formulario y cerrar modal
      setFormData({
        id: "",
        name: "",
        email: "",
        is_admin: false,
        is_waiter: false,
        is_kitchen: false,
      });
      setIsEditing(false);
      setIsCreating(false);
      closeModal();
      
      setSuccessMessage("Usuario eliminado exitosamente");
    } else {
      const errorMsg = apiResponse.errorMessage || "Error al eliminar el usuario. Por favor intenta de nuevo.";
      setErrorMessage(errorMsg);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();

    setLoadingMessage("Cargando...");
    
    // Determinar si es creación o edición
    const isEditingUser = isEditing && formData.id;
    const userResponse = isEditingUser 
      ? await editUser(formData)
      : await createUser(formData);
    
    setLoadingMessage(false);

    if(userResponse.status === 500 || userResponse.error){
      setErrorMessage("Hubo un error al intentar procesar la solicitud");
      return;
    }
    
    if(userResponse.status === 400){
      if(userResponse.valid_id === false){
        setErrorMessage("El usuario no existe");
        return;
      }

      if(!userResponse.name){
        setErrorMessage("Asegura que hayas ingresado el nombre completo del empleado");
        return;
      }

      if(!userResponse.email){
        setErrorMessage("Asegura que hayas ingresado un correo");
        return;
      }

      if(userResponse.user_exists){
        setErrorMessage("Un usuario ya existe con ese correo, intenta otro o elimina el usuario");
        return;
      }

      setErrorMessage("Verifica que la informacion sea correcta e intente de nuevo")
    } else if(userResponse.status === 201){
      if(isCreating){
        // Usar el usuario creado desde la respuesta
        if(userResponse.user){
          setUsers([...users, userResponse.user]);
        }
        setSuccessMessage("Usuario creado con exito! El usuario debe revisar su correo para crear la contraseña");
      } else {
        // Editar usuario existente - use the updated user from response
        if(userResponse.user){
          const updatedUsers = users.map((user) =>
            user.id === userResponse.user.id ? userResponse.user : user
          );
          setUsers(updatedUsers);
        }
        setSuccessMessage("Usuario actualizado con exito!");
      }
    } else {
      setErrorMessage(`Error desconocido con codigo de estatus: ${userResponse.status}`);
    }

    closeModal();
    setIsEditing(false);
    setIsCreating(false);
  }

  function getUserRoles(user) {
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
    } else if (user.is_waiter) {
      return "role-employee";
    } else if (user.is_kitchen) {
      return "role-customer";
    } else {
      return "role-customer";
    }
  }

  // Cargar usuarios desde el backend
  useEffect(() => {
    async function loadUsers() {
      const apiResponse = await fetchUsers();
      console.log("Usuarios cargados:", apiResponse.users);
      if (apiResponse.status === 200) {
        setUsers(apiResponse.users);
      }
    }

    loadUsers();
  }, []);

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

      {users.length <= 0 ? (
        <div>No hay usuarios registrados</div>
      ) : (
        <div className="admin-content-card">
          <div className="admin-tables-grid">
            {users.map((user) => (
              <div
                key={user.id}
                className="admin-table-card"
                onClick={() => handleUserClick(user)}
              >
                <div className="admin-table-header">
                  <h3>{user.name}</h3>
                  <span className={`admin-table-status ${getRoleColor(user)}`}>
                    {getUserRoles(user)}
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
      )}
      
      <Modal isOpen={openedModal === `edit-user-${formData.id}` || openedModal === "create-user"}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2>{isCreating ? "Crear Nuevo Usuario" : `Editar Usuario`}</h2>
            <button className="admin-modal-close" onClick={closeModal}>
              x
            </button>
          </div>
          <form className="admin-modal-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="ej: Juan Pérez"
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
              <label>Tipo de Cuenta</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_admin"
                    checked={formData.is_admin}
                    onChange={handleChange}
                  />
                  <span>Administrador</span>
                </label>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_waiter"
                    checked={formData.is_waiter}
                    onChange={handleChange}
                  />
                  <span>Mesero</span>
                </label>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_kitchen"
                    checked={formData.is_kitchen}
                    onChange={handleChange}
                  />
                  <span>Cocina</span>
                </label>
                <label className="admin-checkbox-label" style={{ opacity: 0.6 }}>
                  <input
                    type="checkbox"
                    disabled
                    checked={!formData.is_admin && !formData.is_waiter && !formData.is_kitchen}
                    readOnly
                  />
                  <span>Cliente (si no se selecciona ningún rol)</span>
                </label>
              </div>
            </div>

            <div className="admin-form-actions full-width">
              {isEditing && formData.id && user && formData.id !== user.id && (
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginRight: "auto",
                  }}
                >
                  Eliminar
                </button>
              )}
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button type="submit" className="admin-btn-primary">
                {isCreating ? "Crear" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
