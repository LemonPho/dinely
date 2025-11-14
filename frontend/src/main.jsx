import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reserva from "./components-user/reservation.jsx";
import Menu from "./components-user/menu.jsx";        // Página de Menú
import Ubicacion from "./components-user/location.jsx"; // Nueva página Ubicación
import MisReservas from "./components-user/reservations.jsx";
import Login from "./components-user/login.jsx";
import Layout from "./components-user/layout.jsx";
import MainPage from "./components-user/main-page.jsx";
import AdminDashboard from "./components-admin/admin-dashboard.jsx";
import AdminLayout from "./components-admin/admin-layout.jsx";
import AdminTables from "./components-admin/admin-tables.jsx";
import AdminPlates from "./components-admin/admin-plates.jsx";
import AdminUsers from "./components-admin/admin-users.jsx";
import AdminReservations from "./components-admin/admin-reservations.jsx";
import AdminAccounts from "./components-admin/admin-accounts.jsx";

// Admin navigation configuration
export const adminNavItems = [
  { path: "/admin", label: "Panel" },
  { path: "/admin/tables", label: "Mesas" },
  { path: "/admin/plates", label: "Platillos" },
  { path: "/admin/users", label: "Usuarios" },
  { path: "/admin/reservations", label: "Reservaciones" },
  { path: "/admin/accounts", label: "Cuentas" },
];

import "./styles/global.css";
import { MessagesProvider } from "./application-context/messages-context.jsx";
import { AuthenticationProvider } from "./application-context/authentication-context.jsx";
import { UserContextProvider } from "./application-context/user-context.jsx";
import { OpenersProvider } from "./application-context/openers-context.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MessagesProvider>
      <OpenersProvider>
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
                  <Route path="/admin/tables" element={<AdminTables />} />
                  <Route path="/admin/plates" element={<AdminPlates />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/reservations" element={<AdminReservations />} />
                  <Route path="/admin/accounts" element={<AdminAccounts />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </UserContextProvider>
        </AuthenticationProvider>
      </OpenersProvider>
    </MessagesProvider>
  </React.StrictMode>
);