import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const productionData = [
  { mes: "Ene", producción: 420, meta: 500 },
  { mes: "Feb", producción: 380, meta: 500 },
  { mes: "Mar", producción: 520, meta: 500 },
  { mes: "Abr", producción: 590, meta: 500 },
  { mes: "May", producción: 480, meta: 500 },
]

export default function DashboardScreen() {
  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-8 pt-12">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          ¡Bienvenido!
        </h1>
        <p className="text-primary-foreground/80 text-sm">Lunes, 4 de Noviembre 2024</p>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pedidos Activos */}
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Pedidos Activos</p>
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">24</p>
            <p className="text-xs text-primary font-medium">+3 esta semana</p>
          </div>

          {/* Producción */}
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">En Producción</p>
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">1,240 kg</p>
            <p className="text-xs text-accent font-medium">89% de capacidad</p>
          </div>

          {/* Clima */}
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Temperatura</p>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">18°C</p>
            <p className="text-xs text-blue-600 font-medium">Óptima para algas</p>
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Alertas</p>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">2</p>
            <p className="text-xs text-orange-600 font-medium">Mantenimiento cercano</p>
          </div>
        </div>

        {/* Production Chart */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Producción Mensual
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Comparativa vs. Meta</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid var(--color-border)", borderRadius: "8px" }}
              />
              <Bar dataKey="producción" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="meta" fill="var(--color-secondary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latest Orders */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Últimos Pedidos
            </h3>
            <a href="#" className="text-primary text-xs font-medium hover:underline">
              Ver todos
            </a>
          </div>
          <div className="space-y-3">
            {[
              { id: "#PED-001", cliente: "AquaFresh", estado: "En preparación", fecha: "Hoy" },
              { id: "#PED-002", cliente: "BioMarin", estado: "Procesando", fecha: "Ayer" },
              { id: "#PED-003", cliente: "OceanLife", estado: "Completado", fecha: "2 días" },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between pb-3 border-b border-border last:border-b-0"
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{order.cliente}</p>
                  <p className="text-xs text-muted-foreground">{order.id}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.estado === "Completado"
                        ? "bg-green-100 text-green-700"
                        : order.estado === "En preparación"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.estado}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{order.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
