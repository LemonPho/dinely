import React, { useState, useEffect, useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { useUserContext } from "../application-context/user-context";
import { useAuthenticationContext } from "../application-context/authentication-context";

import "../styles/global.css";

export default function RegisterPage() {
  const { register, loading } = useAuthenticationContext();
  const { user, userLoading } = useUserContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirmation: "",
  })
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    await register(
      formData,
      setEmailInvalid,
      setPasswordInvalid
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (userLoading) {
    return;
  }

  if (user != undefined) {
    return (
      <div>
        <Navigate replace to="/" />
      </div>
    )
  }

  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card rounded-15 mx-auto mt-2" style={{ width: "21rem" }}>
          <h1>Registrar</h1>
          <p className="auth-subtitle">
            Crea una cuenta para reservar tu mesa en Dinely.
          </p>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="tuemail@ejemplo.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className={emailInvalid ? "error" : ""}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className={passwordInvalid ? "error" : ""}
              />
            </div>
            <div className="form-group">
              <label htmlFor="passwordConfirmation">Confirmar contraseña</label>
              <input 
                type="password" 
                id="passwordConfirmation" 
                name="passwordConfirmation" 
                placeholder="••••••••" 
                value={formData.passwordConfirmation} 
                onChange={handleChange} 
                required 
                className={passwordInvalid ? "error" : ""}
              />
            </div>
            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>
        {/* Botón inferior opcional */}
        <div className="back-home-container">
          <Link to="/" className="btn-back-home">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}