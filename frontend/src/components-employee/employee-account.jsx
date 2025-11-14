import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeAccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();

  // Mock data - platillos disponibles
  const availablePlates = [
    { id: 1, name: "Guacamole con totopos", price: 115, category: "entrada" },
    { id: 2, name: "Papas fritas con cheddar", price: 120, category: "entrada" },
    { id: 3, name: "Bruschettas con jitomate y albahaca", price: 130, category: "entrada" },
    { id: 4, name: "Pollo a la parrilla con verduras", price: 210, category: "comida" },
    { id: 5, name: "Hamburguesa gourmet Dinely", price: 190, category: "comida" },
    { id: 6, name: "Pasta al pesto", price: 185, category: "comida" },
    { id: 7, name: "Limonada natural", price: 55, category: "bebida" },
    { id: 8, name: "Smoothie de fresa", price: 70, category: "bebida" },
    { id: 9, name: "Café latte", price: 60, category: "bebida" },
  ];

  // Mock data - cuenta actual (en producción vendría de una API)
  const [account, setAccount] = useState({
    id: parseInt(id),
    code: "CTA-001",
    tableNumber: "5",
    waiterName: "mesero1",
    total: 850.00,
    date: "2024-01-20",
    time: "19:00",
    status: "current",
    items: [
      { id: 1, name: "Pollo a la parrilla", quantity: 2, price: 210, notes: "" },
      { id: 2, name: "Limonada natural", quantity: 2, price: 55, notes: "" },
    ],
  });

  const [isManagingPlates, setIsManagingPlates] = useState(false);
  const [isFinishingAccount, setIsFinishingAccount] = useState(false);
  const [selectedPlate, setSelectedPlate] = useState("");
  const [plateQuantity, setPlateQuantity] = useState(1);
  const [plateNotes, setPlateNotes] = useState("");
  const [finishFormData, setFinishFormData] = useState({
    amountPaid: "",
    tipPercentage: "",
  });

  function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function handleAddPlate() {
    if (!selectedPlate) return;

    const plate = availablePlates.find(p => p.name === selectedPlate);
    if (!plate) return;

    const newItem = {
      id: Date.now(),
      name: plate.name,
      quantity: parseInt(plateQuantity) || 1,
      price: plate.price,
      notes: plateNotes,
    };

    const updatedItems = [...account.items, newItem];
    setAccount({
      ...account,
      items: updatedItems,
      total: calculateTotal(updatedItems),
    });

    setSelectedPlate("");
    setPlateQuantity(1);
    setPlateNotes("");
  }

  function handleRemovePlate(itemId) {
    const itemToRemove = account.items.find(item => item.id === itemId);
    if (!itemToRemove) return;

    let updatedItems;
    
    // Si la cantidad es mayor a 1, reducir en 1
    if (itemToRemove.quantity > 1) {
      updatedItems = account.items.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    } else {
      // Si la cantidad es 1, eliminar completamente el item
      updatedItems = account.items.filter(item => item.id !== itemId);
    }

    setAccount({
      ...account,
      items: updatedItems,
      total: calculateTotal(updatedItems),
    });
  }

  function handleFinishAccount(e) {
    e.preventDefault();

    const amountPaid = parseFloat(finishFormData.amountPaid);
    const tipPercentage = parseFloat(finishFormData.tipPercentage) || 0;
    const tipAmount = (account.total * tipPercentage) / 100;
    const totalWithTip = account.total + tipAmount;

    // Actualizar cuenta a cerrada
    setAccount({
      ...account,
      status: "closed",
    });

    // Aquí se haría la llamada a la API para guardar
    alert(`Cuenta finalizada.\nTotal: $${account.total.toFixed(2)} MXN\nTips (${tipPercentage}%): $${tipAmount.toFixed(2)} MXN\nTotal con tips: $${totalWithTip.toFixed(2)} MXN\nMonto pagado: $${amountPaid.toFixed(2)} MXN\nCambio: $${(amountPaid - totalWithTip).toFixed(2)} MXN`);

    closeModal();
    setIsFinishingAccount(false);
    navigate("/empleado");
  }

  function handleFinishFormChange(e) {
    const { name, value } = e.target;
    setFinishFormData({
      ...finishFormData,
      [name]: value,
    });
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Cuenta {account.code}</h1>
            <p>Mesa {account.tableNumber} · {account.date} {account.time}</p>
          </div>
          <button
            className="admin-btn-secondary"
            onClick={() => navigate("/empleado")}
          >
            Volver
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-view-section">
          <h3>Información de la Cuenta</h3>
          <div className="admin-view-grid">
            <div className="admin-view-item">
              <span className="admin-view-label">Código:</span>
              <span className="admin-view-value admin-view-code">{account.code}</span>
            </div>
            <div className="admin-view-item">
              <span className="admin-view-label">Mesa:</span>
              <span className="admin-view-value">{account.tableNumber}</span>
            </div>
            <div className="admin-view-item">
              <span className="admin-view-label">Fecha:</span>
              <span className="admin-view-value">{account.date}</span>
            </div>
            <div className="admin-view-item">
              <span className="admin-view-label">Hora:</span>
              <span className="admin-view-value">{account.time}</span>
            </div>
            <div className="admin-view-item">
              <span className="admin-view-label">Total:</span>
              <span className="admin-view-value" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary)" }}>
                ${account.total.toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>

        <div className="admin-view-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3>Platillos</h3>
            <button
              className="admin-btn-primary"
              onClick={() => {
                setIsManagingPlates(true);
                openModal("manage-plates");
              }}
            >
              Gestionar Platillos
            </button>
          </div>
          {account.items && account.items.length > 0 ? (
            <div className="admin-account-items-list">
              {account.items.map((item) => (
                <div key={item.id} className="admin-account-item">
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
          ) : (
            <p>No hay platillos agregados</p>
          )}
        </div>

        <div className="admin-form-actions" style={{ marginTop: "2rem" }}>
          <button
            className="admin-btn-primary"
            onClick={() => {
              setIsFinishingAccount(true);
              openModal("finish-account");
            }}
            disabled={account.status === "closed"}
          >
            Finalizar Cuenta
          </button>
        </div>
      </div>

      {/* Modal para gestionar platillos */}
      <Modal isOpen={isManagingPlates && openedModal === "manage-plates"}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2>Gestionar Platillos</h2>
            <button
              className="admin-modal-close"
              onClick={() => {
                closeModal();
                setIsManagingPlates(false);
              }}
            >
              ×
            </button>
          </div>
          <div className="admin-modal-form" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="admin-view-section">
              <h3>Platillos Actuales</h3>
              {account.items && account.items.length > 0 ? (
                <div className="admin-account-items-list">
                  {account.items.map((item) => (
                    <div key={item.id} className="admin-account-item" style={{ position: "relative" }}>
                      <div className="admin-account-item-name">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                        {item.notes && <span style={{ fontSize: "0.85rem", color: "var(--color-text-soft)", fontStyle: "italic" }}> - {item.notes}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div className="admin-account-item-price">
                          ${(item.price * item.quantity).toFixed(2)} MXN
                        </div>
                        <button
                          className="admin-btn-secondary"
                          onClick={() => handleRemovePlate(item.id)}
                          style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay platillos agregados</p>
              )}
            </div>

            <div className="admin-view-section">
              <h3>Agregar Platillo</h3>
              <div className="admin-form-group" style={{ width: "100%" }}>
                <label htmlFor="plate">Platillo</label>
                <div className="dropdown-div">
                  <button
                    type="button"
                    className="admin-select-dropdown-button"
                    id="plate-button"
                    onClick={(e) => toggleDropdown("plate-dropdown")}
                  >
                    {selectedPlate ? (
                      <span>{selectedPlate}</span>
                    ) : (
                      <span>Seleccionar platillo...</span>
                    )}
                  </button>
                  <Dropdown isOpen={openedDropdown === "plate-dropdown"}>
                    <ul
                      className="admin-select-dropdown-menu"
                      id="plate-dropdown"
                      style={{ overflowY: "scroll", maxHeight: "15rem" }}
                    >
                      {availablePlates.map((plate) => (
                        <li key={plate.id}>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              setSelectedPlate(plate.name);
                              closeDropdown();
                            }}
                          >
                            {plate.name} - ${plate.price} MXN
                          </a>
                        </li>
                      ))}
                    </ul>
                  </Dropdown>
                </div>
              </div>

              <div className="admin-form-group" style={{ width: "100%" }}>
                <label htmlFor="quantity">Cantidad</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={plateQuantity}
                  onChange={(e) => setPlateQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group" style={{ width: "100%" }}>
                <label htmlFor="notes">Notas (opcional)</label>
                <textarea
                  id="notes"
                  value={plateNotes}
                  onChange={(e) => setPlateNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, bien cocido..."
                  rows="3"
                />
              </div>

              <div className="admin-form-actions" style={{ width: "100%", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    closeModal();
                    setIsManagingPlates(false);
                  }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleAddPlate}
                  disabled={!selectedPlate}
                >
                  Agregar Platillo
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal para finalizar cuenta */}
      <Modal isOpen={isFinishingAccount && openedModal === "finish-account"}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2>Finalizar Cuenta</h2>
            <button
              className="admin-modal-close"
              onClick={() => {
                closeModal();
                setIsFinishingAccount(false);
              }}
            >
              ×
            </button>
          </div>
          <form className="admin-modal-form" onSubmit={handleFinishAccount}>
            <div className="admin-form-group">
              <label htmlFor="total">Total de la Cuenta</label>
              <input
                type="text"
                id="total"
                value={`$${account.total.toFixed(2)} MXN`}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="amountPaid">Monto Pagado (MXN)</label>
              <input
                type="number"
                id="amountPaid"
                name="amountPaid"
                value={finishFormData.amountPaid}
                onChange={handleFinishFormChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="tipPercentage">Porcentaje de Tips (%)</label>
              <input
                type="number"
                id="tipPercentage"
                name="tipPercentage"
                value={finishFormData.tipPercentage}
                onChange={handleFinishFormChange}
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
              />
            </div>

            {finishFormData.amountPaid && finishFormData.tipPercentage && (
              <div className="admin-form-group" style={{ padding: "1rem", backgroundColor: "var(--color-bg)", borderRadius: "12px" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontWeight: 600 }}>Resumen:</p>
                <p style={{ margin: "0.25rem 0" }}>Total: ${account.total.toFixed(2)} MXN</p>
                <p style={{ margin: "0.25rem 0" }}>
                  Tips ({finishFormData.tipPercentage}%): ${((account.total * parseFloat(finishFormData.tipPercentage || 0)) / 100).toFixed(2)} MXN
                </p>
                <p style={{ margin: "0.25rem 0", fontWeight: 600 }}>
                  Total con tips: ${(account.total + (account.total * parseFloat(finishFormData.tipPercentage || 0)) / 100).toFixed(2)} MXN
                </p>
                <p style={{ margin: "0.25rem 0", fontWeight: 600, color: "var(--color-primary)" }}>
                  Cambio: ${(parseFloat(finishFormData.amountPaid || 0) - (account.total + (account.total * parseFloat(finishFormData.tipPercentage || 0)) / 100)).toFixed(2)} MXN
                </p>
              </div>
            )}

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => {
                  closeModal();
                  setIsFinishingAccount(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={!finishFormData.amountPaid}
              >
                Finalizar Cuenta
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

