import { Link } from "react-router-dom";
import "../styles/global.css";

// 👇 ajusta los nombres si tus archivos tienen otro nombre
import guacamoleImg from "../assets/menu/guacamole.jpg";
import polloImg from "../assets/menu/pollo.jpg";
import limonadaImg from "../assets/menu/limonada.jpg";

function Menu() {
  return (
    <div className="app-root">
      <main>
        <section className="menu-page">
          <div className="container">
            {/* ENCABEZADO GENERAL */}
            <header className="menu-header">
              <p className="menu-eyebrow">Menú Dinely</p>
              <h1>Elige qué se te antoja hoy</h1>
              <p>
                Te presentamos una selección de entradas, platos fuertes y
                bebidas, pensada para que tu visita a Dinely sea completa de
                principio a fin.
              </p>
            </header>

            {/* ENTRADA */}
            <section className="menu-row">
              <div className="menu-info">
                <p className="menu-label entrada">Entrada</p>
                <h2>Para abrir el apetito</h2>
                <ul className="menu-list">
                  <li>
                    <span>Guacamole con totopos</span>
                    <span>$115 MXN</span>
                  </li>
                  <li>
                    <span>Papas fritas con cheddar</span>
                    <span>$120 MXN</span>
                  </li>
                  <li>
                    <span>Bruschettas con jitomate y albahaca</span>
                    <span>$130 MXN</span>
                  </li>
                </ul>
              </div>

              <div className="menu-illustration">
                <img
                  src={guacamoleImg}
                  alt="Guacamole con totopos"
                  className="menu-image"
                />
              </div>
            </section>

            {/* COMIDA */}
            <section className="menu-row menu-row-reverse">
              <div className="menu-info">
                <p className="menu-label comida">Comida</p>
                <h2>El plato fuerte de tu visita</h2>
                <ul className="menu-list">
                  <li>
                    <span>Pollo a la parrilla con verduras</span>
                    <span>$210 MXN</span>
                  </li>
                  <li>
                    <span>Hamburguesa gourmet Dinely</span>
                    <span>$190 MXN</span>
                  </li>
                  <li>
                    <span>Pasta al pesto</span>
                    <span>$185 MXN</span>
                  </li>
                </ul>
              </div>

              <div className="menu-illustration">
                <img
                  src={polloImg}
                  alt="Pollo a la parrilla con verduras"
                  className="menu-image"
                />
              </div>
            </section>

            {/* BEBIDA */}
            <section className="menu-row">
              <div className="menu-info">
                <p className="menu-label bebida">Bebida</p>
                <h2>Para acompañar cada bocado</h2>
                <ul className="menu-list">
                  <li>
                    <span>Limonada natural</span>
                    <span>$55 MXN</span>
                  </li>
                  <li>
                    <span>Smoothie de fresa</span>
                    <span>$70 MXN</span>
                  </li>
                  <li>
                    <span>Café latte</span>
                    <span>$60 MXN</span>
                  </li>
                </ul>
              </div>

              <div className="menu-illustration">
                <img
                  src={limonadaImg}
                  alt="Limonada natural"
                  className="menu-image"
                />
              </div>
            </section>
          </div>
        </section>

        {/* BOTÓN VOLVER AL INICIO */}
        <div className="back-home-container">
          <Link to="/" className="btn-back-home">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Menu;
