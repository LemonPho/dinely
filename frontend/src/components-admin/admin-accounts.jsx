import React, { useState, useEffect } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import { getBills } from "../fetch/shared";
import "../styles/global.css";
import "../styles/admin.css";
import { getBills, createBill, editBill, deleteBill } from "../fetch/admin.jsx";
import { getTables } from "../fetch/admin.jsx";
import { fetchUsers } from "../fetch/admin.jsx";
import Messages from "../util-components/messages.jsx";


export default function AdminAccountsPage() {
  const { openedModal, openModal, closeModal, toggleDropdown, openedDropdown, closeDropdown } = useOpenersContext();
  const { setErrorMessage, setSuccessMessage, resetMessages } = useMessagesContext();

  const [bills, setBills] = useState([]);
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  
  const [editingAccount, setEditingAccount] = useState(null);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    table: "",
    waiter: "",
    state: "current",
  });

  useEffect(() => {
    loadBills();
    loadTables();
    loadWaiters();
  }, []);

  async function loadBills() {
    const result = await getBills();
    if (!result.error && result.status === 200) {
      setBills(result.bills);
    }
  }

  async function loadTables() {
    const result = await getTables();
    if (result.status === 200) {
      setTables(result.tables);
    }
  }

  async function loadWaiters() {
    const result = await fetchUsers();
    if (result.status === 200) {
      // Filter only waiters
      const waitersList = result.users.filter(user => user.is_waiter);
      setWaiters(waitersList);
    }
  }

  function formatDateTimeForDisplay(dateTime) {
    if (!dateTime) return { date: "", time: "" };
    const dt = new Date(dateTime);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().split(' ')[0].substring(0, 5);
    return { date, time };
  }

  function handleAccountClick(account) {
    setViewingAccount(account);
    setEditingAccount(null);
    setIsCreating(false);
    setIsEditMode(false);
    openModal(`view-account-${account.id}`);
  }

  function handleEditClick() {
    if (!viewingAccount) return;
    setEditingAccount(viewingAccount);
    setIsEditMode(true);
    setIsCreating(false);
    setFormData({
      table: viewingAccount.table_id || "",
      waiter: viewingAccount.waiter_id || "",
      state: viewingAccount.state || "current",
    });
    closeModal();
    openModal(`edit-account-${viewingAccount.id}`);
  }

  function handleCreateClick() {
    setEditingAccount(null);
    setViewingAccount(null);
    setIsCreating(true);
    setIsEditMode(true);
    setFormData({
      table: "",
      waiter: "",
      state: "current",
    });
    openModal("create-account");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();

    const billData = {
      table: formData.table ? parseInt(formData.table) : null,
      waiter: formData.waiter ? parseInt(formData.waiter) : null,
      state: formData.state,
    };

    if (isCreating) {
      billData.id = null;
    } else {
      billData.id = editingAccount.id;
    }

    const apiResponse = isCreating ? await createBill(billData) : await editBill(billData);

    if (apiResponse.status === 400) {
      let errorMessage = `Error al ${isCreating ? 'crear' : 'actualizar'} la cuenta:\n`;
      
      // Handle validator errors
      if (apiResponse.validationErrors) {
        const errors = apiResponse.validationErrors;
        if (errors.valid_table === false) {
          errorMessage += "- La mesa es requerida\n";
        }
        if (errors.table_available === false) {
          errorMessage += "- La mesa ya está siendo usada en otra cuenta activa\n";
        }
        if (errors.valid_waiter === false) {
          errorMessage += "- El mesero es requerido y debe tener el rol de mesero\n";
        }
        if (errors.valid_state === false) {
          errorMessage += "- El estado no es válido\n";
        }
        
        // Handle serializer errors
        if (errors.table) {
          errorMessage += `- Mesa: ${Array.isArray(errors.table) ? errors.table[0] : errors.table}\n`;
        }
        if (errors.waiter) {
          errorMessage += `- Mesero: ${Array.isArray(errors.waiter) ? errors.waiter[0] : errors.waiter}\n`;
        }
        if (errors.state) {
          errorMessage += `- Estado: ${Array.isArray(errors.state) ? errors.state[0] : errors.state}\n`;
        }
      }
      
      setErrorMessage(errorMessage);
      return;
    } else if (apiResponse.status === 201) {
      if (isCreating) {
        if (apiResponse.bill) {
          setBills([...bills, apiResponse.bill]);
        }
        setSuccessMessage("Cuenta creada con éxito!");
      } else {
        // Update bill in state
        const updatedBills = bills.map((bill) => {
          if (bill.id === editingAccount.id) {
            return apiResponse.bill;
          }
          return bill;
        });
        setBills(updatedBills);
        setViewingAccount(apiResponse.bill);
        setSuccessMessage("Cuenta actualizada con éxito!");
      }
      
      closeModal();
      setIsEditMode(false);
      setIsCreating(false);
      setEditingAccount(null);
      if (!isCreating) {
        setViewingAccount(apiResponse.bill);
        openModal(`view-account-${apiResponse.bill.id}`);
      }
    } else {
      setErrorMessage(`Error desconocido con código de estatus: ${apiResponse.status}`);
    }
  }

  async function handleDeleteAccount() {
    resetMessages();
    if (!editingAccount && !viewingAccount) {
      return;
    }

    const billId = editingAccount?.id || viewingAccount?.id;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar la cuenta ${viewingAccount?.code || editingAccount?.code}?`)) {
      return;
    }

    const apiResponse = await deleteBill(billId);

    if (apiResponse.status === 201) {
      setBills((prevBills) => prevBills.filter((bill) => bill.id !== billId));
      setSuccessMessage("Cuenta eliminada con éxito!");
      
      setFormData({
        table: "",
        waiter: "",
        state: "current",
      });
      setIsEditMode(false);
      setIsCreating(false);
      setEditingAccount(null);
      setViewingAccount(null);
      closeModal();
    } else {
      setErrorMessage("Error al eliminar la cuenta");
    }
  }

  function handleCancelEdit() {
    setIsEditMode(false);
    setEditingAccount(null);
    if (viewingAccount) {
      closeModal();
      openModal(`view-account-${viewingAccount.id}`);
    }
  }

  function getStatusLabel(state) {
    switch (state) {
      case "current":
        return "Actual";
      case "closed":
        return "Cerrada";
      default:
        return state;
    }
  }

  function getStatusColor(state) {
    switch (state) {
      case "current":
        return "status-in-progress";
      case "closed":
        return "status-reserved";
      default:
        return "";
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Gestionar Cuentas</h1>
            <p>Ver y gestionar las cuentas del restaurante</p>
          </div>
          <button
            className="admin-btn-primary"
            onClick={handleCreateClick}
          >
            Crear Cuenta
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        {isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Cargando cuentas...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>No hay cuentas disponibles</p>
          </div>
        ) : (
        <div className="admin-reservations-list-vertical">
          {bills.length === 0 ? (
            <div>No hay cuentas registradas</div>
          ) : (
            [...bills].map((bill) => {
              const { date, time } = formatDateTimeForDisplay(bill.date_time);
              return (
                <div
                  key={bill.id}
                  className="admin-reservation-row-item"
                  onClick={() => handleAccountClick(bill)}
                >
                  <div className="admin-reservation-row-left">
                    <span className="admin-reservation-row-code">{bill.code}</span>
                    <h3>{bill.table_code ? `Mesa ${bill.table_code}` : "Sin mesa"}</h3>
                    <span className="admin-reservation-row-info">
                      {date} · {time} · Mesero: {bill.waiter_name || "Sin asignar"} · Total: ${bill.total?.toFixed(2) || "0.00"} MXN
                    </span>
                  </div>
                  <div className="admin-reservation-row-right">
                    <span className={`admin-table-status ${getStatusColor(bill.state)}`}>
                      {getStatusLabel(bill.state)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}
      </div>

      {(viewingAccount || editingAccount || isCreating) && (
        <Modal isOpen={
          (viewingAccount && !isEditMode && openedModal === `view-account-${viewingAccount.id}`) ||
          (isEditMode && editingAccount && openedModal === `edit-account-${editingAccount.id}`) ||
          (isCreating && openedModal === "create-account")
        }>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {isCreating
                  ? "Crear Nueva Cuenta"
                  : isEditMode
                    ? "Editar Cuenta"
                    : "Detalles de Cuenta"}
              </h2>
              <div className="admin-modal-header-actions">
                {viewingAccount && !isEditMode && (
                  <button
                    type="button"
                    className="admin-btn-edit"
                    onClick={handleEditClick}
                  >
                    Editar
                  </button>
                )}
                {viewingAccount && !isEditMode && (
                  <button
                    type="button"
                    className="admin-btn-danger"
                    onClick={handleDeleteAccount}
                  >
                    Eliminar
                  </button>
                )}
                <button
                  className="admin-modal-close"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </div>
            <Messages/>
            {isEditMode || isCreating ? (
              <form className="admin-modal-form" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label htmlFor="table">
                    Mesa
                    <span style={{ color: "var(--color-primary)" }}> *</span>
                  </label>
                  <div className="dropdown-div">
                    <button
                      type="button"
                      className="admin-select-dropdown-button"
                      id="table-button"
                      onClick={(e) => toggleDropdown("table-dropdown")}
                    >
                      {formData.table ? (
                        <span>{tables.find(t => t.id === parseInt(formData.table))?.code || formData.table}</span>
                      ) : (
                        <span>Seleccionar mesa...</span>
                      )}
                    </button>
                    <Dropdown isOpen={openedDropdown === "table-dropdown"}>
                      <ul
                        className="admin-select-dropdown-menu"
                        id="table-dropdown"
                        style={{ overflowY: "scroll", maxHeight: "15rem" }}
                      >
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChange({
                                target: { name: "table", value: "" },
                              });
                              closeDropdown();
                            }}
                          >
                            Sin mesa
                          </a>
                        </li>
                        {tables.map((table) => (
                          <li key={`table-${table.id}`}>
                            <a
                              className="dropdown-item"
                              onClick={() => {
                                handleChange({
                                  target: { name: "table", value: table.id.toString() },
                                });
                                closeDropdown();
                              }}
                            >
                              {table.code}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Dropdown>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="waiter">
                    Mesero
                    <span style={{ color: "var(--color-primary)" }}> *</span>
                  </label>
                  <div className="dropdown-div">
                    <button
                      type="button"
                      className="admin-select-dropdown-button"
                      id="waiter-button"
                      onClick={(e) => toggleDropdown("waiter-dropdown")}
                    >
                      {formData.waiter ? (
                        <span>{waiters.find(w => w.id === parseInt(formData.waiter))?.name || formData.waiter}</span>
                      ) : (
                        <span>Seleccionar mesero...</span>
                      )}
                    </button>
                    <Dropdown isOpen={openedDropdown === "waiter-dropdown"}>
                      <ul
                        className="admin-select-dropdown-menu"
                        id="waiter-dropdown"
                        style={{ overflowY: "scroll", maxHeight: "15rem" }}
                      >
                        {waiters.map((waiter) => (
                          <li key={`waiter-${waiter.id}`}>
                            <a
                              className="dropdown-item"
                              onClick={() => {
                                handleChange({
                                  target: { name: "waiter", value: waiter.id.toString() },
                                });
                                closeDropdown();
                              }}
                            >
                              {waiter.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Dropdown>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="state">Estado</label>
                  <div className="dropdown-div">
                    <button
                      type="button"
                      className="admin-select-dropdown-button"
                      id="state-button"
                      onClick={(e) => toggleDropdown("state-dropdown")}
                    >
                      {formData.state === "current" ? (
                        <span>Actual</span>
                      ) : formData.state === "closed" ? (
                        <span>Cerrada</span>
                      ) : (
                        <span>Seleccionar estado...</span>
                      )}
                    </button>
                    <Dropdown isOpen={openedDropdown === "state-dropdown"}>
                      <ul
                        className="admin-select-dropdown-menu"
                        id="state-dropdown"
                        style={{ overflowY: "scroll", maxHeight: "15rem" }}
                      >
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChange({
                                target: { name: "state", value: "current" },
                              });
                              closeDropdown();
                            }}
                          >
                            Actual
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChange({
                                target: { name: "state", value: "closed" },
                              });
                              closeDropdown();
                            }}
                          >
                            Cerrada
                          </a>
                        </li>
                      </ul>
                    </Dropdown>
                  </div>
                </div>

                <div className="admin-form-actions full-width">
                  {isEditMode && !isCreating && (
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={closeModal}
                  >
                    Cerrar
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    {isCreating ? "Crear" : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="admin-modal-view">
                {viewingAccount && (
                  <>
                    <div className="admin-view-section">
                      <h3>Información de la Cuenta</h3>
                      <div className="admin-view-grid">
                        <div className="admin-view-item">
                          <span className="admin-view-label">Código:</span>
                          <span className="admin-view-value admin-view-code">{viewingAccount.code}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Mesa:</span>
                          <span className="admin-view-value">{viewingAccount.table_code || "Sin mesa"}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Mesero:</span>
                          <span className="admin-view-value">{viewingAccount.waiter_name || "Sin asignar"}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Fecha:</span>
                          <span className="admin-view-value">{formatDateTimeForDisplay(viewingAccount.date_time).date}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Hora:</span>
                          <span className="admin-view-value">{formatDateTimeForDisplay(viewingAccount.date_time).time}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Estado:</span>
                          <span className={`admin-table-status ${getStatusColor(viewingAccount.state)}`}>
                            {getStatusLabel(viewingAccount.state)}
                          </span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Total:</span>
                          <span className="admin-view-value" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)" }}>
                            ${viewingAccount.total?.toFixed(2) || "0.00"} MXN
                          </span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Total Pagado:</span>
                          <span className="admin-view-value">
                            ${viewingAccount.total_paid?.toFixed(2) || "0.00"} MXN
                          </span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Propina:</span>
                          <span className="admin-view-value">
                            ${viewingAccount.tip || 0} MXN
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
