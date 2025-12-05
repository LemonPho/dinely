import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitLogin } from "../fetch/authentication";
import { useMessagesContext } from "../application-context/messages-context";
import "../styles/global.css";

export default function Login() {
  const { setErrorMessage, resetMessages } = useMessagesContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await submitLogin(formData);

    if (response.error || response.status === 500) {
      setError("Error en el servidor. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    if (response.status === 404) {
      setError("Email no encontrado.");
      setLoading(false);
      return;
    }

    if (response.status === 400) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    if (response.status === 200) {
      navigate("/");
      return;
    }

    setLoading(false);
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
                {error && <p className="error-message">{error}</p>}
                
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
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