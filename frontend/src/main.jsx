import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reserva from "./components-user/reservation.jsx";
import Menu from "./components-user/menu.js";        // Página de Menú
import Ubicacion from "./components-user/location.js"; // Nueva página Ubicación
import MisReservas from "./components-user/reservations.jsx";
import Login from "./components-user/login.jsx";
import Layout from "./components-user/layout.js";
import MainPage from "./components-user/main-page.jsx";
import AdminDashboard from "./components-admin/admin-dashboard.jsx";

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
              <Route path="" element={<Layout />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/reserva" element={<Reserva />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/ubicacion" element={<Ubicacion />} />
                <Route path="/mis-reservas" element={<MisReservas />} />
                <Route path="/login" element={<Login />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserContextProvider>
      </AuthenticationProvider>
    </ProveedorMensajesContexto>
  </React.StrictMode>
);