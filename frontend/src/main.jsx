import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reserva from "./components-user/reservation.jsx";
import Menu from "./components-user/menu.jsx";        // Página de Menú
import Ubicacion from "./components-user/location.jsx"; // Nueva página Ubicación
import MisReservas from "./components-user/reservations.jsx";
import Login from "./components-user/login.jsx";
import SetPassword from "./components-user/set-password.jsx";
import Layout from "./components-user/layout.jsx";
import MainPage from "./components-user/main-page.jsx";
import AdminDashboard from "./components-admin/admin-dashboard.jsx";
import AdminLayout from "./components-admin/admin-layout.jsx";
import AdminTables from "./components-admin/admin-tables.jsx";
import AdminPlates from "./components-admin/admin-plates.jsx";
import AdminUsers from "./components-admin/admin-users.jsx";
import AdminReservations from "./components-admin/admin-reservations.jsx";
import AdminAccounts from "./components-admin/admin-accounts.jsx";
import EmployeeLayout from "./components-employee/employee-layout.jsx";
import EmployeeDashboard from "./components-employee/employee-dashboard.jsx";
import EmployeeAccount from "./components-employee/employee-account.jsx";
import EmployeeTables from "./components-employee/employee-tables.jsx";
import EmployeeKitchen from "./components-employee/employee-kitchen.jsx";
import ReviewsPage from "./components-user/reviews.jsx";

// Admin navigation configuration
export const adminNavItems = [
  { path: "/admin", label: "Panel" },
  { path: "/admin/tables", label: "Mesas" },
  { path: "/admin/plates", label: "Platillos" },
  { path: "/admin/users", label: "Usuarios" },
  { path: "/admin/reservations", label: "Reservaciones" },
  { path: "/admin/accounts", label: "Cuentas" },
];

// Employee navigation configuration
export const employeeNavItems = [
  { path: "/empleado", label: "Panel" },
  { path: "/empleado/mesas", label: "Mesas Disponibles" },
  { path: "/empleado/cocina", label: "Cocina" },
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
        <UserContextProvider>
          <AuthenticationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="" element={<Layout />}>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/reserva" element={<Reserva />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/ubicacion" element={<Ubicacion />} />
                  <Route path="/mis-reservas" element={<MisReservas />} />
                  <Route path="/opiniones" element={<ReviewsPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/set-password/:uid/:token" element={<SetPassword />} />
                </Route>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/tables" element={<AdminTables />} />
                  <Route path="/admin/plates" element={<AdminPlates />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/reservations" element={<AdminReservations />} />
                  <Route path="/admin/accounts" element={<AdminAccounts />} />
                </Route>
                <Route path="/empleado" element={<EmployeeLayout />}>
                  <Route path="/empleado" element={<EmployeeDashboard />} />
                  <Route path="/empleado/mesas" element={<EmployeeTables />} />
                  <Route path="/empleado/cocina" element={<EmployeeKitchen />} />
                  <Route path="/empleado/cuenta/:id" element={<EmployeeAccount />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthenticationProvider>
        </UserContextProvider>
      </OpenersProvider>
    </MessagesProvider>
  </React.StrictMode>
);