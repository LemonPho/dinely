import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWaiterBills } from "../fetch/shared";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeBillsPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBills() {
      setIsLoading(true);
      const response = await getWaiterBills();
      if (response.status === 200 && response.bills) {
        // Transform API response to match component's expected structure
        const transformedBills = response.bills.map((bill) => {
          const dateTime = new Date(bill.date_time);
          const date = dateTime.toISOString().split('T')[0];
          const time = dateTime.toTimeString().split(' ')[0].slice(0, 5);
          
          return {
            id: bill.id,
            code: bill.code,
            tableNumber: bill.table?.code || "",
            waiterName: bill.waiter?.name || "",
            total: bill.total,
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
        });
        setBills(transformedBills);
      } else {
        console.error("Failed to fetch bills:", response.error, response.status);
        setBills([]);
      }
      setIsLoading(false);
    }
    fetchBills();
  }, []);

  function handleBillClick(bill) {
    navigate(`/empleado/cuenta/${bill.id}`);
  }

  function getStatusLabel(status) {
    const statusMap = {
      "current": "En curso",
      "closed": "Cerrada",
      "cancelled": "Cancelada",
    };
    return statusMap[status] || status;
  }

  function getStatusClass(status) {
    const classMap = {
      "current": "status-in-progress",
      "closed": "status-completed",
      "cancelled": "status-cancelled",
    };
    return classMap[status] || "";
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Mis Cuentas</h1>
          <p>Gestiona tus cuentas actuales</p>
        </div>
      </div>

      <div className="admin-content-card">
        {isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Cargando cuentas...</p>
          </div>
        ) : bills.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>No tienes cuentas asignadas en este momento.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {bills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => handleBillClick(bill)}
                style={{
                  padding: "1.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor: "var(--color-bg)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  marginBottom: "1rem"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 600 }}>
                      {bill.code}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-soft)" }}>
                      Mesa {bill.tableNumber || "N/A"}
                    </p>
                  </div>
                  <span className={`admin-table-status ${getStatusClass(bill.status)}`}>
                    {getStatusLabel(bill.status)}
                  </span>
                </div>
                
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text-soft)" }}>Fecha:</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{bill.date} {bill.time}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text-soft)" }}>Items:</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{bill.items.length}</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    marginTop: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border)"
                  }}>
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>Total:</span>
                    <span style={{ 
                      fontSize: "1.2rem", 
                      fontWeight: 700, 
                      color: "var(--color-primary)" 
                    }}>
                      ${bill.total.toFixed(2)} MXN
                    </span>
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
