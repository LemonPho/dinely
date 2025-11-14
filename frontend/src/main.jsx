import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reserva from "./components/reservation.jsx";
import Menu from "./components/menu.jsx";        // Página de Menú
import Ubicacion from "./components/location.jsx"; // Nueva página Ubicación
import MisReservas from "./components/reservations.jsx";
import Login from "./components/login.jsx";
import Layout from "./components/layout.jsx";
import MainPage from "./components/main-page.jsx";

import "./styles/global.css";
import { ProveedorMensajesContexto } from "./application-context/messages-context.jsx";
import { AuthenticationProvider } from "./application-context/authentication-context.jsx";
import { UserContextProvider } from "./application-context/user-context.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProveedorMensajesContexto>
      <AuthenticationProvider>
        <UserContextProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<MainPage />} />
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