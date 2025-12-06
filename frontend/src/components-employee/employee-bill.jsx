import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import { getWaiterBill, getPlates, addPlateToBill, finalizeBill } from "../fetch/shared";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeBillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();

  const [account, setAccount] = useState(null);
  const [availablePlates, setAvailablePlates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isManagingPlates, setIsManagingPlates] = useState(false);
  const [isFinishingAccount, setIsFinishingAccount] = useState(false);
  const [selectedPlate, setSelectedPlate] = useState("");
  const [plateQuantity, setPlateQuantity] = useState(1);
  const [plateNotes, setPlateNotes] = useState("");
  const [finishFormData, setFinishFormData] = useState({
    amountPaid: "",
    tipPercentage: "",
  });

  // Fetch bill and plates on component mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setErrorMessage(null);

      // Fetch bill
      const billResponse = await getWaiterBill(id);
      if (billResponse.status === 200 && billResponse.bill) {
        const bill = billResponse.bill;
        const dateTime = new Date(bill.date_time);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().split(' ')[0].slice(0, 5);

        setAccount({
          id: bill.id,
          code: bill.code,
          tableNumber: bill.table?.code || "",
          waiterName: bill.waiter?.name || "",
          total: bill.total,
          date: date,
          time: time,
          status: bill.state,
          items: bill.plates?.map((billPlate, index) => ({
            id: billPlate.id || index,
            name: billPlate.plate?.name || "",
            quantity: 1, // API doesn't have quantity per BillPlate, defaulting to 1
            price: billPlate.plate?.price || 0,
            notes: billPlate.notes || "",
          })) || [],
        });
      } else {
        setErrorMessage(billResponse.errorMessage || "Error al cargar la cuenta");
      }

      // Fetch available plates
      const platesResponse = await getPlates();
      if (platesResponse.status === 200 && platesResponse.plates) {
        setAvailablePlates(platesResponse.plates);
      }

      setIsLoading(false);
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async function handleAddPlate() {
    if (!selectedPlate) return;

    const plate = availablePlates.find(p => p.name === selectedPlate);
    if (!plate) return;

    const quantity = parseInt(plateQuantity) || 1;
    const notes = plateNotes || "";

    // Call API to add plate to bill
    const response = await addPlateToBill(account.id, plate.id, quantity, notes);

    if (response.status === 200 && response.bill) {
      // Update account with the response from server
      const bill = response.bill;
      const dateTime = new Date(bill.date_time);
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toTimeString().split(' ')[0].slice(0, 5);

      setAccount({
        id: bill.id,
        code: bill.code,
        tableNumber: bill.table?.code || "",
        waiterName: bill.waiter?.name || "",
        total: bill.total,
        date: date,
        time: time,
        status: bill.state,
        items: bill.plates?.map((billPlate, index) => ({
          id: billPlate.id || index,
          name: billPlate.plate?.name || "",
          quantity: 1, // API doesn't have quantity per BillPlate, defaulting to 1
          price: billPlate.plate?.price || 0,
          notes: billPlate.notes || "",
        })) || [],
      });

      // Reset form
      setSelectedPlate("");
      setPlateQuantity(1);
      setPlateNotes("");
      
      // Close modal
      closeModal();
      setIsManagingPlates(false);
    } else {
      // Show error message (extracted from validation errors)
      alert(response.errorMessage || "Error al agregar platillo");
    }
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

  async function handleFinishAccount(e) {
    e.preventDefault();

    const amountPaid = parseFloat(finishFormData.amountPaid);
    const tipPercentage = parseFloat(finishFormData.tipPercentage) || 0;

    // Call API to finalize bill
    const response = await finalizeBill(account.id, amountPaid, tipPercentage);

    if (response.status === 200 && response.bill) {
      // Update account with the response from server
      const bill = response.bill;
      const dateTime = new Date(bill.date_time);
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toTimeString().split(' ')[0].slice(0, 5);

      setAccount({
        id: bill.id,
        code: bill.code,
        tableNumber: bill.table?.code || "",
        waiterName: bill.waiter?.name || "",
        total: bill.total,
        date: date,
        time: time,
        status: bill.state,
        items: bill.plates?.map((billPlate, index) => ({
          id: billPlate.id || index,
          name: billPlate.plate?.name || "",
          quantity: 1,
          price: billPlate.plate?.price || 0,
          notes: billPlate.notes || "",
        })) || [],
      });

      closeModal();
      setIsFinishingAccount(false);
      navigate("/empleado/cuentas");
    } else {
      // Show error message
      alert(response.errorMessage || "Error al finalizar cuenta");
    }
  }

  function handleFinishFormChange(e) {
    const { name, value } = e.target;
    setFinishFormData({
      ...finishFormData,
      [name]: value,
    });
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Cargando cuenta...</h1>
          </div>
        </div>
        <div className="admin-content-card">
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Cargando información de la cuenta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !account) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div className="admin-page-header-top">
            <div>
              <h1>Error</h1>
            </div>
            <button
              className="admin-btn-secondary"
              onClick={() => navigate("/empleado/cuentas")}
            >
              Volver a Cuentas
            </button>
          </div>
        </div>
        <div className="admin-content-card">
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p style={{ color: "var(--color-error)" }}>{errorMessage || "No se pudo cargar la cuenta"}</p>
          </div>
        </div>
      </div>
    );
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
            onClick={() => navigate("/empleado/cuentas")}
          >
            Volver a Cuentas
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
              if (account.status !== "closed") {
                setIsFinishingAccount(true);
                openModal("finish-account");
              }
            }}
            disabled={account.status === "closed"}
          >
            {account.status === "closed" ? "Cuenta Finalizada" : "Finalizar Cuenta"}
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
                            {plate.name} - ${plate.price?.toFixed(2) || "0.00"} MXN
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
          <form className="admin-modal-form" onSubmit={handleFinishAccount} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="admin-form-group">
              <label>Total de la Cuenta</label>
              <input
                type="text"
                value={`$${account.total.toFixed(2)} MXN`}
                disabled
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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

            {finishFormData.amountPaid && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem", backgroundColor: "var(--color-bg)", borderRadius: "12px" }}>
                {finishFormData.tipPercentage && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text-soft)" }}>Tips ({finishFormData.tipPercentage}%)</span>
                    <span style={{ fontWeight: 500 }}>${((account.total * parseFloat(finishFormData.tipPercentage || 0)) / 100).toFixed(2)} MXN</span>
                  </div>
                )}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--color-text-soft)" }}>Total con tips</span>
                  <span style={{ fontWeight: 600 }}>${(account.total + (account.total * parseFloat(finishFormData.tipPercentage || 0)) / 100).toFixed(2)} MXN</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", paddingTop: "0.75rem", borderTop: "2px solid var(--color-primary)", marginTop: "0.5rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--color-text-soft)" }}>Cambio</span>
                  <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--color-primary)" }}>
                    ${(parseFloat(finishFormData.amountPaid || 0) - (account.total + (account.total * parseFloat(finishFormData.tipPercentage || 0)) / 100)).toFixed(2)} MXN
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={!finishFormData.amountPaid || account.status === "closed"}
                style={{ width: "100%" }}
              >
                {account.status === "closed" ? "Cuenta Ya Finalizada" : "Finalizar Cuenta"}
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => {
                  closeModal();
                  setIsFinishingAccount(false);
                }}
                style={{ width: "100%" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
