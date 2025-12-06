import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMessagesContext } from "../application-context/messages-context.jsx";
import { useUserContext } from "../application-context/user-context.jsx";
import { getReviews, createReview } from "../fetch/reviews.jsx";
import "../styles/global.css";

export default function ReviewsPage() {
  const { errorMessage, successMessage, setErrorMessage, setSuccessMessage, resetMessages, setLoadingMessage } = useMessagesContext();
  const { user, userLoading } = useUserContext();
  
  // Estado de reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Estado del formulario de nueva opinión
  const [form, setForm] = useState({
    title: "",
    content: "",
    score: 0,
    user: { name: "Tú" },
  });
  const [submitting, setSubmitting] = useState(false);

  // Cargar reviews al montar el componente
  useEffect(() => {
    async function loadReviews() {
      setReviewsLoading(true);
      const response = await getReviews();
      setReviewsLoading(false);
      
      if (response.error || response.status === 500) {
        setErrorMessage("Error al cargar las opiniones");
        return;
      }
      
      if (response.status === 200) {
        setReviews(response.reviews);
        setUserHasReviewed(response.user_has_reviewed || false);
      }
    }
    
    loadReviews();
  }, []);

  // Manejadores del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleStarClick = (score) => {
    setForm(f => ({ ...f, score }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!form.content.trim()) {
      setErrorMessage("Por favor, escribe una opinión.");
      return;
    }
    if (form.score === 0) {
      setErrorMessage("Selecciona una puntuación con estrellas.");
      return;
    }
    setSubmitting(true);
    setLoadingMessage("Enviando opinión...");
    
    const response = await createReview({
      title: form.title || null,
      content: form.content,
      score: form.score,
    });
    
    setLoadingMessage("");
    setSubmitting(false);
    
    if (response.error || response.status === 500) {
      setErrorMessage("Error al enviar la opinión");
      return;
    }
    
    if (response.status === 400) {
      if (response.validationErrors) {
        const errors = response.validationErrors;
        let errorMsg = "Error al crear la opinión:\n";
        if (errors.valid_content === false) {
          errorMsg += "- El contenido es requerido\n";
        }
        if (errors.valid_score === false) {
          errorMsg += "- La puntuación debe estar entre 1 y 5\n";
        }
        if (errors.valid_title === false) {
          errorMsg += "- El título no puede exceder 100 caracteres\n";
        }
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage(response.errorMessage || "Error al crear la opinión");
      }
      return;
    }
    
    if (response.status === 201 && response.review) {
      setForm({ title: "", content: "", score: 0, user: { name: "Tú" } });
      setSuccessMessage("¡Gracias por tu opinión!");
      setTimeout(() => setSuccessMessage(""), 2200);
      // Recargar reviews para mostrar la nueva
      const reviewsResponse = await getReviews();
      if (reviewsResponse.status === 200) {
        setReviews(reviewsResponse.reviews);
        setUserHasReviewed(reviewsResponse.user_has_reviewed || false);
      }
    } else {
      if (response.validationErrors?.user_has_reviewed) {
        setErrorMessage("Ya has dejado una opinión anteriormente");
        setUserHasReviewed(true);
      } else {
        setErrorMessage(response.errorMessage || "Error al crear la opinión");
      }
    }
  };

  // Formato de fecha helper
  function getDateString(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  const isLoggedIn = user && !userLoading;
  const showForm = isLoggedIn && !userHasReviewed;

  return (
    <section className="reviews-page" style={{ background: "linear-gradient(135deg, #fff7ed, #ffe7c5)", minHeight: "100vh", paddingBottom: "3rem" }}>
      <div className="container">
        {/* ENCABEZADO DE OPINIONES */}
        <header className="reviews-header" style={{textAlign: "center", maxWidth: 700, margin: "0 auto 2.5rem"}}>
          <p className="menu-eyebrow" style={{marginBottom: 0}}>Opiniones</p>
          <h1 className="section-title">Opiniones de Clientes</h1>
          <p className="section-subtitle">Usuarios comparten su experiencia usando Dinely y reservando en nuestro restaurante.</p>
        </header>

        {/* Formulario nueva opinión */}
        {showForm ? (
          <form className="my-res-card" style={{maxWidth: 600, margin: "0 auto 2.5rem"}} onSubmit={handleSubmit}>
          <h2 style={{textAlign: "center", marginTop: 0}}>Escribe tu opinión</h2>
          <div className="form-group">
            <label htmlFor="tituloOpinion">Título (opcional)</label>
            <input
              id="tituloOpinion"
              name="title"
              type="text"
              maxLength={64}
              className="form-input"
              value={form.title}
              style={{ marginBottom: "0.7rem" }}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Un resumen de tu experiencia"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contenidoOpinion">Tu opinión</label>
            <textarea
              id="contenidoOpinion"
              name="content"
              required
              rows={3}
              maxLength={400}
              className="form-input"
              value={form.content}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Comparte los detalles de tu experiencia en Dinely"
            ></textarea>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "0.7rem", marginBottom: "0.8rem"}}>
            <span style={{marginRight: "0.3em", fontWeight: 500, fontSize: "0.97em"}}>Puntuación:</span>
            {[1,2,3,4,5].map(num => (
              <span
                key={num}
                onClick={() => handleStarClick(num)}
                style={{
                  cursor: "pointer",
                  fontSize: "1.7em",
                  color: form.score >= num ? "#FFB23F" : "#eee",
                  transition: "color 0.14s",
                  userSelect: "none"
                }}
                aria-label={`Dar ${num} estrellas`}
                title={`Dar ${num} estrellas`}
                role="button"
                tabIndex={0}
              >★</span>
            ))}
          </div>
          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Enviando..." : "Enviar opinión"}
          </button>
        </form>
        ) : !isLoggedIn ? (
          <div className="my-res-card" style={{maxWidth: 600, margin: "0 auto 2.5rem", position: "relative"}}>
            <div style={{
              filter: "blur(4px)",
              pointerEvents: "none",
              opacity: 0.6
            }}>
              <h2 style={{textAlign: "center", marginTop: 0}}>Escribe tu opinión</h2>
              <div className="form-group">
                <label htmlFor="tituloOpinion">Título (opcional)</label>
                <input
                  id="tituloOpinion"
                  name="title"
                  type="text"
                  maxLength={64}
                  className="form-input"
                  disabled
                  placeholder="Un resumen de tu experiencia"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contenidoOpinion">Tu opinión</label>
                <textarea
                  id="contenidoOpinion"
                  name="content"
                  rows={3}
                  maxLength={400}
                  className="form-input"
                  disabled
                  placeholder="Comparte los detalles de tu experiencia en Dinely"
                ></textarea>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "0.7rem", marginBottom: "0.8rem"}}>
                <span style={{marginRight: "0.3em", fontWeight: 500, fontSize: "0.97em"}}>Puntuación:</span>
                {[1,2,3,4,5].map(num => (
                  <span key={num} style={{ fontSize: "1.7em", color: "#eee" }}>★</span>
                ))}
              </div>
              <button className="btn-primary" disabled style={{ width: "100%" }}>
                Enviar opinión
              </button>
            </div>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.95)",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#1e1e1e", marginBottom: "0.5rem" }}>
                Debes iniciar sesión para dejar una opinión
              </p>
              <Link to="/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                Iniciar sesión
              </Link>
            </div>
          </div>
        ) : null}

        {/* GRID DE REVIEWS */}
        {reviewsLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Cargando opiniones...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>No hay opiniones aún. ¡Sé el primero en compartir tu experiencia!</p>
          </div>
        ) : (
          <div className="features-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 350px))", justifyContent: "center" }}>
            {reviews.map(review => (
              <article className="feature-card" key={review.id}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.3rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>{review.user?.name || "Usuario"}</span>
                  <span style={{ fontSize: "0.90rem", color: "#888" }}>{getDateString(review.created_at)}</span>
                {review.score && (
                  <span style={{
                    background: "#ffe9c7",
                    color: "#a3611a",
                    borderRadius: "999px",
                    padding: "0.18em 0.85em",
                    fontWeight: 600,
                    fontSize: "0.81rem",
                    marginLeft: "0.65em"
                  }}>{"★".repeat(review.score)}{"☆".repeat(5-review.score)}</span>
                )}
              </div>
              {review.title && (
                <div style={{ fontWeight: 600, color: "#444", margin: "0.18rem 0 0.18rem" }}>{review.title}</div>
              )}
              <div style={{ fontSize: "0.98rem", color: "#444", lineHeight: 1.4 }}>
                {review.content}
              </div>
            </article>
          ))}
          </div>
        )}

        {/* BOTÓN VOLVER AL INICIO */}
        <div className="back-home-container">
          <Link to="/" className="btn-back-home">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
