import React, { useState } from "react";
import Expand from "../util-components/Expand.jsx";
import "../styles/global.css";
import "../styles/admin.css";

export default function EmployeeKitchenPage() {
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Mock data - cuentas con platillos (en producción vendría de una API)
  const [accounts] = useState([
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
        { id: 1, name: "Pollo a la parrilla", quantity: 2, price: 210, notes: "" },
        { id: 2, name: "Limonada natural", quantity: 2, price: 55, notes: "" },
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
        { id: 3, name: "Pasta al pesto", quantity: 2, price: 185, notes: "" },
      ],
    },
    {
      id: 3,
      code: "CTA-003",
      tableNumber: "8",
      waiterName: "cocinero1",
      total: 1260.00,
      date: "2024-01-21",
      time: "20:00",
      status: "current",
      items: [
        { id: 4, name: "Pasta al pesto", quantity: 3, price: 185, notes: "" },
        { id: 5, name: "Smoothie de fresa", quantity: 3, price: 70, notes: "" },
        { id: 6, name: "Guacamole con totopos", quantity: 1, price: 115, notes: "Sin cebolla" },
        { id: 7, name: "Guacamole con totopos", quantity: 1, price: 115, notes: "" },
      ],
    },
  ]);

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

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Cocina</h1>
          <p>Platillos ordenados por cuenta</p>
        </div>
      </div>

      <div className="admin-content-card">
        {currentAccounts.length === 0 ? (
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
                      onClick={() => item.notes && toggleItemExpansion(itemKey)}
                      style={{ 
                        cursor: item.notes ? "pointer" : "default",
                        flexDirection: "column",
                        alignItems: "flex-start"
                      }}
                    >
                      <div className="admin-account-item-name" style={{ width: "100%" }}>
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

