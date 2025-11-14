import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔌 AQUÍ LUEGO VA EL BACKEND
    // hay una funcion en /fetch que tiene para hacer login
  };

  return (
    <section className="auth-page">
          <div className="container">
            <div className="auth-card">
              <h1>Iniciar sesión</h1>
              <p className="auth-subtitle">
                Accede para ver y administrar tus reservas guardadas en Dinely.
              </p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="emailLogin">Correo electrónico</label>
                  <input
                    id="emailLogin"
                    name="email"
                    type="email"
                    placeholder="tuemail@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="passwordLogin">Contraseña</label>
                  <input
                    id="passwordLogin"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary auth-btn">
                  Iniciar sesión
                </button>
              </form>

              <p className="auth-helper">
                Más adelante podrás crear una cuenta nueva desde aquí o iniciar
                sesión con otros métodos cuando el backend esté integrado.
              </p>

              <div className="auth-links">
                <Link to="/mis-reservas">Ir a Mis reservas</Link>
                <Link to="/">Volver al inicio</Link>
              </div>
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