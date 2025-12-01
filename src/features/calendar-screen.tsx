import { useEffect, useState } from "react"
import { api } from "@/connection"

interface Event {
  id: number
  dia: number
  mes: number // 0 = enero, 11 = diciembre
  etapa: "siembra" | "crecimiento" | "cosecha" | "procesamiento"
  detalles: string
  alerta?: string | null
  startDate: string // ISO
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

// ==== Mappers entre API y UI ====

const typeFromApiToEtapa = (type: string): Event["etapa"] => {
  const t = type.toUpperCase()
  if (t === "SEEDING") return "siembra"
  if (t === "GROWTH") return "crecimiento"
  if (t === "HARVEST") return "cosecha"
  if (t === "PROCESSING") return "procesamiento"
  if (t === "MAINTENANCE") return "crecimiento"
  return "siembra"
}

const typeFromEtapaToApi: Record<Event["etapa"], string> = {
  siembra: "SEEDING",
  crecimiento: "GROWTH",
  cosecha: "HARVEST",
  procesamiento: "PROCESSING",
}

const alertFromApi = (level: string | undefined | null): string | null => {
  const l = (level || "").toUpperCase()
  if (!l || l === "NONE") return null
  if (l === "LOW") return "Alerta baja"
  if (l === "MEDIUM") return "Alerta media"
  if (l === "HIGH") return "Alerta alta"
  return level ?? null
}

const mapEventFromApi = (apiEvent: any): Event => {
  const start = new Date(apiEvent.startDate)
  return {
    id: Number(apiEvent.id),
    dia: start.getDate(),
    mes: start.getMonth(), // 0-11
    etapa: typeFromApiToEtapa(String(apiEvent.type || "")),
    detalles: apiEvent.title || apiEvent.description || "Evento de producción",
    alerta: alertFromApi(apiEvent.alertLevel),
    startDate: apiEvent.startDate,
  }
}

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
      return "bg-gray-100 text-gray-700 border-gray-300"
  }
}

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate()

// ==== COMPONENTE ====

