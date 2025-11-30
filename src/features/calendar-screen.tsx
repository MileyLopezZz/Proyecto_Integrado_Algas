"use client"

import { useState } from "react"

interface Event {
  dia: number
  mes: number
  etapa: "siembra" | "crecimiento" | "cosecha" | "procesamiento"
  detalles: string
  alerta?: string
}

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"]
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const monthDays: Event[] = [
  { dia: 1, mes: 10, etapa: "siembra", detalles: "Siembra Lote A", alerta: null },
  { dia: 2, mes: 10, etapa: "siembra", detalles: "Siembra Lote B", alerta: null },
  { dia: 5, mes: 10, etapa: "crecimiento", detalles: "Monitoreo Lote A", alerta: null },
  { dia: 8, mes: 10, etapa: "crecimiento", detalles: "Revisión Químicos", alerta: "clima" },
  { dia: 12, mes: 10, etapa: "cosecha", detalles: "Cosecha Lote A", alerta: null },
  { dia: 15, mes: 10, etapa: "procesamiento", detalles: "Secado Batch 1", alerta: null },
  { dia: 18, mes: 10, etapa: "crecimiento", detalles: "Mantenimiento", alerta: "retraso" },
  { dia: 22, mes: 10, etapa: "cosecha", detalles: "Cosecha Lote B", alerta: null },
  { dia: 28, mes: 10, etapa: "procesamiento", detalles: "Empaque Final", alerta: null },
]

