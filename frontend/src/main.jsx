<<<<<<< Updated upstream
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthenticationProvider } from './application-context/AuthenticationContext.jsx'
import { MessagesContextProvider } from './application-context/MessagesContext.jsx'
import { UserContextProvider } from './application-context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MessagesContextProvider>
      <AuthenticationProvider>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </AuthenticationProvider>
    </MessagesContextProvider>
  </StrictMode>,
)
=======
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";                // Inicio
import Reserva from "./pages/Reserva.jsx";  // Página de Reservas
import Menu from "./pages/menu.jsx";        // Página de Menú
import Ubicacion from "./pages/ubicacion.jsx"; // Nueva página Ubicación
import MisReservas from "./pages/misreservas.jsx";
import Login from "./pages/login.jsx";



import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/ubicacion" element={<Ubicacion />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

>>>>>>> Stashed changes