export default function CalendarScreen() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false) // <- NUEVO

  // mes/año del calendario
  const [currentMonth, setCurrentMonth] = useState<number | null>(null)
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  // estado para crear evento
  const [newEvent, setNewEvent] = useState({
    dia: 1,
    mes: new Date().getMonth(),
    etapa: "siembra" as Event["etapa"],
    detalles: "",
  })

  // estado para edición
  const [editEvent, setEditEvent] = useState<{
    id: number
    dia: number
    mes: number
    year: number
    etapa: Event["etapa"]
    detalles: string
  } | null>(null)

  // ==== Cargar eventos ====

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get("/production/events")
      const mapped = (res.data as any[]).map(mapEventFromApi)

      setEvents(mapped)

      if (mapped.length > 0) {
        const first = mapped[0]
        setCurrentMonth(first.mes)
        setCurrentYear(new Date(first.startDate).getFullYear())
      } else {
        const now = new Date()
        setCurrentMonth(now.getMonth())
        setCurrentYear(now.getFullYear())
      }
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 401) {
        setError("No autorizado. Vuelve a iniciar sesión.")
      } else {
        setError("Error al cargar eventos de producción.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const monthIndex = currentMonth ?? new Date().getMonth()
  const year = currentYear ?? new Date().getFullYear()
  const daysInCurrentMonth = getDaysInMonth(year, monthIndex)

  // Solo eventos del año visible
  const eventsForCurrentYear = events.filter(
    (e) => new Date(e.startDate).getFullYear() === year
  )

  // ==== Navegación de mes/año ====

  const goToPrevMonth = () => {
    let newMonth = monthIndex - 1
    let newYear = year
    if (newMonth < 0) {
      newMonth = 11
      newYear -= 1
    }
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
  }

  const goToNextMonth = () => {
    let newMonth = monthIndex + 1
    let newYear = year
    if (newMonth > 11) {
      newMonth = 0
      newYear += 1
    }
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
  }

  const goToPrevYear = () => {
    setCurrentYear(year - 1)
  }

  const goToNextYear = () => {
    setCurrentYear(year + 1)
  }

  // ==== Crear evento ====

  const handleAddEvent = async () => {
    if (!newEvent.detalles.trim()) return

    try {
      setCreating(true)
      const yearForNew = year

      const start = new Date(
        yearForNew,
        newEvent.mes,
        newEvent.dia,
        0,
        0,
        0
      ).toISOString()
      const end = new Date(
        yearForNew,
        newEvent.mes,
        newEvent.dia,
        23,
        59,
        59
      ).toISOString()

      const res = await api.post("/production/events", {
        title: newEvent.detalles,
        description: newEvent.detalles,
        startDate: start,
        endDate: end,
        type: typeFromEtapaToApi[newEvent.etapa],
        alertLevel: "NONE",
      })

      const created = mapEventFromApi(res.data)
      setEvents((prev) => [...prev, created])

      setNewEvent({ dia: 1, mes: monthIndex, etapa: "siembra", detalles: "" })
      setShowAddEventModal(false)
    } catch (err: any) {
      console.error(err)
      alert("No se pudo crear el evento")
    } finally {
      setCreating(false)
    }
  }

  // ==== Abrir detalles (desde calendario o próximos eventos) ====

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
    setIsEditMode(false) // primero solo visualizar
    setEditEvent({
      id: event.id,
      dia: event.dia,
      mes: event.mes,
      year: new Date(event.startDate).getFullYear(),
      etapa: event.etapa,
      detalles: event.detalles,
    })
  }

  const closeEventModal = () => {
    setSelectedEvent(null)
    setEditEvent(null)
    setIsEditMode(false)
  }

  // ==== Actualizar evento ====

  const handleUpdateEvent = async () => {
    if (!editEvent) return

    try {
      setUpdating(true)
      const start = new Date(
        editEvent.year,
        editEvent.mes,
        editEvent.dia,
        0,
        0,
        0
      ).toISOString()
      const end = new Date(
        editEvent.year,
        editEvent.mes,
        editEvent.dia,
        23,
        59,
        59
      ).toISOString()

      const res = await api.patch(`/production/events/${editEvent.id}`, {
        title: editEvent.detalles,
        description: editEvent.detalles,
        startDate: start,
        endDate: end,
        type: typeFromEtapaToApi[editEvent.etapa],
        alertLevel: "NONE",
      })

      const updated = mapEventFromApi(res.data)

      setEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      )

      setSelectedEvent(updated)
      setEditEvent({
        id: updated.id,
        dia: updated.dia,
        mes: updated.mes,
        year: new Date(updated.startDate).getFullYear(),
        etapa: updated.etapa,
        detalles: updated.detalles,
      })
      setIsEditMode(false) // vuelvo a modo vista
    } catch (err: any) {
      console.error(err)
      alert("No se pudo actualizar el evento")
    } finally {
      setUpdating(false)
    }
  }

  // ==== Eliminar evento ====  (NUEVO)

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este evento de producción? Esta acción no se puede deshacer."
    )
    if (!confirmDelete) return

    try {
      setDeleting(true)
      await api.delete(`/production/events/${selectedEvent.id}`)

      // quitar de la lista local
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))

      // cerrar modal
      closeEventModal()
    } catch (err: any) {
      console.error(err)
      alert("No se pudo eliminar el evento")
    } finally {
      setDeleting(false)
    }
  }

  // Próximos eventos (solo del año visible)
  const upcomingEvents = [...eventsForCurrentYear].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )

  return (
    <div className="pb-24 bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-4 pt-12 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Calendario de Producción
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              {isExpandedView
                ? `Vista Anual • Año ${year}`
                : `${months[monthIndex]} ${year} • Vista Mensual`}
            </p>
          </div>

          {/* Controles de año en desktop */}
          <div className="hidden md:flex items-center gap-2 text-primary-foreground">
            <button
              onClick={goToPrevYear}
              className="px-2 py-1 bg-primary-foreground/20 rounded-lg text-sm hover:bg-primary-foreground/30"
            >
              ◀ Año
            </button>
            <span className="font-semibold text-sm">{year}</span>
            <button
              onClick={goToNextYear}
              className="px-2 py-1 bg-primary-foreground/20 rounded-lg text-sm hover:bg-primary-foreground/30"
            >
              Año ▶
            </button>
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
            onClick={() => {
              setNewEvent({
                dia: 1,
                mes: monthIndex,
                etapa: "siembra",
                detalles: "",
              })
              setShowAddEventModal(true)
            }}
            className="px-4 py-2 bg-white text-primary hover:bg-primary-foreground/10 rounded-lg font-semibold text-sm transition-colors"
          >
            + Nuevo Evento
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
        {loading && (
          <p className="text-sm text-muted-foreground mb-2">
            Cargando eventos de producción...
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive mb-2">{error}</p>
        )}

        {/* Leyenda */}
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
                <span className="text-xs font-medium text-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Título/controles según vista */}
        {isExpandedView ? (
          <div className="flex items-center justify-between mb-3 md:hidden">
            <button
              onClick={goToPrevYear}
              className="px-3 py-1 bg-white border border-border rounded-lg text-sm"
            >
              ◀ Año
            </button>
            <h2
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Calendario anual {year}
            </h2>
            <button
              onClick={goToNextYear}
              className="px-3 py-1 bg-white border border-border rounded-lg text-sm"
            >
              Año ▶
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPrevMonth}
              className="px-3 py-1 bg-white border border-border rounded-lg text-sm"
            >
              ◀
            </button>
            <h2
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {months[monthIndex]} {year}
            </h2>
            <button
              onClick={goToNextMonth}
              className="px-3 py-1 bg-white border border-border rounded-lg text-sm"
            >
              ▶
            </button>
          </div>
        )}

        {isExpandedView ? (
          // ===== Vista Anual =====
          <>
            <div className="hidden md:flex items-center justify-center mb-3">
              <h2
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Calendario anual {year}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
              {months.map((month, monthIdxLoop) => {
                const daysThisMonth = getDaysInMonth(year, monthIdxLoop)
                return (
                  <div
                    key={month}
                    className="bg-white rounded-xl border border-border p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setCurrentMonth(monthIdxLoop)
                      setIsExpandedView(false)
                    }}
                  >
                    <h3 className="font-bold text-sm mb-2 text-foreground text-center">
                      {month}
                    </h3>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day) => (
                        <div key={day} className="text-center">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {day}
                          </p>
                        </div>
                      ))}
                      {Array.from({ length: daysThisMonth }).map((_, idx) => {
                        const dayNum = idx + 1
                        const event = eventsForCurrentYear.find(
                          (e) => e.dia === dayNum && e.mes === monthIdxLoop
                        )
                        return (
                          <div
                            key={dayNum}
                            className={`p-1 text-center rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              event
                                ? getEtapaColor(event.etapa)
                                : "bg-background text-foreground/50 border border-dashed border-border/40"
                            } hover:shadow-md`}
                          >
                            {dayNum}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          // ===== Vista Mensual =====
          <div className="bg-white rounded-2xl border border-border overflow-hidden flex-1 flex flex-col">
            {/* Cabecera días */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center border-b border-border"
                >
                  <p className="text-sm font-bold text-foreground">{day}</p>
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-0 flex-1">
              {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                const dayNum = idx + 1
                const event = eventsForCurrentYear.find(
                  (e) => e.dia === dayNum && e.mes === monthIndex
                )
                return (
                  <div
                    key={dayNum}
                    className="border-r border-b border-border p-2 bg-white hover:bg-background/80 transition-colors cursor-pointer flex flex-col items-center min-h-24"
                    onClick={() => event && openEventDetails(event)}
                  >
                    <div className="mb-1 text-xs text-muted-foreground self-start">
                      {dayNum}
                    </div>
                    {event && (
                      <div className="w-full space-y-2">
                        <div
                          className={`w-full p-2.5 rounded-xl text-xs font-bold border-2 ${getEtapaColor(
                            event.etapa
                          )} cursor-pointer hover:shadow-lg transition-all text-center`}
                        >
                          <p className="font-bold line-clamp-2">
                            {event.detalles}
                          </p>
                        </div>
                        {event.alerta && (
                          <div className="w-full px-1.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1">
                            <span>⚠</span>
                            <span className="line-clamp-1">
                              {event.alerta}
                            </span>
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

      {/* Próximos eventos */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3
          className="font-bold text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Próximos Eventos ({year})
        </h3>
        <div className="space-y-3">
          {upcomingEvents.slice(0, 5).map((event) => (
            <button
              key={event.id}
              onClick={() => openEventDetails(event)}
              className={`w-full text-left p-3 rounded-lg border-l-4 ${getEtapaColor(
                event.etapa
              )} hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{event.detalles}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Día {event.dia} de {months[event.mes]}{" "}
                    {new Date(event.startDate).getFullYear()}
                  </p>
                </div>
                {event.alerta && (
                  <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                    ⚠
                  </div>
                )}
              </div>
            </button>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay eventos registrados para este año.
            </p>
          )}
        </div>
      </div>

      {/* Modal detalles / edición */}
      {selectedEvent && editEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isEditMode ? "Editar Evento" : "Detalles del Evento"}
              </h2>
              <button
                onClick={closeEventModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Sección de info / formulario */}
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={editEvent.detalles}
                    onChange={(e) =>
                      setEditEvent({ ...editEvent, detalles: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Año
                    </label>
                    <input
                      type="number"
                      value={editEvent.year}
                      onChange={(e) =>
                        setEditEvent({
                          ...editEvent,
                          year: Number.parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Mes
                    </label>
                    <select
                      value={editEvent.mes}
                      onChange={(e) =>
                        setEditEvent({
                          ...editEvent,
                          mes: Number.parseInt(e.target.value),
                        })
                      }
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
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Día
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={getDaysInMonth(editEvent.year, editEvent.mes)}
                      value={editEvent.dia}
                      onChange={(e) =>
                        setEditEvent({
                          ...editEvent,
                          dia: Number.parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Etapa de Producción
                  </label>
                  <select
                    value={editEvent.etapa}
                    onChange={(e) =>
                      setEditEvent({
                        ...editEvent,
                        etapa: e.target.value as Event["etapa"],
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

                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={handleUpdateEvent}
                    disabled={updating}
                    className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {updating ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    onClick={() => {
                      // cancelar edición: volver a ver detalles originales
                      if (selectedEvent) {
                        setEditEvent({
                          id: selectedEvent.id,
                          dia: selectedEvent.dia,
                          mes: selectedEvent.mes,
                          year: new Date(
                            selectedEvent.startDate
                          ).getFullYear(),
                          etapa: selectedEvent.etapa,
                          detalles: selectedEvent.detalles,
                        })
                      }
                      setIsEditMode(false)
                    }}
                    className="flex-1 py-3 px-4 border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-all"
                  >
                    Cancelar edición
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {deleting ? "Eliminando..." : "Eliminar evento"}
                  </button>
                </div>
              </div>
            ) : (
              // ===== Modo solo visualizar =====
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border-l-4 ${getEtapaColor(
                    selectedEvent.etapa
                  )}`}
                >
                  <p className="font-bold text-lg">{selectedEvent.detalles}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Día {selectedEvent.dia} de {months[selectedEvent.mes]}{" "}
                    {new Date(selectedEvent.startDate).getFullYear()}
                  </p>
                </div>

                {selectedEvent.alerta && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-bold text-red-700 mb-1">
                      ⚠ Alerta: {selectedEvent.alerta}
                    </p>
                    <p className="text-sm text-red-600">
                      Requiere atención especial.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={closeEventModal}
                    className="flex-1 py-3 px-4 border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-all"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {deleting ? "Eliminando..." : "Eliminar evento"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal crear evento */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
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
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newEvent.detalles}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, detalles: e.target.value })
                  }
                  placeholder="Ej: Cosecha Lote C"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Mes
                  </label>
                  <select
                    value={newEvent.mes}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        mes: Number.parseInt(e.target.value),
                      })
                    }
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
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Día
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={getDaysInMonth(year, newEvent.mes)}
                    value={newEvent.dia}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        dia: Number.parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Etapa de Producción
                </label>
                <select
                  value={newEvent.etapa}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      etapa: e.target.value as Event["etapa"],
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
                  disabled={creating}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {creating ? "Creando..." : "Crear Evento"}
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
