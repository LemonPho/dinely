import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  
  // Mock data - empleado actual (en producción vendría del contexto de autenticación)
  const currentEmployee = "mesero1";

  // Mock data - cuentas actuales asignadas al empleado
  const [myAccounts] = useState([
    {
      id: 1,
      code: "CTA-001",
      tableNumber: "5",
      waiterName: "mesero1",
      total: 850.00,
      date: "2024-01-20",
      time: "19:00",
      status: "current",
      items: [
        { name: "Pollo a la parrilla", quantity: 2, price: 210 },
        { name: "Limonada natural", quantity: 2, price: 55 },
      ],
    },
    {
      id: 5,
      code: "CTA-005",
      tableNumber: "3",
      waiterName: "mesero1",
      total: 370.00,
      date: "2024-01-22",
      time: "21:00",
      status: "current",
      items: [
        { name: "Pasta al pesto", quantity: 2, price: 185 },
      ],
    },
  ]);

  // Mock data - reservaciones próximas (todas)
  const [upcomingReservations] = useState([
    {
      id: 1,
      code: "DIN-ABC123",
      customerName: "Juan Pérez",
      date: "2024-01-20",
      time: "19:00",
      partySize: 4,
      zone: "interior",
      tableNumber: "5",
      status: "active",
    },
    {
      id: 2,
      code: "DIN-XYZ789",
      customerName: "María García",
      date: "2024-01-20",
      time: "19:30",
      partySize: 2,
      zone: "patio",
      tableNumber: "12",
      status: "active",
    },
    {
      id: 3,
      code: "DIN-DEF456",
      customerName: "Carlos López",
      date: "2024-01-21",
      time: "20:00",
      partySize: 6,
      zone: "interior",
      tableNumber: "8",
      status: "active",
    },
  ]);

  function handleAccountClick(account) {
    navigate(`/empleado/cuenta/${account.id}`);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Panel de Empleado</h1>
          <p>Gestión de cuentas y reservaciones</p>
        </div>
      </div>

      <div className="admin-content-card">
        <h2>Mis Cuentas Actuales</h2>
        {myAccounts.length === 0 ? (
          <p>No tienes cuentas asignadas en este momento.</p>
        ) : (
          <div className="admin-reservations-list-vertical">
            {myAccounts.map((account) => (
              <div
                key={account.id}
                className="admin-reservation-row-item"
                onClick={() => handleAccountClick(account)}
                style={{ cursor: "pointer" }}
              >
                <div className="admin-reservation-row-left">
                  <span className="admin-reservation-row-code">{account.code}</span>
                  <h3>Mesa {account.tableNumber}</h3>
                  <span className="admin-reservation-row-info">
                    {account.date} · {account.time} · Total: ${account.total.toFixed(2)} MXN · {account.items.length} items
                  </span>
                </div>
                <div className="admin-reservation-row-right">
                  <span className="admin-table-status status-in-progress">
                    Actual
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-content-card">
        <h2>Reservaciones Próximas</h2>
        <div className="admin-reservations-list">
          {upcomingReservations.map((reservation) => (
            <div key={reservation.id} className="admin-reservation-item">
              <div className="admin-reservation-time">
                <span className="admin-reservation-hour">{reservation.time}</span>
                <span className="admin-reservation-date">{reservation.date}</span>
              </div>
              <div className="admin-reservation-details">
                <div className="admin-reservation-name">{reservation.customerName}</div>
                <div className="admin-reservation-info">
                  Mesa {reservation.tableNumber} · Grupo de {reservation.partySize} · {reservation.zone === "interior" ? "Interior" : reservation.zone === "patio" ? "Terraza" : "Bar"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

