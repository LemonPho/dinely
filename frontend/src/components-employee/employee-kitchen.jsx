import React, { useState, useEffect } from "react";
import Expand from "../util-components/Expand.jsx";
import { getKitchenBills, markPlateCooked } from "../fetch/shared";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeKitchenPage() {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      items: bill.plates?.map((billPlate, index) => ({
        id: billPlate.id || index,
        billPlateId: billPlate.id, // Keep the actual BillPlate ID for API calls
        name: billPlate.plate?.name || "",
        quantity: 1, // API doesn't have quantity per BillPlate, defaulting to 1
        price: billPlate.plate?.price || 0,
        notes: billPlate.notes || "",
        cooked: billPlate.cooked || false,
        cooked_at: billPlate.cooked_at || null,
      })) || [],
    };
  }

  // Load bills on mount
  useEffect(() => {
    async function loadBills() {
      setIsLoading(true);
      const response = await getKitchenBills();
      
      if (response.status === 200 && response.bills) {
        const transformed = response.bills.map(transformBill);
        setAccounts(transformed);
      } else {
        console.error("Error loading bills:", response.error, response.status);
        setAccounts([]);
      }
      setIsLoading(false);
    }
    
    loadBills();
  }, []);

  // Filtrar solo cuentas actuales y ordenar por fecha y hora
  const currentAccounts = accounts
    .filter(account => account.status === "current")
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  function toggleItemExpansion(itemKey) {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  }

  async function handleToggleCooked(billPlateId, currentCookedStatus) {
    const newCookedStatus = !currentCookedStatus;
    const response = await markPlateCooked(billPlateId, newCookedStatus);
    
    if (response.success) {
      // Update the local state
      setAccounts(prevAccounts => 
        prevAccounts.map(account => ({
          ...account,
          items: account.items.map(item => 
            item.billPlateId === billPlateId
              ? { ...item, cooked: response.cooked, cooked_at: response.cooked_at }
              : item
          )
        }))
      );
    } else {
      console.error("Error marking plate as cooked:", response.errorMessage);
      alert(response.errorMessage || "Error al marcar platillo");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Cocina</h1>
          <p>Platillos ordenados por cuenta</p>
        </div>
      </div>

      <div className="admin-content-card">
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Cargando pedidos...</p>
          </div>
        ) : currentAccounts.length === 0 ? (
          <p>No hay pedidos en cocina en este momento.</p>
        ) : (
          currentAccounts.map((account) => (
            <div key={account.id} style={{ marginBottom: "2.5rem" }}>
              <h3 style={{ 
                fontSize: "1.2rem", 
                fontWeight: 600, 
                color: "var(--color-primary)", 
                marginBottom: "1rem",
                paddingBottom: "0.5rem",
                borderBottom: "2px solid var(--color-primary)"
              }}>
                {account.code}
              </h3>
              <div className="admin-account-items-list">
                {account.items.map((item) => {
                  const itemKey = `${account.id}-${item.id}`;
                  const isExpanded = expandedItems.has(itemKey);
                  return (
                    <div 
                      key={itemKey} 
                      className="admin-account-item"
                      style={{ 
                        flexDirection: "column",
                        alignItems: "flex-start",
                        position: "relative",
                        opacity: item.cooked ? 0.5 : 1,
                        transition: "opacity 0.3s ease"
                      }}
                    >
                      <div style={{ 
                        display: "flex", 
                        width: "100%", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        gap: "1rem"
                      }}>
                        <div 
                          className="admin-account-item-name" 
                          style={{ 
                            width: "100%",
                            flex: 1,
                            cursor: item.notes ? "pointer" : "default"
                          }}
                          onClick={() => item.notes && toggleItemExpansion(itemKey)}
                        >
                          <span>{item.name}</span>
                          <span>x{item.quantity}</span>
                          {item.notes && (
                            <span style={{ 
                              fontSize: "0.85rem", 
                              color: "var(--color-text-soft)", 
                              fontStyle: "italic"
                            }}>
                              - {item.notes}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.billPlateId) {
                              handleToggleCooked(item.billPlateId, item.cooked);
                            }
                          }}
                          style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            backgroundColor: item.cooked ? "#10b981" : "#f3f4f6",
                            color: item.cooked ? "#ffffff" : "#374151",
                            transition: "all 0.2s ease",
                            whiteSpace: "nowrap",
                            minWidth: "120px"
                          }}
                          onMouseEnter={(e) => {
                            if (!item.cooked) {
                              e.target.style.backgroundColor = "#e5e7eb";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!item.cooked) {
                              e.target.style.backgroundColor = "#f3f4f6";
                            }
                          }}
                        >
                          {item.cooked ? "✓ Listo" : "Marcar Listo"}
                        </button>
                      </div>
                      {item.notes && (
                        <Expand expanded={isExpanded} style={{ width: "100%" }}>
                          <div style={{ 
                            marginTop: "0.75rem",
                            paddingTop: "0.75rem",
                            borderTop: "1px solid var(--color-bg)",
                            fontSize: "0.9rem",
                            color: "var(--color-text-soft)",
                            fontStyle: "italic",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            textAlign: "left",
                            width: "100%"
                          }}>
                            {item.notes}
                          </div>
                        </Expand>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