const getEtapaColor = (etapa: string) => {
  switch (etapa) {
    case "siembra":
      return "bg-green-100 text-green-700 border-green-300"
    case "crecimiento":
      return "bg-blue-100 text-blue-700 border-blue-300"
    case "cosecha":
      return "bg-orange-100 text-orange-700 border-orange-300"
    case "procesamiento":
      return "bg-purple-100 text-purple-700 border-purple-300"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function CalendarScreen() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    dia: 1,
    mes: 10,
    etapa: "siembra" as const,
    detalles: "",
  })
  const [events, setEvents] = useState(monthDays)

  const handleAddEvent = () => {
    if (newEvent.detalles.trim()) {
      setEvents([...events, { ...newEvent, alerta: null }])
      setNewEvent({ dia: 1, mes: 10, etapa: "siembra", detalles: "" })
      setShowAddEventModal(false)
    }
  }

  return (
    <div className="pb-24 bg-background min-h-screen flex flex-col">
      {/* Header with Action Buttons */}
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-4 pt-12 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Calendario de Producción
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              {isExpandedView ? "Vista Anual - Todos los Meses" : "Noviembre 2024 - Vista Completa"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsExpandedView(!isExpandedView)}
            className="px-4 py-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded-lg font-semibold text-sm transition-colors"
          >
            {isExpandedView ? "Vista Mes" : "Ver Año"}
          </button>
          <button
            onClick={() => setShowAddEventModal(true)}
            className="px-4 py-2 bg-white text-primary hover:bg-primary-foreground/10 rounded-lg font-semibold text-sm transition-colors"
          >
            + Nuevo Evento
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
        {/* Legend - Compact at top */}
        <div className="bg-white rounded-xl border border-border p-3 mb-3 flex-shrink-0">
          <div className="grid grid-cols-4 gap-2">
            {[
              { etapa: "siembra", label: "Siembra", color: "bg-green-100" },
              { etapa: "crecimiento", label: "Crec.", color: "bg-blue-100" },
              { etapa: "cosecha", label: "Cosecha", color: "bg-orange-100" },
              { etapa: "procesamiento", label: "Proc.", color: "bg-purple-100" },
            ].map(({ etapa, label, color }) => (
              <div key={etapa} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${color}`} />
                <span className="text-xs font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {isExpandedView ? (
          // Year View - All Months
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
            {months.map((month, monthIdx) => (
              <div key={month} className="bg-white rounded-xl border border-border p-3">
                <h3 className="font-bold text-sm mb-2 text-foreground">{month}</h3>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center">
                      <p className="text-xs font-semibold text-muted-foreground">{day}</p>
                    </div>
                  ))}
                  {Array.from({ length: 28 }).map((_, dayIdx) => {
                    const dayNum = dayIdx + 1
                    const event = events.find((e) => e.dia === dayNum && e.mes === monthIdx)
                    return (
                      <div
                        key={dayNum}
                        className={`p-1 text-center rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          event ? getEtapaColor(event.etapa) : "bg-background text-foreground/50"
                        } hover:shadow-md`}
                        onClick={() => event && setSelectedEvent(event)}
                      >
                        {dayNum}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Monthly View
          <div className="bg-white rounded-2xl border border-border overflow-hidden flex-1 flex flex-col">
            {/* Days Header */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0">
              {weekDays.map((day, idx) => (
                <div key={day} className="p-3 text-center border-b border-border">
                  <p className="text-sm font-bold text-foreground">{day}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{4 + idx}</p>
                </div>
              ))}
            </div>

            {/* Events Grid - Expanded */}
            <div className="grid grid-cols-7 gap-0 flex-1">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dayNum = 4 + dayIdx
                const event = events.find((e) => e.dia === dayNum && e.mes === 10)
                return (
                  <div
                    key={dayNum}
                    className="border-r border-b border-border p-2 bg-white hover:bg-background/80 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-32"
                    onClick={() => event && setSelectedEvent(event)}
                  >
                    {event && (
                      <div className="w-full space-y-2">
                        <div
                          className={`w-full p-2.5 rounded-xl text-xs font-bold border-2 ${getEtapaColor(event.etapa)} cursor-pointer hover:shadow-lg transition-all text-center`}
                        >
                          <p className="font-bold line-clamp-2">{event.detalles}</p>
                        </div>
                        {event.alerta && (
                          <div className="w-full px-1.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1">
                            <span>⚠</span>
                            <span className="line-clamp-1">{event.alerta}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Próximos Eventos
        </h3>
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <div key={event.dia} className={`p-3 rounded-lg border-l-4 ${getEtapaColor(event.etapa)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{event.detalles}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Día {event.dia} de {months[event.mes]}
                  </p>
                </div>
                {event.alerta && <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">⚠</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-white rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Detalles del Evento
              </h2>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-l-4 ${getEtapaColor(selectedEvent.etapa)}`}>
                <p className="font-bold text-lg">{selectedEvent.detalles}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Día {selectedEvent.dia} de {months[selectedEvent.mes]} 2024
                </p>
              </div>

              {selectedEvent.alerta && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-bold text-red-700 mb-1">
                    ⚠ Alerta: {selectedEvent.alerta === "clima" ? "Condiciones Climáticas" : "Posible Retraso"}
                  </p>
                  <p className="text-sm text-red-600">Requiere atención especial</p>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all">
                  Editar Evento
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-3 px-4 border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Crear Nuevo Evento
              </h2>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Descripción</label>
                <input
                  type="text"
                  value={newEvent.detalles}
                  onChange={(e) => setNewEvent({ ...newEvent, detalles: e.target.value })}
                  placeholder="Ej: Cosecha Lote C"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Mes</label>
                  <select
                    value={newEvent.mes}
                    onChange={(e) => setNewEvent({ ...newEvent, mes: Number.parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {months.map((month, idx) => (
                      <option key={month} value={idx}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Día</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={newEvent.dia}
                    onChange={(e) => setNewEvent({ ...newEvent, dia: Number.parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Etapa de Producción</label>
                <select
                  value={newEvent.etapa}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      etapa: e.target.value as "siembra" | "crecimiento" | "cosecha" | "procesamiento",
                    })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="siembra">Siembra</option>
                  <option value="crecimiento">Crecimiento</option>
                  <option value="cosecha">Cosecha</option>
                  <option value="procesamiento">Procesamiento</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddEvent}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Crear Evento
                </button>
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 py-3 px-4 border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
