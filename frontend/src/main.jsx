import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reserva from "./pages/reserva.jsx";
import Menu from "./pages/menu.jsx";        // Página de Menú
import Ubicacion from "./pages/ubicacion.jsx"; // Nueva página Ubicación
import MisReservas from "./pages/mis-reservas.jsx";
import Login from "./pages/login.jsx";
import Principal from "./pages/principal.jsx";
import Layout from "./components/Layout.jsx";

import "./styles/global.css";
import { ProveedorMensajesContexto } from "./application-context/contexto-mensajes.jsx";
import { AuthenticationProvider } from "./application-context/contexto-autenticacion.jsx";
import { UserContextProvider } from "./application-context/contexto-usuario.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProveedorMensajesContexto>
      <AuthenticationProvider>
        <UserContextProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Principal />} />
                <Route path="/reserva" element={<Reserva />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/ubicacion" element={<Ubicacion />} />
                <Route path="/mis-reservas" element={<MisReservas />} />
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserContextProvider>
      </AuthenticationProvider>
    </ProveedorMensajesContexto>
  </React.StrictMode>
);