import React, { useState, useEffect } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import { getBills } from "../fetch/shared";
import "../styles/global.css";
import "../styles/admin.css";

export default function AdminAccountsPage() {
  const { openedModal, openModal, closeModal, toggleDropdown, openedDropdown, closeDropdown } = useOpenersContext();

  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data para mesas disponibles (solo strings)
  const availableTables = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "12", "15", "A1", "A2", "VIP-1", "VIP-2"
  ];

  // Mock data para meseros (solo strings)
  const availableWaiters = [
    "mesero1", "mesero2", "mesero3", "cocinero1"
  ];

  // Fetch bills from API on component mount
  useEffect(() => {
    async function fetchBills() {
      setIsLoading(true);
      const response = await getBills();
      if (response.status === 200 && response.bills) {
        // Transform API response to match component's expected structure
        const transformedBills = response.bills.map((bill) => {
          const dateTime = new Date(bill.date_time);
          const date = dateTime.toISOString().split('T')[0];
          const time = dateTime.toTimeString().split(' ')[0].slice(0, 5);
          
          return {
            id: bill.id,
            code: bill.code,
            tableNumber: bill.table?.code || "",
            waiterName: bill.waiter?.name || "",
            total: bill.total,
            date: date,
            time: time,
            status: bill.state,
            items: bill.plates?.map((billPlate) => ({
              name: billPlate.plate?.name || "",
              quantity: 1, // API doesn't have quantity, defaulting to 1
              price: billPlate.plate?.price || 0,
              notes: billPlate.notes || "",
            })) || [],
          };
        });
        setAccounts(transformedBills);
      } else {
        console.error("Failed to fetch bills:", response.error, response.status);
        setAccounts([]);
      }
      setIsLoading(false);
    }
    fetchBills();
  }, []);

  const [editingAccount, setEditingAccount] = useState(null);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    tableNumber: "",
    waiterName: "",
    total: "",
    date: "",
    time: "",
    status: "current",
  });

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
    closeModal();
    openModal(`edit-account-${viewingAccount.id}`);
    setFormData({
      code: viewingAccount.code,
      tableNumber: viewingAccount.tableNumber,
      waiterName: viewingAccount.waiterName,
      total: viewingAccount.total.toString(),
      date: viewingAccount.date,
      time: viewingAccount.time,
      status: viewingAccount.status,
    });
  }

  function handleCreateClick() {
    setEditingAccount(null);
    setViewingAccount(null);
    setIsCreating(true);
    setIsEditMode(true);
    setFormData({
      code: "",
      tableNumber: "",
      waiterName: "",
      total: "",
      date: "",
      time: "",
      status: "current",
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

  function handleSubmit(e) {
    e.preventDefault();

    if (isCreating) {
      // Crear nueva cuenta
      const newAccount = {
        id: Math.max(...accounts.map(a => a.id)) + 1,
        code: formData.code || `CTA-${String(Math.max(...accounts.map(a => a.id)) + 1).padStart(3, '0')}`,
        tableNumber: formData.tableNumber,
        waiterName: formData.waiterName,
        total: parseFloat(formData.total) || 0,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        items: [],
      };
      setAccounts([...accounts, newAccount]);
      closeModal();
      setEditingAccount(null);
      setViewingAccount(null);
      setIsCreating(false);
      setIsEditMode(false);
    } else if (editingAccount) {
      // Editar cuenta existente
      const updatedAccount = {
        ...editingAccount,
        code: formData.code,
        tableNumber: formData.tableNumber,
        waiterName: formData.waiterName,
        total: parseFloat(formData.total) || 0,
        date: formData.date,
        time: formData.time,
        status: formData.status,
      };

      const updatedAccounts = accounts.map((account) =>
        account.id === editingAccount.id
          ? updatedAccount
          : account
      );
      setAccounts(updatedAccounts);

      // Volver a modo vista con la cuenta actualizada
      setViewingAccount(updatedAccount);
      setEditingAccount(null);
      setIsEditMode(false);
      closeModal();
      openModal(`view-account-${updatedAccount.id}`);
    }
  }

  function handleCancelEdit() {
    setIsEditMode(false);
    setEditingAccount(null);
    // Volver a modo vista
    if (viewingAccount) {
      closeModal();
      openModal(`view-account-${viewingAccount.id}`);
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "current":
        return "Actual";
      case "closed":
        return "Cerrada";
      default:
        return status;
    }
  }

  function getStatusColor(status) {
    switch (status) {
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
          {[...accounts].sort((a, b) => {
            // Ordenar por fecha primero, luego por hora
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
          }).map((account) => (
            <div
              key={account.id}
              className="admin-reservation-row-item"
              onClick={() => handleAccountClick(account)}
            >
              <div className="admin-reservation-row-left">
                <span className="admin-reservation-row-code">{account.code}</span>
                <h3>Mesa {account.tableNumber}</h3>
                <span className="admin-reservation-row-info">
                  {account.date} · {account.time} · Mesero: {account.waiterName} · Total: ${account.total.toFixed(2)} MXN
                </span>
              </div>
              <div className="admin-reservation-row-right">
                <span className={`admin-table-status ${getStatusColor(account.status)}`}>
                  {getStatusLabel(account.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {(viewingAccount || editingAccount || isCreating) && (
        <Modal isOpen={
          (viewingAccount && openedModal === `view-account-${viewingAccount.id}`) ||
          (editingAccount && openedModal === `edit-account-${editingAccount.id}`) ||
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
                <button
                  className="admin-modal-close"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </div>
            {isEditMode || isCreating ? (
              <form className="admin-modal-form" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label htmlFor="code">Código de Cuenta</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Se generará automáticamente si se deja vacío"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="tableNumber">
                    Mesa
                    <span style={{ color: "var(--color-primary)" }}> *</span>
                  </label>
                  <div className="dropdown-div">
                    <button
                      type="button"
                      className="admin-select-dropdown-button"
                      id="tableNumber-button"
                      onClick={(e) => toggleDropdown("tableNumber-dropdown")}
                    >
                      {formData.tableNumber ? (
                        <span>{formData.tableNumber}</span>
                      ) : (
                        <span>Seleccionar mesa...</span>
                      )}
                    </button>
                    <Dropdown isOpen={openedDropdown === "tableNumber-dropdown"}>
                      <ul
                        className="admin-select-dropdown-menu"
                        id="tableNumber-dropdown"
                        style={{ overflowY: "scroll", maxHeight: "15rem" }}
                      >
                        {availableTables.map((table) => (
                          <li key={`table-${table}`}>
                            <a
                              className="dropdown-item"
                              onClick={() => {
                                handleChange({
                                  target: {
                                    name: "tableNumber",
                                    value: table,
                                  },
                                });
                                closeDropdown();
                              }}
                            >
                              {table}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Dropdown>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="waiterName">
                    Mesero
                    <span style={{ color: "var(--color-primary)" }}> *</span>
                  </label>
                  <div className="dropdown-div">
                    <button
                      type="button"
                      className="admin-select-dropdown-button"
                      id="waiterName-button"
                      onClick={(e) => toggleDropdown("waiterName-dropdown")}
                    >
                      {formData.waiterName ? (
                        <span>{formData.waiterName}</span>
                      ) : (
                        <span>Seleccionar mesero...</span>
                      )}
                    </button>
                    <Dropdown isOpen={openedDropdown === "waiterName-dropdown"}>
                      <ul
                        className="admin-select-dropdown-menu"
                        id="waiterName-dropdown"
                        style={{ overflowY: "scroll", maxHeight: "15rem" }}
                      >
                        {availableWaiters.map((waiter) => (
                          <li key={`waiter-${waiter}`}>
                            <a
                              className="dropdown-item"
                              onClick={() => {
                                handleChange({
                                  target: {
                                    name: "waiterName",
                                    value: waiter,
                                  },
                                });
                                closeDropdown();
                              }}
                            >
                              {waiter}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Dropdown>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="total">Total (MXN)</label>
                  <input
                    type="number"
                    id="total"
                    name="total"
                    value={formData.total}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="date">Fecha</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="time">Hora</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="status">Estado</label>
                  <div className="dropdown-div">
                    <button
                      type="button"
                      className="admin-select-dropdown-button"
                      id="status-button"
                      onClick={(e) => toggleDropdown("status-dropdown")}
                    >
                      {formData.status === "current" ? (
                        <span>Actual</span>
                      ) : formData.status === "closed" ? (
                        <span>Cerrada</span>
                      ) : (
                        <span>Seleccionar estado...</span>
                      )}
                    </button>
                    <Dropdown isOpen={openedDropdown === "status-dropdown"}>
                      <ul
                        className="admin-select-dropdown-menu"
                        id="status-dropdown"
                        style={{ overflowY: "scroll", maxHeight: "15rem" }}
                      >
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChange({
                                target: {
                                  name: "status",
                                  value: "current",
                                },
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
                                target: {
                                  name: "status",
                                  value: "closed",
                                },
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
                          <span className="admin-view-value">{viewingAccount.tableNumber}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Mesero:</span>
                          <span className="admin-view-value">{viewingAccount.waiterName}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Fecha:</span>
                          <span className="admin-view-value">{viewingAccount.date}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Hora:</span>
                          <span className="admin-view-value">{viewingAccount.time}</span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Estado:</span>
                          <span className={`admin-table-status ${getStatusColor(viewingAccount.status)}`}>
                            {getStatusLabel(viewingAccount.status)}
                          </span>
                        </div>
                        <div className="admin-view-item">
                          <span className="admin-view-label">Total:</span>
                          <span className="admin-view-value" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)" }}>
                            ${viewingAccount.total.toFixed(2)} MXN
                          </span>
                        </div>
                      </div>
                    </div>

                    {viewingAccount.items && viewingAccount.items.length > 0 && (
                      <div className="admin-view-section">
                        <h3>Items de la Cuenta</h3>
                        <div className="admin-account-items-list">
                          {viewingAccount.items.map((item, index) => (
                            <div key={index} className="admin-account-item">
                              <div className="admin-account-item-name">
                                <span>{item.name}</span>
                                <span>x{item.quantity}</span>
                              </div>
                              <div className="admin-account-item-price">
                                ${(item.price * item.quantity).toFixed(2)} MXN
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

