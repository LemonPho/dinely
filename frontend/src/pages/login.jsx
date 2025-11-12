import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

export default function Login() {
  const [datosFormulario, setDatosFormulario] = useState({
    correo: "",
    contrasena: "",
  });

  const handleCambio = (e) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnviar = (e) => {
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

              <form className="auth-form" onSubmit={handleEnviar}>
                <div className="form-group">
                  <label htmlFor="correoLogin">Correo electrónico</label>
                  <input
                    id="correoLogin"
                    name="correo"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={datosFormulario.correo}
                    onChange={handleCambio}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contrasenaLogin">Contraseña</label>
                  <input
                    id="contrasenaLogin"
                    name="contrasena"
                    type="password"
                    placeholder="••••••••"
                    value={datosFormulario.contrasena}
                    onChange={handleCambio}
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