import React, { useState, useEffect } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";
import { getBills, createBill, editBill, deleteBill } from "../fetch/admin.jsx";


export default function AdminAccountsPage() {
  const { openedModal, openModal, closeModal, toggleDropdown, openedDropdown, closeDropdown } = useOpenersContext();

  // Mock data para mesas disponibles (solo strings)
  const availableTables = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "12", "15", "A1", "A2", "VIP-1", "VIP-2"
  ];

  // Mock data para meseros (solo strings)
  const availableWaiters = [
    "mesero1", "mesero2", "mesero3", "cocinero1"
  ];

  // Mock data - no API calls
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      code: "CTA-001",
      tableNumber: "5",
      waiterName: "mesero1",
      total: 850.00,
      date: "2024-01-20",
      time: "19:00",
      status: "current",
      items: [
        { name: "Pollo a la parrilla", quantity: 2, price: 210 },
        { name: "Limonada natural", quantity: 2, price: 55 },
      ],
    },
    {
      id: 2,
      code: "CTA-002",
      tableNumber: "12",
      waiterName: "mesero1",
      total: 380.00,
      date: "2024-01-20",
      time: "19:30",
      status: "closed",
      items: [
        { name: "Hamburguesa gourmet", quantity: 2, price: 190 },
      ],
    },
    {
      id: 3,
      code: "CTA-003",
      tableNumber: "8",
      waiterName: "cocinero1",
      total: 1260.00,
      date: "2024-01-21",
      time: "20:00",
      status: "current",
      items: [
        { name: "Pasta al pesto", quantity: 3, price: 185 },
        { name: "Smoothie de fresa", quantity: 3, price: 70 },
        { name: "Guacamole con totopos", quantity: 2, price: 115 },
      ],
    },
    {
      id: 4,
      code: "CTA-004",
      tableNumber: "15",
      waiterName: "mesero1",
      total: 565.00,
      date: "2024-01-19",
      time: "18:00",
      status: "closed",
      items: [
        { name: "Bruschettas", quantity: 2, price: 130 },
        { name: "Café latte", quantity: 3, price: 60 },
        { name: "Papas fritas", quantity: 1, price: 120 },
      ],
    },
    {
      id: 5,
      code: "CTA-005",
      tableNumber: "3",
      waiterName: "mesero1",
      total: 370.00,
      date: "2024-01-22",
      time: "21:00",
      status: "current",
      items: [
        { name: "Pasta al pesto", quantity: 2, price: 185 },
      ],
    },
  ]);

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

  const [bills, setBills] = useState([]);
  const [billForm, setBillForm] = useState({
    id: null,
    reservation: "",
    status: "pending",
  });
  const [billErrors, setBillErrors] = useState(null);

  useEffect(() => {
    loadBills();
  }, []);



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
  
  async function loadBills() {
   const result = await getBills();
   if (!result.error && result.status === 200) {
     setBills(result.bills);
   } else {
    setBillErrors("Error al cargar Bills");
   }
  }


  async function handleSaveBill(e) {
  e.preventDefault();
  setBillErrors(null);

  let result;
  if (billForm.id) {
    result = await editBill(billForm);
  } else {
    result = await createBill(billForm);
  }

  if (result.status === 201 || result.status === 200) {
    const newBill = result.bill;
    setBills((prev) => {
      const idx = prev.findIndex((b) => b.id === newBill.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newBill;
        return copy;
      }
      return [newBill, ...prev];
    });
    setBillForm({ id: null, reservation: "", status: "pending" });
  } else if (result.status === 400) {
    setBillErrors(result.validationErrors);
  } else {
    setBillErrors("Error al guardar Bill");
  }
 }


 function startEditBill(bill) {
  setBillForm({
    id: bill.id,
    reservation: bill.reservation.id,
    status: bill.status,
  });
 }


 async function handleDeleteBill(id) {
  if (!window.confirm("¿Eliminar este Bill?")) return;
  const result = await deleteBill(id);
  if (result.status === 204) {
    setBills((prev) => prev.filter((b) => b.id !== id));
  } else {
    setBillErrors("Error al eliminar Bill");
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
      </div>

      {/* Gestión de Bills */}
<div className="admin-content-card">
  <h2>Bills</h2>
  {billErrors && <div style={{ color: "red" }}>{JSON.stringify(billErrors)}</div>}

  <form onSubmit={handleSaveBill} style={{ marginBottom: 16 }}>
    <input
      type="number"
      placeholder="ID de reservación"
      value={billForm.reservation}
      onChange={(e) => setBillForm({ ...billForm, reservation: e.target.value })}
    />
    <select
      value={billForm.status}
      onChange={(e) => setBillForm({ ...billForm, status: e.target.value })}
    >
      <option value="pending">pending</option>
      <option value="paid">paid</option>
      <option value="cancelled">cancelled</option>
    </select>
    <button type="submit">{billForm.id ? "Actualizar Bill" : "Crear Bill"}</button>
  </form>

  <ul>
    {bills.map((bill) => (
      <li key={bill.id}>
        Bill #{bill.id} — Reserva: {bill.reservation.id} — Estado: {bill.status}
        <button onClick={() => startEditBill(bill)}>Editar</button>
        <button onClick={() => handleDeleteBill(bill.id)}>Eliminar</button>
      </li>
    ))}
  </ul>
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

