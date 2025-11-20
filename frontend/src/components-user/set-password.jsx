import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMessagesContext } from "../application-context/messages-context";
import { submitSetPassword } from "../fetch/Authentication";
import "../styles/global.css";

export default function SetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { errorMessage, successMessage, loadingMessage, setErrorMessage, setSuccessMessage, setLoadingMessage, resetMessages } = useMessagesContext();
  
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirmation: "",
  });

  // Si no hay uid o token, no renderizar nada
  if (!uid || !token) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    // Validar longitud mínima
    if (formData.password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoadingMessage("Estableciendo contraseña...");
    const response = await submitSetPassword(uid, token, formData.password);
    setLoadingMessage(false);

    if (response.status === 500 || response.error) {
      setErrorMessage("Hubo un error al intentar establecer la contraseña. Por favor intenta de nuevo.");
      return;
    }

    if (response.status === 400) {
      if (response.password_short) {
        setErrorMessage("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      if (response.token_valid === false) {
        setErrorMessage("El enlace ha expirado o es inválido. Solicita uno nuevo.");
        return;
      }

      if (response.user_exists === false) {
        setErrorMessage("Usuario no encontrado");
        return;
      }

      if (response.user_active) {
        setErrorMessage("Esta cuenta ya ha sido activada");
        return;
      }

      setErrorMessage("Verifica que la información sea correcta e intenta de nuevo");
    } else if (response.status === 201) {
      setSuccessMessage("¡Contraseña establecida exitosamente! Redirigiendo al inicio de sesión...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setErrorMessage(`Error desconocido con código de estatus: ${response.status}`);
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>Establece tu contraseña</h1>
          <p className="auth-subtitle">
            Crea una contraseña segura para tu cuenta de empleado en Dinely.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirmation">Confirmar contraseña</label>
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                placeholder="••••••••"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="btn-primary auth-btn">
              Establecer contraseña
            </button>
          </form>

          <p className="auth-helper">
            Tu contraseña debe tener al menos 8 caracteres para garantizar la seguridad de tu cuenta.
          </p>

          <div className="auth-links">
            <Link to="/login">¿Ya tienes contraseña? Inicia sesión</Link>
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

