import React from "react";
import "../styles/global.css";
import "../styles/admin.css";

export default function AdminDashboardPage() {
  // Mock data - no API calls
  const mockStats = {
    tablesOccupied: 65,
    totalTables: 20,
    currentAccounts: 3,
    currentAccountsTotal: 2480.00,
    upcomingReservations: [
      {
        id: 1,
        date: "2024-01-15",
        time: "19:00",
        partySize: 4,
        customerName: "John Doe",
        tableNumber: 5,
      },
      {
        id: 2,
        date: "2024-01-15",
        time: "19:30",
        partySize: 2,
        customerName: "Jane Smith",
        tableNumber: 12,
      },
      {
        id: 3,
        date: "2024-01-15",
        time: "20:00",
        partySize: 6,
        customerName: "Mike Johnson",
        tableNumber: 8,
      },
      {
        id: 4,
        date: "2024-01-15",
        time: "20:30",
        partySize: 3,
        customerName: "Sarah Williams",
        tableNumber: 15,
      },
    ],
  };

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
        
        doc.text(`Reservaciones Próximas: ${mockStats.upcomingReservations.length}`, 20, yPos);
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
        mockStats.upcomingReservations.forEach((reservation) => {
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
              {mockStats.upcomingReservations.length}
            </div>
            <p className="admin-stat-detail">Hoy</p>
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
        <div className="admin-reservations-list">
          {mockStats.upcomingReservations.map((reservation) => (
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
      </div>
    </div>
  );
}
