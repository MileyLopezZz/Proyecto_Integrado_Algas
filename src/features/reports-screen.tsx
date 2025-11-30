"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const productionBySpecies = [
  { nombre: "Spirulina", valor: 4200, porcentaje: 42 },
  { nombre: "Nori", valor: 2100, porcentaje: 21 },
  { nombre: "Wakame", valor: 2000, porcentaje: 20 },
  { nombre: "Chlorella", valor: 1700, porcentaje: 17 },
]

const performanceData = [
  { mes: "Enero", meta: 100, real: 84 },
  { mes: "Febrero", meta: 100, real: 76 },
  { mes: "Marzo", meta: 100, real: 104 },
  { mes: "Abril", meta: 100, real: 118 },
  { mes: "Mayo", meta: 100, real: 96 },
  { mes: "Junio", meta: 100, real: 108 },
]

const COLORS = ["#3FA77A", "#A8E6CF", "#2D6A4F", "#52B788"]

export default function ReportsScreen() {
  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-8 pt-12">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Reportes
        </h1>
        <p className="text-primary-foreground/80 text-sm">Análisis y Métricas de Producción</p>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Export Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 py-3 px-4 bg-white border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-all flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            PDF
          </button>
          <button className="flex-1 py-3 px-4 bg-white border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-all flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Excel
          </button>
        </div>

        {/* Production by Species */}
        <div className="bg-white rounded-2xl border border-border p-5 overflow-hidden">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Producción por Especie
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={productionBySpecies}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, porcentaje }) => `${nombre} ${porcentaje}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {productionBySpecies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} kg`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {productionBySpecies.map((specie, idx) => (
              <div key={specie.nombre} className="p-3 bg-background rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <p className="text-sm font-medium">{specie.nombre}</p>
                </div>
                <p className="text-lg font-bold text-foreground">{specie.valor} kg</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance vs Meta */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Rendimiento vs. Meta (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid var(--color-border)", borderRadius: "8px" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="meta"
                stroke="var(--color-secondary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-secondary)" }}
                name="Meta"
              />
              <Line
                type="monotone"
                dataKey="real"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)" }}
                name="Real"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Métricas Clave
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Producción Total</p>
              <p className="text-2xl font-bold text-primary">10K kg</p>
              <p className="text-xs text-green-600 mt-1">+12% vs mes anterior</p>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Eficiencia</p>
              <p className="text-2xl font-bold text-accent">96.8%</p>
              <p className="text-xs text-green-600 mt-1">Óptimo</p>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Calidad</p>
              <p className="text-2xl font-bold text-blue-600">98.2%</p>
              <p className="text-xs text-green-600 mt-1">Excelente</p>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Cumplimiento</p>
              <p className="text-2xl font-bold text-purple-600">100%</p>
              <p className="text-xs text-green-600 mt-1">A tiempo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
