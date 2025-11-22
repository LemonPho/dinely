import React, { useEffect, useState } from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";
import { useMessagesContext } from "../application-context/messages-context.jsx"
import Modal from "../util-components/Modal.jsx";
import Dropdown from "../util-components/Dropdown.jsx";
import "../styles/global.css";
import "../styles/admin.css";
import { createPlateCategory, getPlateCategories } from "../fetch/Admin.jsx";

export default function AdminPlatesPage() {
  const { openedModal, openModal, closeModal, openedDropdown, toggleDropdown, closeDropdown } = useOpenersContext();
  const { setErrorMessage, setSuccessMessage, successMessage, loadingMessage, errorMessage, resetMessages } = useMessagesContext();

  // Mock data - no API calls
  // Plates come from backend structured as: { "entrada": [plates], "platillo": [plates], ... }
  const [plates, setPlates] = useState({});
  const [plateCategories, setPlateCategories] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [categoryInput, setCategoryInput] = useState("");
  const [plateFormData, setPlateFormData] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [editCategoryFormData, setEditCategoryFormData] = useState({
    id: "",
    label: ""
  });

  async function retrievePlateCategories(){
    const apiResponse = await getPlateCategories();
    if(apiResponse.status === 200){
      setPlateCategories(apiResponse.plateCategores);
    } else {
      setErrorMessage("Hubo un error al obtener los categorias de platos");
    }
  }

  function handlePlateClick(plate) {
    setIsEditing(true);
    setIsCreating(false);
    setPlateFormData({
      id: plate.id || "",
      name: plate.name,
      price: plate.price.toString(),
      category: plate.category,
      description: plate.description || "",
    });
    openModal(`edit-plate-${plate.id}`);
  }

  function handleCreatePlateClick() {
    if (plateCategories.length <= 0) {
      setErrorMessage("Asegurate de crear a lo menos una categoría de platillo antes de crear un platillo");
      return;
    }

    setIsEditing(false);
    setIsCreating(true);
    const firstCategory = plateCategories.length > 0 ? plateCategories[0].label : "";

    setPlateFormData({
      name: "",
      price: "",
      category: firstCategory,
      description: "",
    });
    openModal("create-plate");
  }

  function handleManageCategoriesClick() {
    setCategoryInput("");
    setEditCategoryFormData({ id: "", label: "" });
    openModal("manage-plate-categories");
  }

  function handleEditCategory(category) {
    setIsEditing(true);
    setIsCreating(false);
    setEditCategoryFormData({ id: category.id, label: category.label });
  }

  function handleDeleteCategory(category) {
    // TODO: Backend will validate if plates use this category before deletion

    // Delete category
    const updatedCategories = plateCategories.filter(cat => cat.id !== category.id);

    setPlateCategories(updatedCategories);
    setSuccessMessage("Categoría eliminada exitosamente");
  }

  function handleCancelCategoryEdit() {
    setIsEditing(false);
    setIsCreating(false);
    setEditCategoryFormData({ id: "", label: "" });
  }

  function handleChangePlate(e) {
    const { name, value } = e.target;
    setPlateFormData({
      ...plateFormData,
      [name]: value,
    });
  }

  function handleEditChangeCategory(e) {
    const { name, value } = e.target;
    setEditCategoryFormData({
      ...editCategoryFormData,
      [name]: value,
    });
  }

  function handleChangeCategory(e) {
    const { value } = e.target;
    setCategoryInput(value);
  }

  async function handleSubmitCategory(e) {
    e.preventDefault();
    if (isEditing) {
      if (!editCategoryFormData.label.trim()) {
        setErrorMessage("El nombre de la categoría no puede estar vacío");
        return;
      }

      setEditCategoryFormData({
        ...editCategoryFormData,
        label: editCategoryFormData.label.trim(),
      });

      //api call

      //setPlateCategories(updatedCategories);
      setIsEditing(false);
      setIsCreating(false);
      setEditCategoryFormData({ id: "", label: "" });
      setSuccessMessage("Categoría actualizada exitosamente");
    } else {
      if (!categoryInput.trim()) {
        setErrorMessage("El nombre de la categoría no puede estar vacío");
        return;
      }

      // Create new category object with id and label
      setCategoryInput(categoryInput.trim());

      //api call
      const apiResponse = await createPlateCategory(categoryInput);
      if (apiResponse.status === 201) {
        setSuccessMessage("Categoría creada");
        setPlateCategories([...plateCategories, apiResponse.category]);
        setCategoryInput("");
      } else {
        setErrorMessage("Verifique que no exista ya una categoría con ese nombre y que todo sea válido");
      }
    }
  }

  async function handleSubmitPlate(){

  }

  useEffect(() => {
    async function fetchData(){
      await retrievePlateCategories();
    }

    fetchData();
  }, []);

  const totalPlatesCount = Object.values(plates).reduce((sum, catPlates) => sum + (catPlates?.length || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Gestionar Platillos</h1>
            <p>Ver y gestionar los elementos del menú</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="admin-btn-secondary"
              onClick={handleManageCategoriesClick}
            >
              Gestionar Categorías
            </button>
            <button
              className="admin-btn-primary"
              onClick={handleCreatePlateClick}
            >
              Crear Platillo
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content-card">
        {Object.keys(plates).map((category, categoryIndex) => (
          <div key={category}>
            {categoryIndex > 0 && (
              <hr style={{
                margin: "2rem 0",
                border: "none",
                borderTop: "1px solid #e0e0e0",
              }} />
            )}
            <div className="admin-tables-grid">
              {plates[category].map((plate) => (
                <div
                  key={plate.id}
                  className="admin-table-card"
                  onClick={() => handlePlateClick(plate)}
                >
                  <div className="admin-table-header">
                    <h3>{plate.name}</h3>
                    <span className="admin-table-status">
                      {plate.category}
                    </span>
                  </div>
                  <div className="admin-table-details">
                    <p>Precio: ${plate.price} MXN</p>
                    {plate.description && <p className="admin-table-notes">{plate.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {totalPlatesCount === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            No hay platillos registrados
          </div>
        )}
      </div>

      <Modal isOpen={openedModal === "manage-plate-categories"}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2>Gestionar Categorías</h2>
            <button
              className="admin-modal-close"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
          {/*Mensajes */}
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
          <div className="admin-modal-form-rows" style={{ padding: "1.5rem" }}>
            {/* Create new category */}
            <form onSubmit={handleSubmitCategory} style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid #e0e0e0" }}>
              <div className="admin-form-group full-width">
                <label htmlFor="new-category">Crear Nueva Categoría</label>
                <div style={{ display: "flex", gap: "0.5rem", width: "100%", minWidth: 0 }}>
                  <input
                    type="text"
                    id="new-category"
                    name="label"
                    value={categoryInput}
                    onChange={handleChangeCategory}
                    placeholder="ej: Postres"
                    style={{ flex: "1 1 auto", minWidth: 0 }}
                  />
                  <button type="submit" className="admin-btn-primary" style={{ flexShrink: 0 }}>
                    Crear
                  </button>
                </div>
              </div>
            </form>

            {/* List existing categories */}
            <div className="admin-form-group full-width">
              <label>Categorías Existentes</label>
              {plateCategories.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                  No hay categorías registradas
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {plateCategories.map((category) => {
                    const isEditingCategory = isEditing && editCategoryFormData.id === category.id;

                    return (
                      <div
                        key={category.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                      >
                        {isEditingCategory ? (
                          <>
                            <input
                              type="text"
                              name="label"
                              value={editCategoryFormData.label}
                              onChange={handleEditChangeCategory}
                              style={{ flex: 1, padding: "0.5rem" }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSubmitCategory}
                              className="admin-btn-primary"
                              style={{ padding: "0.5rem 1rem" }}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelCategoryEdit}
                              className="admin-btn-secondary"
                              style={{ padding: "0.5rem 1rem" }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <span style={{ flex: 1, fontWeight: 500 }}>{category.label}</span>
                            <button
                              type="button"
                              onClick={() => handleEditCategory(category)}
                              className="admin-btn-secondary"
                              style={{ padding: "0.5rem 1rem" }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(category)}
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                              }}
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

      <Modal isOpen={openedModal === `edit-plate-${isEditing?.id}` || openedModal === "create-plate"}>
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2>{isCreating ? "Crear Nuevo Platillo" : `Editar Platillo`}</h2>
            <button
              className="admin-modal-close"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
          <form className="admin-modal-form" onSubmit={handleSubmitPlate}>
            <div className="admin-form-group full-width">
              <label htmlFor="name">Nombre del Platillo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={plateFormData.name}
                onChange={handleChangePlate}
                required
                placeholder="ej: Guacamole con totopos"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="price">Precio (MXN)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={plateFormData.price}
                onChange={handleChangePlate}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="category">Categoría</label>
              <div className="dropdown-div">
                <button
                  type="button"
                  className="admin-select-dropdown-button"
                  id="category-button"
                  onClick={(e) => toggleDropdown("category-dropdown")}
                >
                  {plateFormData.category ? (
                    <span>{plateFormData.category}</span>
                  ) : (
                    <span>Seleccionar categoría...</span>
                  )}
                </button>
                <Dropdown isOpen={openedDropdown === "category-dropdown"}>
                  <ul
                    className="admin-select-dropdown-menu"
                    id="category-dropdown"
                    style={{ overflowY: "scroll", maxHeight: "15rem" }}
                  >
                    {plateCategories.map((cat) => {
                      return (
                        <li key={cat.id}>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleChangePlate({
                                target: { name: "category", value: cat.label },
                              });
                              closeDropdown();
                            }}
                          >
                            {cat.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </Dropdown>
              </div>
            </div>

            <div className="admin-form-group full-width">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={plateFormData.description}
                onChange={handleChangePlate}
                rows="3"
                placeholder="Descripción del platillo (opcional)..."
              />
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
    </div>
  );
}
