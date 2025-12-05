import React, { useState, useEffect } from "react";
import "../styles/global.css";
import "../styles/admin.css";
import { getReservations } from "../fetch/admin.jsx";

export default function AdminDashboardPage() {
  // Mock data for stats - keeping as requested
  const mockStats = {
    tablesOccupied: 65,
    totalTables: 20,
    currentAccounts: 3,
    currentAccountsTotal: 2480.00,
  };

  // Real data for reservations
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);

  // Transform reservation data from API to component format
  function transformReservation(reservation) {
    const dateTime = new Date(reservation.date_time);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().split(' ')[0].substring(0, 5);
    
    return {
      id: reservation.id,
      date: date,
      time: time,
      partySize: reservation.amount_people,
      customerName: reservation.name,
      tableNumber: reservation.table?.code || "Sin asignar",
    };
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

  // Load reservations on mount
  useEffect(() => {
    async function loadReservations() {
      setReservationsLoading(true);
      const response = await getReservations();
      setReservationsLoading(false);
      
      if (response.error || response.status === 500) {
        console.error("Error loading reservations");
        return;
      }
      
      if (response.status === 200 && response.reservations) {
        const upcoming = filterUpcomingReservations(response.reservations);
        const transformed = upcoming.map(transformReservation);
        setUpcomingReservations(transformed);
      }
    }
    
    loadReservations();
  }, []);

  const occupiedPercentage = Math.round(
    (mockStats.tablesOccupied / mockStats.totalTables) * 100
  );

  function generateOccupancyReport() {
    try {
      // Intentar importar jsPDF dinámicamente
      import("jspdf").then(({ jsPDF }) => {
        const doc = new jsPDF();
        
        const today = new Date().toLocaleDateString("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Título
        doc.setFontSize(20);
        doc.text("Reporte de Ocupación", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.text(`Fecha: ${today}`, 105, 30, { align: "center" });
        
        // Información de ocupación
        doc.setFontSize(14);
        doc.text("Resumen de Ocupación", 20, 45);
        
        doc.setFontSize(11);
        let yPos = 55;
        
        doc.text(`Mesas Ocupadas: ${mockStats.tablesOccupied} de ${mockStats.totalTables} (${occupiedPercentage}%)`, 20, yPos);
        yPos += 10;
        
        doc.text(`Reservaciones Próximas: ${upcomingReservations.length}`, 20, yPos);
        yPos += 10;
        
        doc.text(`Cuentas Actuales: ${mockStats.currentAccounts}`, 20, yPos);
        yPos += 10;
        
        doc.text(`Total en Cuentas Actuales: $${mockStats.currentAccountsTotal.toFixed(2)} MXN`, 20, yPos);
        yPos += 15;
        
        // Detalles de reservaciones
        doc.setFontSize(14);
        doc.text("Reservaciones Próximas", 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        upcomingReservations.forEach((reservation) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(
            `${reservation.time} - ${reservation.customerName} - Mesa ${reservation.tableNumber} (${reservation.partySize} personas)`,
            20,
            yPos
          );
          yPos += 8;
        });
        
        // Guardar el PDF
        doc.save(`reporte-ocupacion-${new Date().toISOString().split("T")[0]}.pdf`);
      }).catch(() => {
        // Si jsPDF no está instalado, usar window.print como fallback
        alert("Para generar PDFs, instala jsPDF: npm install jspdf\n\nUsando impresión del navegador como alternativa...");
        window.print();
      });
    } catch (error) {
      // Fallback: usar window.print
      alert("Error al generar PDF. Usando impresión del navegador...");
      window.print();
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-top">
          <div>
            <h1>Panel</h1>
            <p>Vista rápida de las operaciones del restaurante</p>
          </div>
          <button
            className="admin-btn-primary"
            onClick={generateOccupancyReport}
          >
            Generar Reporte de Ocupación (PDF)
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"></div>
          <div className="admin-stat-content">
            <h3>Mesas Ocupadas</h3>
            <div className="admin-stat-value">
              {occupiedPercentage}%
            </div>
            <p className="admin-stat-detail">
              {mockStats.tablesOccupied} de {mockStats.totalTables} mesas
            </p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon"></div>
          <div className="admin-stat-content">
            <h3>Reservaciones Próximas</h3>
            <div className="admin-stat-value">
              {reservationsLoading ? "..." : upcomingReservations.length}
            </div>
            <p className="admin-stat-detail">Próximas</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon"></div>
          <div className="admin-stat-content">
            <h3>Cuentas Actuales</h3>
            <div className="admin-stat-value">
              {mockStats.currentAccounts}
            </div>
            <p className="admin-stat-detail">
              ${mockStats.currentAccountsTotal.toFixed(2)} MXN total
            </p>
          </div>
        </div>
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
                    Mesa {reservation.tableNumber} · Grupo de {reservation.partySize}
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
