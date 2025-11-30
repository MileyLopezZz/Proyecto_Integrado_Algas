"use client"

import { useState } from "react"

interface Order {
  id: string
  cliente: string
  producto: string
  cantidad: string
  estado: "pendiente" | "procesando" | "preparación" | "completado"
  fecha: string
  fechaEntrega: string
}

const mockOrders: Order[] = [
  {
    id: "#PED-001",
    cliente: "AquaFresh Inc.",
    producto: "Spirulina Premium",
    cantidad: "500 kg",
    estado: "procesando",
    fecha: "2024-11-01",
    fechaEntrega: "2024-11-15",
  },
  {
    id: "#PED-002",
    cliente: "BioMarin Corp",
    producto: "Nori Orgánica",
    cantidad: "300 kg",
    estado: "preparación",
    fecha: "2024-11-02",
    fechaEntrega: "2024-11-16",
  },
  {
    id: "#PED-003",
    cliente: "OceanLife Ltd",
    producto: "Wakame Premium",
    cantidad: "400 kg",
    estado: "completado",
    fecha: "2024-10-28",
    fechaEntrega: "2024-11-04",
  },
  {
    id: "#PED-004",
    cliente: "SeaHealth",
    producto: "Chlorella Pura",
    cantidad: "250 kg",
    estado: "pendiente",
    fecha: "2024-11-03",
    fechaEntrega: "2024-11-18",
  },
]

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "completado":
      return "bg-green-100 text-green-700"
    case "preparación":
      return "bg-blue-100 text-blue-700"
    case "procesando":
      return "bg-yellow-100 text-yellow-700"
    case "pendiente":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function OrdersScreen() {
  const [filter, setFilter] = useState<"todos" | "pendiente" | "procesando" | "preparación" | "completado">("todos")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = filter === "todos" ? mockOrders : mockOrders.filter((order) => order.estado === filter)

  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-8 pt-12">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Gestión de Pedidos
        </h1>
        <p className="text-primary-foreground/80 text-sm">
          {filteredOrders.length} pedido{filteredOrders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Action Buttons */}
        <button className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Pedido
        </button>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["todos", "pendiente", "procesando", "preparación", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-border text-foreground hover:border-primary"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-lg border border-border p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold text-foreground">{order.cliente}</p>
                  <p className="text-xs text-muted-foreground">{order.id}</p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(order.estado)}`}
                >
                  {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">{order.producto}</p>
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>{order.cantidad}</span>
                  <span>Entrega: {new Date(order.fechaEntrega).toLocaleDateString("es-ES")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
            <div className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  Detalles del Pedido
                </h2>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Número de Pedido</p>
                  <p className="font-bold text-lg">{selectedOrder.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                    <p className="font-semibold">{selectedOrder.cliente}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Estado</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedOrder.estado)}`}
                    >
                      {selectedOrder.estado.charAt(0).toUpperCase() + selectedOrder.estado.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="bg-background p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Producto</p>
                  <p className="font-semibold text-lg">{selectedOrder.producto}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Cantidad</p>
                    <p className="font-bold text-xl">{selectedOrder.cantidad}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Fecha Pedido</p>
                    <p className="font-semibold">{new Date(selectedOrder.fecha).toLocaleDateString("es-ES")}</p>
                  </div>
                </div>

                <div className="bg-background p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Fecha Entrega</p>
                  <p className="font-bold text-lg">
                    {new Date(selectedOrder.fechaEntrega).toLocaleDateString("es-ES")}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all">
                    Editar Pedido
                  </button>
                  <button className="flex-1 py-3 px-4 border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
