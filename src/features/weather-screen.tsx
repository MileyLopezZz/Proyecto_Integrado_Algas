"use client"

import { useState } from "react"
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Sector {
  id: string
  nombre: string
  temperatura: number
  humedad: number
  salinidad: number
  ph: number
  estado: "óptimo" | "alerta" | "crítico"
  alerta?: string
  ubicación: string
}

interface Alert {
  id: string
  tipo: "clima" | "sistema" | "advertencia"
  titulo: string
  descripción: string
  severidad: "baja" | "media" | "alta" | "crítica"
  sector: string
  hora: string
}

const temperatureData = [
  { hora: "00:00", temp: 16, meta: 18 },
  { hora: "04:00", temp: 15, meta: 18 },
  { hora: "08:00", temp: 17, meta: 18 },
  { hora: "12:00", temp: 19, meta: 18 },
  { hora: "16:00", temp: 20, meta: 18 },
  { hora: "20:00", temp: 18, meta: 18 },
  { hora: "24:00", temp: 17, meta: 18 },
]

const initialSectores: Sector[] = [
  {
    id: "sector-1",
    nombre: "Sector A - Espirulina",
    temperatura: 18.5,
    humedad: 75,
    salinidad: 32.5,
    ph: 7.2,
    estado: "óptimo",
    ubicación: "Zona Norte",
  },
  {
    id: "sector-2",
    nombre: "Sector B - Chlorella",
    temperatura: 22.1,
    humedad: 82,
    salinidad: 33.2,
    ph: 6.8,
    estado: "alerta",
    alerta: "Temperatura superior a lo esperado",
    ubicación: "Zona Centro",
  },
  {
    id: "sector-3",
    nombre: "Sector C - Nori",
    temperatura: 17.8,
    humedad: 70,
    salinidad: 32.1,
    ph: 7.4,
    estado: "óptimo",
    ubicación: "Zona Sur",
  },
]

const alertas: Alert[] = [
  {
    id: "alert-1",
    tipo: "clima",
    titulo: "Onda de Calor Esperada",
    descripción: "Se pronostica aumento de temperatura de 3-5°C en las próximas 48 horas",
    severidad: "alta",
    sector: "Sector B",
    hora: "Hace 2 horas",
  },
  {
    id: "alert-2",
    tipo: "sistema",
    titulo: "Mantenimiento de Bomba",
    descripción: "Sistema de recirculación requiere limpieza de filtros",
    severidad: "media",
    sector: "Sector A",
    hora: "Hace 4 horas",
  },
  {
    id: "alert-3",
    tipo: "advertencia",
    titulo: "Lluvia Intensa Predicha",
    descripción: "Tormentas eléctricas en el pronóstico para esta noche",
    severidad: "media",
    sector: "Zona Costera",
    hora: "Hace 1 hora",
  },
  {
    id: "alert-4",
    tipo: "clima",
    titulo: "Salinidad Anómala",
    descripción: "Reducción inesperada en niveles de salinidad - investigar posible filtración",
    severidad: "crítica",
    sector: "Sector C",
    hora: "Hace 30 minutos",
  },
]

const getSeverityColor = (severidad: string) => {
  switch (severidad) {
    case "baja":
      return "bg-blue-50 border-blue-200 text-blue-700"
    case "media":
      return "bg-yellow-50 border-yellow-200 text-yellow-700"
    case "alta":
      return "bg-orange-50 border-orange-200 text-orange-700"
    case "crítica":
      return "bg-red-50 border-red-200 text-red-700"
    default:
      return "bg-gray-50 border-gray-200 text-gray-700"
  }
}

