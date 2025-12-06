import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWaiterBills, getWaiterReservations } from "../fetch/shared";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  
  // Real data for bills
  const [myAccounts, setMyAccounts] = useState([]);
  const [billsLoading, setBillsLoading] = useState(true);

  // Real data for reservations
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);

  // Transform bill data from API to component format
  function transformBill(bill) {
    const dateTime = new Date(bill.date_time);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().split(' ')[0].substring(0, 5);
    
    return {
      id: bill.id,
      code: bill.code,
      tableNumber: bill.table?.code || "Sin asignar",
      waiterName: bill.waiter?.name || "",
      total: bill.total || 0,
      date: date,
      time: time,
      status: bill.state,
      items: bill.plates?.map((billPlate) => ({
        name: billPlate.plate?.name || "",
        quantity: 1,
        price: billPlate.plate?.price || 0,
        notes: billPlate.notes || "",
      })) || [],
    };
  }

  // Transform reservation data from API to component format
  function transformReservation(reservation) {
    const dateTime = new Date(reservation.date_time);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().split(' ')[0].substring(0, 5);
    
    return {
      id: reservation.id,
      code: reservation.code,
      customerName: reservation.name,
      date: date,
      time: time,
      partySize: reservation.amount_people,
      zone: reservation.table_area?.label || "",
      tableNumber: reservation.table?.code || "Sin asignar",
      status: reservation.state,
    };
  }

  // Filter bills for current state only
  function filterCurrentBills(bills) {
    return bills.filter(bill => bill.state === "current");
  }

  // Filter reservations for today and upcoming active ones
  function filterUpcomingReservations(reservations) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return reservations
      .filter(res => {
        if (res.state !== "active") return false;
        const resDate = new Date(res.date_time);
        resDate.setHours(0, 0, 0, 0);
        return resDate >= now;
      })
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
      .slice(0, 10); // Limit to 10 most upcoming
  }

  // Load all data on mount
  useEffect(() => {
    async function loadAllData() {
      setBillsLoading(true);
      setReservationsLoading(true);
      
      // Load bills
      const billsResponse = await getWaiterBills();
      setBillsLoading(false);
      
      if (billsResponse.status === 200 && billsResponse.bills) {
        const currentBills = filterCurrentBills(billsResponse.bills);
        const transformed = currentBills.map(transformBill);
        setMyAccounts(transformed);
      }
      
      // Load reservations
      const reservationsResponse = await getWaiterReservations();
      setReservationsLoading(false);
      
      if (reservationsResponse.status === 200 && reservationsResponse.reservations) {
        const upcoming = filterUpcomingReservations(reservationsResponse.reservations);
        const transformed = upcoming.map(transformReservation);
        setUpcomingReservations(transformed);
      }
    }
    
    loadAllData();
  }, []);

  function getStatusLabel(status) {
    const statusMap = {
      "current": "Actual",
      "closed": "Cerrada",
      "cancelled": "Cancelada",
    };
    return statusMap[status] || status;
  }

  function getZoneLabel(zone) {
    const zoneMap = {
      "interior": "Interior",
      "patio": "Terraza",
      "bar": "Bar",
    };
    return zoneMap[zone?.toLowerCase()] || zone || "Sin zona";
  }

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
        {billsLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Cargando cuentas...</p>
          </div>
        ) : myAccounts.length === 0 ? (
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
                    {getStatusLabel(account.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-content-card">
        <h2>Reservaciones Próximas</h2>
        {reservationsLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Cargando reservaciones...</p>
          </div>
        ) : upcomingReservations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            <p>No hay reservaciones próximas</p>
          </div>
        ) : (
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
                    Mesa {reservation.tableNumber} · Grupo de {reservation.partySize} · {getZoneLabel(reservation.zone)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

