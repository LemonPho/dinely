import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

function Login() {
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });

  const [mensaje, setMensaje] = useState("");

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
    // Ejemplo futuro:
    // fetch("/api/login", { method: "POST", body: JSON.stringify(formData) })

    setMensaje(
      "Simulación de inicio de sesión: cuando el backend esté listo, aquí se validarán tus datos y se cargará tu perfil."
    );
  };

  return (
    <div className="app-root">
      <main>
        <section className="auth-page">
          <div className="container">
            <div className="auth-card">
              <h1>Iniciar sesión</h1>
              <p className="auth-subtitle">
                Accede para ver y administrar tus reservas guardadas en Dinely.
              </p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="correoLogin">Correo electrónico</label>
                  <input
                    id="correoLogin"
                    name="correo"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={formData.correo}
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

              {mensaje && (
                <p className="reservation-message" style={{ marginTop: "0.8rem" }}>
                  {mensaje}
                </p>
              )}

              <p className="auth-helper">
                Más adelante podrás crear una cuenta nueva desde aquí o iniciar
                sesión con otros métodos cuando el backend esté integrado.
              </p>

              <div className="auth-links">
                <Link to="/mis-reservas">Ir a Mis reservas</Link>
                <Link to="/">Volver al inicio</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Botón inferior opcional */}
        <div className="back-home-container">
          <Link to="/" className="btn-back-home">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Login;
