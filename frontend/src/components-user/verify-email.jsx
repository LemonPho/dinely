import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMessagesContext } from "../application-context/messages-context";
import { verifyEmail } from "../fetch/authentication";
import "../styles/global.css";

export default function VerifyEmail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { errorMessage, successMessage, loadingMessage, setErrorMessage, setSuccessMessage, setLoadingMessage, resetMessages } = useMessagesContext();
  
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    async function handleVerification() {
      if (!code) {
        setErrorMessage("Código de validación no encontrado");
        setVerifying(false);
        return;
      }

      resetMessages();
      setLoadingMessage("Verificando correo electrónico...");

      const response = await verifyEmail(code);
      setLoadingMessage("");

      if (response.error || response.status === 500) {
        setErrorMessage("Hubo un error al intentar verificar el correo electrónico. Por favor intenta de nuevo.");
        setVerifying(false);
        return;
      }

      if (response.status === 400 || response.status === 404) {
        setErrorMessage(response.errorMessage || "El código de validación es inválido o ha expirado.");
        setVerifying(false);
        return;
      }

      if (response.status === 200) {
        setSuccessMessage("¡Correo electrónico verificado exitosamente! Redirigiendo al inicio de sesión...");
        setVerified(true);
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        setErrorMessage(`Error desconocido con código de estatus: ${response.status}`);
        setVerifying(false);
      }
    }

    handleVerification();
  }, [code]);

  if (!code) {
    return null;
  }

  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>Verificando correo electrónico</h1>
          
          {verifying && !verified && (
            <>
              <p className="auth-subtitle">
                Por favor espera mientras verificamos tu correo electrónico...
              </p>
              {loadingMessage && <p className="loading-message">{loadingMessage}</p>}
            </>
          )}

          {verified && (
            <>
              <p className="auth-subtitle">
                Tu cuenta ha sido activada exitosamente.
              </p>
              {successMessage && <p className="success-message">{successMessage}</p>}
            </>
          )}

          {!verifying && !verified && (
            <>
              <p className="auth-subtitle">
                No se pudo verificar tu correo electrónico.
              </p>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <div className="auth-links">
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/">Volver al inicio</Link>
              </div>
            </>
          )}

          {/* Botón inferior opcional */}
          <div className="back-home-container">
            <Link to="/" className="btn-back-home">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
