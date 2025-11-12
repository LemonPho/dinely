import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reserva from "./pages/reserva.jsx";
import Menu from "./pages/menu.jsx";        // Página de Menú
import Ubicacion from "./pages/ubicacion.jsx"; // Nueva página Ubicación
import MisReservas from "./pages/mis-reservas.jsx";
import Login from "./pages/login.jsx";
import Principal from "./pages/principal.jsx";



import "./styles/global.css";
import { MessagesContextProvider } from "./application-context/contexto-mensajes.jsx";
import { AuthenticationProvider } from "./application-context/contexto-authenticacion.jsx";
import { UserContextProvider } from "./application-context/contexto-usuario.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MessagesContextProvider>
      <AuthenticationProvider>
        <UserContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Principal />} />
              <Route path="/reserva" element={<Reserva />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/ubicacion" element={<Ubicacion />} />
              <Route path="/mis-reservas" element={<MisReservas />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </UserContextProvider>
      </AuthenticationProvider>
    </MessagesContextProvider>
  </React.StrictMode>
);