const getStateColor = (estado: string) => {
  switch (estado) {
    case "óptimo":
      return "bg-green-100 text-green-700"
    case "alerta":
      return "bg-yellow-100 text-yellow-700"
    case "crítico":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function WeatherScreen() {
  const [sectores, setSectores] = useState<Sector[]>(initialSectores)
  const [selectedSector, setSelectedSector] = useState<Sector | null>(initialSectores[0])
  const [timeRange, setTimeRange] = useState("24h")
  const [showNewSectorModal, setShowNewSectorModal] = useState(false)
  const [newSectorForm, setNewSectorForm] = useState({
    nombre: "",
    ubicación: "",
    temperatura: 18,
    humedad: 75,
    salinidad: 32.5,
    ph: 7.2,
  })

  const handleAddSector = () => {
    if (!newSectorForm.nombre || !newSectorForm.ubicación) {
      alert("Por favor completa todos los campos")
      return
    }

    const newSector: Sector = {
      id: `sector-${Date.now()}`,
      nombre: newSectorForm.nombre,
      ubicación: newSectorForm.ubicación,
      temperatura: newSectorForm.temperatura,
      humedad: newSectorForm.humedad,
      salinidad: newSectorForm.salinidad,
      ph: newSectorForm.ph,
      estado: "óptimo",
    }

    setSectores([...sectores, newSector])
    setSelectedSector(newSector)
    setShowNewSectorModal(false)
    setNewSectorForm({
      nombre: "",
      ubicación: "",
      temperatura: 18,
      humedad: 75,
      salinidad: 32.5,
      ph: 7.2,
    })
  }

  return (
    <div className="pb-24 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-blue-700 text-white px-6 py-8 pt-12 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Clima & Meteorología
            </h1>
            <p className="text-blue-100 text-sm">Monitoreo ambiental en tiempo real</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-full text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>{sectores.length} Sectores Activos</span>
          </div>
          <div className="flex items-center gap-1 bg-red-400/20 px-3 py-2 rounded-full text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
            </svg>
            <span>2 Alertas Críticas</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* ALERTAS DESTACADAS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Alertas Importantes
            </h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              {alertas.length} alertas
            </span>
          </div>

          {alertas.map((alerta) => (
            <div key={alerta.id} className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alerta.severidad)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alerta.severidad === "crítica" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                      </svg>
                    )}
                    <h3 className="font-bold text-sm">{alerta.titulo}</h3>
                  </div>
                  <p className="text-xs opacity-85 mb-2">{alerta.descripción}</p>
                  <div className="flex items-center gap-3 text-xs opacity-70">
                    <span>{alerta.sector}</span>
                    <span>•</span>
                    <span>{alerta.hora}</span>
                  </div>
                </div>
                <button className="px-3 py-1 text-xs font-medium rounded-full hover:opacity-80 transition-opacity bg-white/50">
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* GRÁFICO DE TEMPERATURA */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Tendencia de Temperatura (24h)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Promedio vs Meta óptima</p>
            </div>
            <div className="flex gap-2">
              {["6h", "12h", "24h", "7d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    timeRange === range ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={temperatureData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="temp" stroke="#06b6d4" fill="url(#tempGradient)" strokeWidth={2} />
              <Line type="monotone" dataKey="meta" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span>Temperatura Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Meta Óptima</span>
            </div>
          </div>
        </div>

        {/* SECTORES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Estado de Sectores
            </h2>
            <button
              onClick={() => setShowNewSectorModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Nuevo Sector
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sectores.map((sector) => (
              <div
                key={sector.id}
                onClick={() => setSelectedSector(sector)}
                className={`rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                  selectedSector?.id === sector.id
                    ? "border-cyan-500 bg-cyan-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-cyan-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{sector.nombre}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {sector.ubicación}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStateColor(sector.estado)}`}>
                    {sector.estado.charAt(0).toUpperCase() + sector.estado.slice(1)}
                  </span>
                </div>

                {sector.alerta && (
                  <div className="mb-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <svg
                      className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                    </svg>
                    <p className="text-xs text-yellow-700 font-medium">{sector.alerta}</p>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground font-medium">Temp</p>
                    <p className="text-lg font-bold text-blue-700">{sector.temperatura}°C</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground font-medium">Humedad</p>
                    <p className="text-lg font-bold text-emerald-700">{sector.humedad}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground font-medium">Salinidad</p>
                    <p className="text-lg font-bold text-purple-700">{sector.salinidad}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground font-medium">pH</p>
                    <p className="text-lg font-bold text-amber-700">{sector.ph}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAPA SIMPLE (Visualización de Ubicaciones) */}
        {selectedSector && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Sector Seleccionado: {selectedSector.nombre}
            </h3>

            {/* Representación visual del sector */}
            <div className="relative w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border border-slate-300 mb-4">
              {/* Decoración de cuadrículas */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Contenedor central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl border-2 border-white/20"></div>
                  <div className="text-center text-white z-10">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.5 1.5H4.75A1.25 1.25 0 003.5 2.75v14.5a1.25 1.25 0 001.25 1.25h10.5a1.25 1.25 0 001.25-1.25V2.75a1.25 1.25 0 00-1.25-1.25zm0 14H4.75V2.75h5.75v12.75zM10.5 2.75v12.75h5v-12.75h-5z" />
                    </svg>
                    <p className="text-xs font-bold">Pool {selectedSector.nombre.split("-")[1]}</p>
                  </div>

                  {/* Indicadores ambientales */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full shadow-md flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                </div>
              </div>

              {/* Puntos de sensores */}
              <div className="absolute top-6 left-6 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute bottom-6 right-6 w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
              <div className="absolute top-1/2 right-6 w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>
            </div>

            {/* Información del sector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Rendimiento Esperado</p>
                    <p className="text-sm font-bold text-foreground">2.5 kg/día</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.757a1 1 0 01-.940 1.069 60 60 0 03-1.946.164 60 60 0 03-1.946-.164 1 1 0 01-.94-1.069v-6.757a3.066 3.066 0 002.812-3.062zM9 13a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Última Cosecha</p>
                    <p className="text-sm font-bold text-foreground">Hace 3 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showNewSectorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Agregar Nuevo Sector
              </h2>
              <button
                onClick={() => setShowNewSectorModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nombre del Sector *</label>
                <input
                  type="text"
                  placeholder="Ej: Sector D - Spirulina"
                  value={newSectorForm.nombre}
                  onChange={(e) => setNewSectorForm({ ...newSectorForm, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Ubicación *</label>
                <input
                  type="text"
                  placeholder="Ej: Zona Este"
                  value={newSectorForm.ubicación}
                  onChange={(e) => setNewSectorForm({ ...newSectorForm, ubicación: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSectorForm.temperatura}
                    onChange={(e) =>
                      setNewSectorForm({ ...newSectorForm, temperatura: Number.parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Humedad (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={newSectorForm.humedad}
                    onChange={(e) => setNewSectorForm({ ...newSectorForm, humedad: Number.parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Salinidad</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSectorForm.salinidad}
                    onChange={(e) =>
                      setNewSectorForm({ ...newSectorForm, salinidad: Number.parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSectorForm.ph}
                    onChange={(e) => setNewSectorForm({ ...newSectorForm, ph: Number.parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowNewSectorModal(false)}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-foreground bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSector}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg transition-all"
              >
                Crear Sector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
