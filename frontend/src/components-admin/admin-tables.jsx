import React, { useEffect, useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import { useMessagesContext } from "../application-context/messages-context.jsx"
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import Messages from "../util-components/messages.jsx";
import "../styles/global.css";
import "../styles/admin.css";
import { createTableArea, getTableAreas, createTable, getTables, editTableArea, editTable, deleteTableArea, deleteTable } from "../fetch/admin.jsx";

export default function AdminTablesPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();
  const { setErrorMessage, setSuccessMessage, successMessage, loadingMessage, errorMessage, resetMessages } = useMessagesContext();

  // Tables come from backend structured as: { "Interior": [tables], "Terraza": [tables], ... }
  const [tables, setTables] = useState({});
  const [tableAreas, setTableAreas] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [areaInput, setAreaInput] = useState("");
  const [tableFormData, setTableFormData] = useState({
    id: "",
    code: "",
    capacity: "",
    state: "available",
    area: "",
    notes: "",
  });
  const [editAreaFormData, setEditAreaFormData] = useState({
    id: "",
    label: ""
  });

  function groupTablesByArea(tables) {
    // Organizar las mesas por área
    // Las mesas ya vienen ordenadas por área desde el backend
    const tablesByArea = {};
    tables.forEach((table) => {
      const areaLabel = table.area?.label || "Sin área";
      if (!tablesByArea[areaLabel]) {
        tablesByArea[areaLabel] = [];
      }
      tablesByArea[areaLabel].push(table);
    });
    return tablesByArea;
  }

  async function retrieveTableAreas(){
    resetMessages();
    const apiResponse = await getTableAreas();
    if(apiResponse.status === 200){
      setTableAreas(apiResponse.tableAreas);
    } else {
      setErrorMessage("Hubo un error al obtener las áreas de mesas");
    }
  }

  async function retrieveTables() {
    resetMessages();
    const apiResponse = await getTables();
    if (apiResponse.status === 200) {
      const tablesByArea = groupTablesByArea(apiResponse.tables);
      setTables(tablesByArea);
    } else {
      setErrorMessage("Hubo un error al obtener las mesas");
    }
  }

  function handleTableClick(table) {
    setIsEditing(true);
    setIsCreating(false);
    setTableFormData({
      id: table.id || "",
      code: table.code || "",
      capacity: table.capacity.toString(),
      state: table.state || "available",
      area: table.area?.label || "",
      notes: table.notes || "",
    });
    openModal(`edit-table-${table.id}`);
  }

  async function handleDeleteTable() {
    resetMessages();
    if (!tableFormData.id) {
      return;
    }

    // Confirmar eliminación
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la mesa "${tableFormData.code}"?`)) {
      return;
    }

    const apiResponse = await deleteTable(tableFormData.id);

    if (apiResponse.status === 201) {
      // Eliminar la mesa del estado local
      setTables((prevTables) => {
        const updatedTables = { ...prevTables };
        const areaLabel = tableFormData.area || "Sin área";
        
        if (updatedTables[areaLabel]) {
          updatedTables[areaLabel] = updatedTables[areaLabel].filter(
            (table) => table.id !== tableFormData.id
          );
          
          // Si el área queda vacía, eliminarla
          if (updatedTables[areaLabel].length === 0) {
            delete updatedTables[areaLabel];
          }
        }
        
        return updatedTables;
      });
      
      // Limpiar el formulario y cerrar modal
      setTableFormData({
        id: "",
        code: "",
        capacity: "",
        state: "available",
        area: "",
        notes: "",
      });
      setIsEditing(false);
      setIsCreating(false);
      closeModal();
      
      setSuccessMessage("Mesa eliminada exitosamente");
    } else {
      const errorMsg = apiResponse.errorMessage || "Error al eliminar la mesa. Por favor intenta de nuevo.";
      setErrorMessage(errorMsg);
    }
  }

  function handleCreateTableClick() {
    resetMessages();
    if (tableAreas.length <= 0) {
      setErrorMessage("Asegurate de crear a lo menos un área de mesa antes de crear una mesa");
      return;
    }

    setIsEditing(false);
    setIsCreating(true);
    const firstArea = tableAreas.length > 0 ? tableAreas[0].label : "";

    setTableFormData({
      id: "",
      code: "",
      capacity: "",
      state: "available",
      area: firstArea,
      notes: "",
    });
    openModal("create-table");
  }

  function handleManageAreasClick() {
    setAreaInput("");
    setEditAreaFormData({ id: "", label: "" });
    openModal("manage-table-areas");
  }

  function handleEditArea(area) {
    setIsEditing(true);
    setIsCreating(false);
    setEditAreaFormData({ id: area.id, label: area.label });
  }

  async function handleDeleteArea(area) {
    resetMessages();
    // Confirmar eliminación
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el área "${area.label}"?`)) {
      return;
    }

    const apiResponse = await deleteTableArea(area.id);
    console.log(apiResponse);

    if (apiResponse.status === 201) {
      // Eliminar el área del estado local
      setTableAreas((prevAreas) => 
        prevAreas.filter((areaItem) => areaItem.id !== area.id)
      );
      
      
      setSuccessMessage("Área eliminada exitosamente");
    } else if(apiResponse.status === 404){
      setErrorMessage("No se encontró el área, quizá ya se eliminó");
    } else {
      setErrorMessage("Error al eliminar el área. Verifique que no haya mesas usando esta área.");
    }
  }

  function handleCancelAreaEdit() {
    setIsEditing(false);
    setIsCreating(false);
    setEditAreaFormData({ id: "", label: "" });
  }

  function handleChangeTable(e) {
    const { name, value } = e.target;
    setTableFormData({
      ...tableFormData,
      [name]: value,
    });
  }

  function handleEditChangeArea(e) {
    const { name, value } = e.target;
    setEditAreaFormData({
      ...editAreaFormData,
      [name]: value,
    });
  }

  function handleChangeArea(e) {
    const { value } = e.target;
    setAreaInput(value);
  }

  async function handleSubmitArea(e) {
    e.preventDefault();
    resetMessages();
    if (isEditing) {
      const trimmedLabel = (editAreaFormData.label || "").trim();
      if (!trimmedLabel) {
        setErrorMessage("El nombre del área no puede estar vacío");
        return;
      }

      // Llamar a la API para editar el área
      const apiResponse = await editTableArea(editAreaFormData.id, trimmedLabel);
      
      if (apiResponse.status === 201) {
        // Actualizar áreas y mesas con los datos del backend
        setTableAreas(apiResponse.tableAreas);
        
        // Organizar las mesas por área
        const tablesByArea = groupTablesByArea(apiResponse.tables);
        setTables(tablesByArea);
        
        setIsEditing(false);
        setIsCreating(false);
        setEditAreaFormData({ id: "", label: "" });
        setSuccessMessage("Área actualizada exitosamente");
      } else {
        setErrorMessage("Error al actualizar el área. Verifique que no exista ya un área con ese nombre.");
      }
    } else {
      // Validar y limpiar el input
      const trimmedArea = (areaInput || "").trim();
      if (!trimmedArea) {
        setErrorMessage("El nombre del área no puede estar vacío");
        return;
      }

      // Llamar a la API con el valor ya limpiado
      const apiResponse = await createTableArea(trimmedArea);
      if (apiResponse.status === 201) {
        setSuccessMessage("Área creada");
        setTableAreas([...tableAreas, apiResponse.area]);
        setAreaInput("");
      } else {
        setErrorMessage("Verifique que no exista ya un área con ese nombre y que todo sea válido");
      }
    }
  }

  async function handleSubmitTable(e) {
    e.preventDefault();
    resetMessages();

    // Validaciones del lado del cliente
    if (!tableFormData.code.trim()) {
      setErrorMessage("El código de la mesa no puede estar vacío");
      return;
    }

    if (!tableFormData.capacity || parseInt(tableFormData.capacity) <= 0) {
      setErrorMessage("La capacidad debe ser mayor a cero");
      return;
    }

    if (!tableFormData.state.trim()) {
      setErrorMessage("Debes seleccionar un estado");
      return;
    }

    if (!tableFormData.area) {
      setErrorMessage("Debes seleccionar un área");
      return;
    }

    // Determinar si es creación o edición
    const isEditingTable = isEditing && tableFormData.id;
    const apiResponse = isEditingTable 
      ? await editTable(tableFormData)
      : await createTable(tableFormData);

    if (apiResponse.status === 201) {
      const updatedTable = apiResponse.table;
      const areaLabel = updatedTable.area?.label || "Sin área";
      
      if (isEditingTable) {
        setSuccessMessage("Mesa actualizada exitosamente");
        
        // Actualizar la mesa en la lista local
        setTables((prevTables) => {
          const updatedTables = { ...prevTables };
          
          // Buscar y remover la mesa antigua de cualquier área
          Object.keys(updatedTables).forEach((area) => {
            updatedTables[area] = updatedTables[area].filter(t => t.id !== updatedTable.id);
          });
          
          // Agregar la mesa actualizada en su nueva área
          if (!updatedTables[areaLabel]) {
            updatedTables[areaLabel] = [];
          }
          updatedTables[areaLabel].push(updatedTable);
          
          // Limpiar áreas vacías
          Object.keys(updatedTables).forEach((area) => {
            if (updatedTables[area].length === 0) {
              delete updatedTables[area];
            }
          });
          
          return updatedTables;
        });
      } else {
        setSuccessMessage("Mesa creada exitosamente");
        
        // Agregar la mesa a la lista local
        setTables((prevTables) => {
          const updatedTables = { ...prevTables };
          if (!updatedTables[areaLabel]) {
            updatedTables[areaLabel] = [];
          }
          updatedTables[areaLabel] = [...updatedTables[areaLabel], updatedTable];
          return updatedTables;
        });
      }

      // Limpiar el formulario y cerrar modal
      setTableFormData({
        id: "",
        code: "",
        capacity: "",
        state: "available",
        area: "",
        notes: "",
      });
      setIsEditing(false);
      setIsCreating(false);
      closeModal();
    } else if (apiResponse.status === 400) {
      // Errores de validación del backend
      const errors = apiResponse.validationErrors;
      let errorMessage = `Error al ${isEditingTable ? 'actualizar' : 'crear'} la mesa:\n`;
      
      if (errors.code) {
        errorMessage += `- ${errors.code[0]}\n`;
      }
      if (errors.capacity) {
        errorMessage += `- ${errors.capacity[0]}\n`;
      }
      if (errors.state) {
        errorMessage += `- ${errors.state[0]}\n`;
      }
      if (errors.area) {
        errorMessage += `- ${errors.area[0]}\n`;
      }
      
      setErrorMessage(errorMessage);
    } else {
      setErrorMessage(`Hubo un error al ${isEditingTable ? 'actualizar' : 'crear'} la mesa. Por favor intenta de nuevo.`);
    }
  }

  useEffect(() => {
    async function fetchData(){
      await retrieveTableAreas();
      await retrieveTables();
    }

    fetchData();
  }, []);

  const totalTablesCount = Object.values(tables).reduce((sum, areaTables) => sum + (areaTables?.length || 0), 0);

  function getStatusColor(state) {
    switch (state) {
      case "available":
        return "status-available";
      case "occupied":
        return "status-occupied";
      case "reserved":
        return "status-reserved";
      default:
        return "";
    }
  }

  function getStatusLabel(state) {
    switch (state) {
      case "available":
        return "Disponible";
      case "occupied":
        return "Ocupada";
      case "reserved":
        return "Reservada";
      default:
        return state;
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Gestionar Mesas</h1>
            <p>Ver y gestionar las mesas del restaurante</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="admin-btn-secondary"
              onClick={handleManageAreasClick}
            >
              Gestionar Áreas
            </button>
            <button
              className="admin-btn-primary"
              onClick={handleCreateTableClick}
            >
              Crear Mesa
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content-card">
        {Object.keys(tables).map((area, areaIndex) => (
          <div key={area}>
            {areaIndex > 0 && (
              <hr style={{
                margin: "2rem 0",
                border: "none",
                borderTop: "1px solid #e0e0e0",
              }} />
            )}
            <div className="admin-tables-grid">
              {tables[area].map((table) => (
                <div
                  key={table.id}
                  className="admin-table-card"
                  onClick={() => handleTableClick(table)}
                >
                  <div className="admin-table-header">
                    <h3>{table.code}</h3>
                    <span className={`admin-table-status ${getStatusColor(table.state)}`}>
                      {getStatusLabel(table.state)}
                    </span>
                  </div>
                  <div className="admin-table-details">
                    <p>Capacidad: {table.capacity} personas</p>
                    <p>Área: {table.area?.label || "Sin área"}</p>
                    {table.state === "occupied" && table.active_bill_code && (
                      <p style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                        Cuenta: {table.active_bill_code}
                      </p>
                    )}
                    {table.notes && <p className="admin-table-notes">{table.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {totalTablesCount === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            No hay mesas registradas
          </div>
        )}
      </div>

      <Modal isOpen={openedModal === "manage-table-areas"}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2>Gestionar Áreas</h2>
            <button
              className="admin-modal-close"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
          <Messages />
          <div className="admin-modal-form-rows" style={{ padding: "1.5rem" }}>
            {/* Create new area */}
            <form onSubmit={handleSubmitArea} style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid #e0e0e0" }}>
              <div className="admin-form-group full-width">
                <label htmlFor="new-area">Crear Nueva Área</label>
                <div style={{ display: "flex", gap: "0.5rem", width: "100%", minWidth: 0 }}>
                  <input
                    type="text"
                    id="new-area"
                    name="label"
                    value={areaInput}
                    onChange={handleChangeArea}
                    placeholder="ej: Interior, Terraza, Bar"
                    style={{ flex: "1 1 auto", minWidth: 0 }}
                  />
                  <button type="submit" className="admin-btn-primary" style={{ flexShrink: 0 }}>
                    Crear
                  </button>
                </div>
              </div>
            </form>

            {/* List existing areas */}
            <div className="admin-form-group full-width">
              <label>Áreas Existentes</label>
              {tableAreas.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                  No hay áreas registradas
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {tableAreas.map((area) => {
                    const isEditingArea = isEditing && editAreaFormData.id === area.id;

                    return (
                      <div
                        key={area.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                      >
                        {isEditingArea ? (
                          <>
                            <input
                              type="text"
                              name="label"
                              value={editAreaFormData.label}
                              onChange={handleEditChangeArea}
                              style={{ flex: 1, padding: "0.5rem" }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSubmitArea}
                              className="admin-btn-primary"
                              style={{ padding: "0.5rem 1rem" }}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelAreaEdit}
                              className="admin-btn-secondary"
                              style={{ padding: "0.5rem 1rem" }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <span style={{ flex: 1, fontWeight: 500 }}>{area.label}</span>
                            <button
                              type="button"
                              onClick={() => handleEditArea(area)}
                              className="admin-btn-secondary"
                              style={{ padding: "0.5rem 1rem" }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="admin-btn-danger"
                              onClick={() => handleDeleteArea(area)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="admin-form-actions full-width" style={{ marginTop: "1.5rem" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={closeModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openedModal === `edit-table-${tableFormData.id}` || openedModal === "create-table"}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2>{isCreating ? "Crear Nueva Mesa" : `Editar Mesa`}</h2>
            <button
              className="admin-modal-close"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
          <form className="admin-modal-form" onSubmit={handleSubmitTable}>
            <div className="admin-form-group">
              <label htmlFor="code">Código de Mesa</label>
              <input
                type="text"
                id="code"
                name="code"
                value={tableFormData.code}
                onChange={handleChangeTable}
                required
                placeholder="ej: A1, VIP-1, Mesa-5"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="capacity">Capacidad</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={tableFormData.capacity}
                onChange={handleChangeTable}
                required
                min="1"
                max="20"
              />
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
                  {tableFormData.state === "available" ? (
                    <span>Disponible</span>
                  ) : tableFormData.state === "occupied" ? (
                    <span>Ocupada</span>
                  ) : tableFormData.state === "reserved" ? (
                    <span>Reservada</span>
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
                          handleChangeTable({
                            target: { name: "state", value: "available" },
                          });
                          closeDropdown();
                        }}
                      >
                        Disponible
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        onClick={() => {
                          handleChangeTable({
                            target: { name: "state", value: "occupied" },
                          });
                          closeDropdown();
                        }}
                      >
                        Ocupada
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        onClick={() => {
                          handleChangeTable({
                            target: { name: "state", value: "reserved" },
                          });
                          closeDropdown();
                        }}
                      >
                        Reservada
                      </a>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="area">Área</label>
              <div className="dropdown-div">
                <button
                  type="button"
                  className="admin-select-dropdown-button"
                  id="area-button"
                  onClick={(e) => toggleDropdown("area-dropdown")}
                >
                  {tableFormData.area ? (
                    <span>{tableFormData.area}</span>
                  ) : (
                    <span>Seleccionar área...</span>
                  )}
                </button>
                <Dropdown isOpen={openedDropdown === "area-dropdown"}>
                  <ul
                    className="admin-select-dropdown-menu"
                    id="area-dropdown"
                    style={{ overflowY: "scroll", maxHeight: "15rem" }}
                  >
                    {tableAreas.map((area) => {
                      return (
                        <li key={area.id}>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChangeTable({
                                target: { name: "area", value: area.label },
                              });
                              closeDropdown();
                            }}
                          >
                            {area.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </Dropdown>
              </div>
            </div>

            <div className="admin-form-group full-width">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                value={tableFormData.notes}
                onChange={handleChangeTable}
                rows="3"
                placeholder="Notas adicionales sobre esta mesa..."
              />
            </div>

            <div className="admin-form-actions full-width">
              {isEditing && tableFormData.id && (
                <button
                  type="button"
                  className="admin-btn-danger large"
                  onClick={handleDeleteTable}
                  style={{ marginRight: "auto" }}
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
