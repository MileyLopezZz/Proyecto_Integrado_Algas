import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Search } from "lucide-react"
import { api } from "@/connection"

// ================== TIPOS API ==================

interface AdminStats {
  speciesCount: number
  formulasCount: number
  usersCount: number
}

interface SpeciesApi {
  id: number
  name: string
  scientificName: string | null
  description: string

  // campos nuevos del back
  cycleDays: number
  yieldPercent: number // 0.5 = 50%
  tempRange: string // "20-30"
  phRange: string // "8-9"
  usage: string

  // campos antiguos por compatibilidad
  averageCycleDays?: number
  optimalTempMin?: number
  optimalTempMax?: number
  optimalPhMin?: number
  optimalPhMax?: number
  optimalSalinityMin?: number
  optimalSalinityMax?: number
  expectedYield?: number
  color?: string
  uses?: string
}

interface FormulaApi {
  id: number
  name: string
  nutrients: string[] | string | null
  dose: string
  application: string
}

interface UserApi {
  id: number
  name: string
  email: string
  role: "ADMIN" | "OPERATOR"
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
}

interface ConfigApi {
  maintenanceMode: boolean
  autoBackup: boolean
  emailNotifications: boolean
  extendedHistory: boolean
}

// ================== TIPOS UI ==================

interface User {
  id: number
  nombre: string
  email: string
  rol: "admin" | "operator"
  estado: "activo" | "inactivo"
  fechaRegistro: string
}

interface Alga {
  id: number
  nombre: string
  nombreCientifico: string
  cicloPromedio: number
  tempOptima: { min: number; max: number }
  pHOptimo: { min: number; max: number }
  salinidadOptima: { min: number; max: number }
  rendimientoEsperado: number
  color: string
  usos: string
  descripcion: string
}

interface Formula {
  id: number
  nombre: string
  nutrientes: string[]
  dosis: string
  aplicacion: string
}

// ======== MAPPERS API → UI ========

const mapSpeciesFromApi = (s: SpeciesApi): Alga => {
  // tempRange "20-30"
  let tempMin = 0
  let tempMax = 0
  if (s.tempRange) {
    const [tMin, tMax] = s.tempRange.split("-")
    tempMin = Number(tMin)
    tempMax = Number(tMax)
  } else if (s.optimalTempMin != null && s.optimalTempMax != null) {
    tempMin = s.optimalTempMin
    tempMax = s.optimalTempMax
  }

  // phRange "8-9"
  let phMin = 0
  let phMax = 0
  if (s.phRange) {
    const [pMin, pMax] = s.phRange.split("-")
    phMin = Number(pMin)
    phMax = Number(pMax)
  } else if (s.optimalPhMin != null && s.optimalPhMax != null) {
    phMin = s.optimalPhMin
    phMax = s.optimalPhMax
  }

  // rendimiento: 0.5 => 50
  const rendimiento =
    typeof s.yieldPercent === "number"
      ? s.yieldPercent * 100
      : s.expectedYield ?? 0

  return {
    id: s.id,
    nombre: s.name,
    nombreCientifico: s.scientificName ?? "",
    cicloPromedio: s.cycleDays ?? s.averageCycleDays ?? 0,
    tempOptima: { min: tempMin, max: tempMax },
    pHOptimo: { min: phMin, max: phMax },
    salinidadOptima: {
      min: s.optimalSalinityMin ?? 0,
      max: s.optimalSalinityMax ?? 0,
    },
    rendimientoEsperado: rendimiento,
    color: s.color || "#2D6A4F",
    usos: s.usage ?? s.uses ?? "",
    descripcion: s.description,
  }
}

const mapFormulaFromApi = (f: FormulaApi): Formula => {
  let nutrientes: string[] = []

  if (Array.isArray(f.nutrients)) {
    nutrientes = f.nutrients
  } else if (typeof f.nutrients === "string") {
    nutrientes = f.nutrients
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
  } else {
    nutrientes = []
  }

  return {
    id: f.id,
    nombre: f.name,
    nutrientes,
    dosis: f.dose,
    aplicacion: f.application,
  }
}

const mapUserFromApi = (u: UserApi): User => ({
  id: u.id,
  nombre: u.name,
  email: u.email,
  rol: u.role === "ADMIN" ? "admin" : "operator",
  estado: u.status === "ACTIVE" ? "activo" : "inactivo",
  fechaRegistro: u.createdAt,
})

// helpers rol/estado → API
const roleToApi = {
  admin: "ADMIN",
  operator: "OPERATOR",
} as const

const statusToApi = {
  activo: "ACTIVE",
  inactivo: "INACTIVE",
} as const

export default function AdminScreen() {
  const [selectedTab, setSelectedTab] =
    useState<"algas" | "formulas" | "usuarios" | "configuracion">("algas")

  // datos desde API
  const [algas, setAlgas] = useState<Alga[]>([])
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [config, setConfig] = useState<ConfigApi | null>(null)

  // selección / UI
  const [selectedAlga, setSelectedAlga] = useState<Alga | null>(null)
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [showNewAlgaForm, setShowNewAlgaForm] = useState(false)
  const [showNewFormulaForm, setShowNewFormulaForm] = useState(false)
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [searchAlga, setSearchAlga] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // formularios simples para crear
  const [newAlga, setNewAlga] = useState({
    nombre: "",
    nombreCientifico: "",
    cicloPromedio: 0,
    rendimientoEsperado: 0,
    temp: "",
    ph: "",
    usos: "",
    descripcion: "",
  })

  const [newFormula, setNewFormula] = useState({
    nombre: "",
    nutrientes: "",
    dosis: "",
    aplicacion: "",
  })

  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    rol: "operator" as "admin" | "operator",
    estado: "activo" as "activo" | "inactivo",
  })

  // ============== CARGA INICIAL ==============

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, speciesRes, formulasRes, usersRes, configRes] =
        await Promise.all([
          api.get<AdminStats>("/admin/stats"),
          api.get<SpeciesApi[]>("/admin/species"),
          api.get<FormulaApi[]>("/admin/formulas"),
          api.get<UserApi[]>("/admin/users"),
          api.get<ConfigApi>("/admin/config"),
        ])

      setStats(statsRes.data)
      setAlgas(speciesRes.data.map(mapSpeciesFromApi))
      setFormulas(formulasRes.data.map(mapFormulaFromApi))
      setUsers(usersRes.data.map(mapUserFromApi))
      setConfig(configRes.data)
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 401) {
        setError("No autorizado. Vuelve a iniciar sesión.")
      } else {
        setError("Error al cargar datos de administración.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // ============== CRUD ESPECIES ==============

  const handleCreateAlga = async () => {
    if (!newAlga.nombre.trim() || !newAlga.nombreCientifico.trim()) return

    try {
      const payload = {
        name: newAlga.nombre.trim(),
        scientificName: newAlga.nombreCientifico.trim() || null,
        description: newAlga.descripcion.trim(),
        cycleDays: Number(newAlga.cicloPromedio),
        yieldPercent: Number(newAlga.rendimientoEsperado) / 100, // 50 => 0.5
        tempRange: newAlga.temp.trim(), // "20-30"
        phRange: newAlga.ph.trim(), // "8-9"
        usage: newAlga.usos.trim(),
      }

      const res = await api.post<SpeciesApi>("/admin/species", payload)

      const created = mapSpeciesFromApi(res.data)
      setAlgas((prev) => [...prev, created])

      setNewAlga({
        nombre: "",
        nombreCientifico: "",
        cicloPromedio: 0,
        rendimientoEsperado: 0,
        temp: "",
        ph: "",
        usos: "",
        descripcion: "",
      })
      setShowNewAlgaForm(false)
    } catch (err) {
      console.error(err)
      alert("No se pudo crear la especie.")
    }
  }

  const handleDeleteAlga = async (id: number) => {
    if (!confirm("¿Eliminar esta especie?")) return
    try {
      await api.delete(`/admin/species/${id}`)
      setAlgas((prev) => prev.filter((a) => a.id !== id))
      if (selectedAlga?.id === id) setSelectedAlga(null)
    } catch (err) {
      console.error(err)
      alert("No se pudo eliminar la especie.")
    }
  }

  // ============== CRUD FORMULAS ==============

  const handleCreateFormula = async () => {
    if (!newFormula.nombre.trim()) return
    try {
      const res = await api.post<FormulaApi>("/admin/formulas", {
        name: newFormula.nombre.trim(),
        nutrients: newFormula.nutrientes
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean),
        dose: newFormula.dosis.trim(),
        application: newFormula.aplicacion.trim(),
      })

      const created = mapFormulaFromApi(res.data)
      setFormulas((prev) => [...prev, created])
      setNewFormula({ nombre: "", nutrientes: "", dosis: "", aplicacion: "" })
      setShowNewFormulaForm(false)
    } catch (err) {
      console.error(err)
      alert("No se pudo crear la fórmula.")
    }
  }

  const handleDeleteFormula = async (id: number) => {
    if (!confirm("¿Eliminar esta fórmula?")) return
    try {
      await api.delete(`/admin/formulas/${id}`)
      setFormulas((prev) => prev.filter((f) => f.id !== id))
      if (selectedFormula?.id === id) setSelectedFormula(null)
    } catch (err) {
      console.error(err)
      alert("No se pudo eliminar la fórmula.")
    }
  }

  // ============== CRUD USUARIOS ==============

  const handleCreateUser = async () => {
    if (!newUser.nombre.trim() || !newUser.email.trim()) return
    try {
      const res = await api.post<UserApi>("/admin/users", {
        name: newUser.nombre.trim(),
        email: newUser.email.trim(),
        role: roleToApi[newUser.rol],
        status: statusToApi[newUser.estado],
      })

      const created = mapUserFromApi(res.data)
      setUsers((prev) => [...prev, created])

      setNewUser({
        nombre: "",
        email: "",
        rol: "operator",
        estado: "activo",
      })
      setShowNewUserForm(false)
    } catch (err) {
      console.error(err)
      alert("No se pudo crear el usuario.")
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      if (selectedUser?.id === id) setSelectedUser(null)
    } catch (err) {
      console.error(err)
      alert("No se pudo eliminar el usuario.")
    }
  }

  // ============== CONFIG ==============

  const handleToggleConfig = async (key: keyof ConfigApi) => {
    if (!config) return
    const updated = { ...config, [key]: !config[key] }
    try {
      await api.patch("/admin/config", updated)
      setConfig(updated)
    } catch (err) {
      console.error(err)
      alert("No se pudo actualizar la configuración.")
    }
  }

  // ============== FILTROS ==============

  const filteredAlgas = algas.filter(
    (alga) =>
      alga.nombre.toLowerCase().includes(searchAlga.toLowerCase()) ||
      alga.nombreCientifico.toLowerCase().includes(searchAlga.toLowerCase()),
  )

  const speciesCount = stats?.speciesCount ?? algas.length
  const formulasCount = stats?.formulasCount ?? formulas.length
  const usersCount = stats?.usersCount ?? users.length

  return (
    <div className="pb-24 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-accent to-primary/80 text-white px-6 py-10 pt-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
        <div className="relative z-10">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Centro de Administración
          </h1>
          <p className="text-white/80 text-sm">
            Gestiona especies, fórmulas, usuarios y configuración del sistema
          </p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {loading && (
          <p className="text-sm text-muted-foreground">
            Cargando datos de administración...
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12a5 5 0 1110 0A5 5 0 017 12z"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Especies
            </p>
            <p className="text-2xl font-bold text-primary">{speciesCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Fórmulas
            </p>
            <p className="text-2xl font-bold text-accent">{formulasCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-xl flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 12H9"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Usuarios
            </p>
            <p className="text-2xl font-bold text-blue-600">{usersCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl border border-border/30 p-1 shadow-sm">
          {[
            { id: "algas", label: "Especies de Algas", icon: "🌊" },
            { id: "formulas", label: "Fórmulas", icon: "⚗️" },
            { id: "usuarios", label: "Usuarios", icon: "👥" },
            { id: "configuracion", label: "Config", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1 ${
                selectedTab === tab.id
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ======= TAB ALGAS ======= */}
        {selectedTab === "algas" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar especies..."
                  value={searchAlga}
                  onChange={(e) => setSearchAlga(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border/30 rounded-xl bg-white text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button
                onClick={() => setShowNewAlgaForm(!showNewAlgaForm)}
                className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva</span>
              </button>
            </div>

            {showNewAlgaForm && (
              <div className="bg-white rounded-2xl border border-primary/20 p-6 shadow-lg">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Agregar Nueva Especie de Alga
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nombre común"
                    value={newAlga.nombre}
                    onChange={(e) =>
                      setNewAlga((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Nombre científico"
                    value={newAlga.nombreCientifico}
                    onChange={(e) =>
                      setNewAlga((prev) => ({
                        ...prev,
                        nombreCientifico: e.target.value,
                      }))
                    }
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Ciclo (días)"
                    value={newAlga.cicloPromedio || ""}
                    onChange={(e) =>
                      setNewAlga((prev) => ({
                        ...prev,
                        cicloPromedio: Number(e.target.value),
                      }))
                    }
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Rendimiento esperado (%)"
                    value={newAlga.rendimientoEsperado || ""}
                    onChange={(e) =>
                      setNewAlga((prev) => ({
                        ...prev,
                        rendimientoEsperado: Number(e.target.value),
                      }))
                    }
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Temp. óptima (ej: 20-30)"
                    value={newAlga.temp}
                    onChange={(e) =>
                      setNewAlga((prev) => ({ ...prev, temp: e.target.value }))
                    }
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="pH óptimo (ej: 8-9)"
                    value={newAlga.ph}
                    onChange={(e) =>
                      setNewAlga((prev) => ({ ...prev, ph: e.target.value }))
                    }
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <textarea
                    placeholder="Usos y aplicaciones"
                    value={newAlga.usos}
                    onChange={(e) =>
                      setNewAlga((prev) => ({ ...prev, usos: e.target.value }))
                    }
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm h-20 resize-none"
                  />
                  <textarea
                    placeholder="Descripción"
                    value={newAlga.descripcion}
                    onChange={(e) =>
                      setNewAlga((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm h-20 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateAlga}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Guardar Especie
                  </button>
                  <button
                    onClick={() => setShowNewAlgaForm(false)}
                    className="flex-1 py-3 px-4 border border-border/30 text-foreground font-semibold rounded-xl hover:bg-background transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {filteredAlgas.map((alga) => (
                <div
                  key={alga.id}
                  onClick={() => setSelectedAlga(alga)}
                  className="bg-white rounded-2xl border border-border/30 p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div
                        className="w-10 h-10 rounded-xl mb-2"
                        style={{ backgroundColor: alga.color }}
                      />
                      <p className="font-bold text-foreground text-lg">
                        {alga.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        {alga.nombreCientifico}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAlga(alga.id)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {alga.descripcion}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-muted-foreground">Ciclo</p>
                      <p className="font-semibold text-foreground">
                        {alga.cicloPromedio} días
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-muted-foreground">Rendimiento</p>
                      <p className="font-semibold text-foreground">
                        {alga.rendimientoEsperado}%
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-muted-foreground">Temp. Óptima</p>
                      <p className="font-semibold text-foreground">
                        {alga.tempOptima.min}-{alga.tempOptima.max}°C
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-muted-foreground">pH</p>
                      <p className="font-semibold text-foreground">
                        {alga.pHOptimo.min}-{alga.pHOptimo.max}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground border-t border-border/30 pt-2">
                    <span className="font-semibold text-foreground">Usos:</span>{" "}
                    {alga.usos}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======= TAB FÓRMULAS ======= */}
        {selectedTab === "formulas" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowNewFormulaForm(!showNewFormulaForm)}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Fórmula
            </button>

            {showNewFormulaForm && (
              <div className="bg-white rounded-2xl border border-primary/20 p-6 shadow-lg">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Agregar Nueva Fórmula Nutricional
                </h3>
                <div className="space-y-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nombre de la fórmula"
                    value={newFormula.nombre}
                    onChange={(e) =>
                      setNewFormula((p) => ({ ...p, nombre: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <textarea
                    placeholder="Nutrientes (separados por coma)"
                    value={newFormula.nutrientes}
                    onChange={(e) =>
                      setNewFormula((p) => ({
                        ...p,
                        nutrientes: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm h-20 resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Dosis recomendada"
                    value={newFormula.dosis}
                    onChange={(e) =>
                      setNewFormula((p) => ({ ...p, dosis: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Frecuencia de aplicación"
                    value={newFormula.aplicacion}
                    onChange={(e) =>
                      setNewFormula((p) => ({
                        ...p,
                        aplicacion: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateFormula}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Guardar Fórmula
                  </button>
                  <button
                    onClick={() => setShowNewFormulaForm(false)}
                    className="flex-1 py-3 px-4 border border-border/30 text-foreground font-semibold rounded-xl hover:bg-background transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {formulas.map((formula) => (
                <div
                  key={formula.id}
                  onClick={() => setSelectedFormula(formula)}
                  className="bg-white rounded-2xl border border-border/30 p-5 hover:shadow-lg hover:border-accent/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-lg">
                        {formula.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {formula.id}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4 text-accent" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFormula(formula.id)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Dosis
                      </p>
                      <p className="font-semibold text-foreground">
                        {formula.dosis}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Aplicación
                      </p>
                      <p className="font-semibold text-foreground">
                        {formula.aplicacion}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(formula.nutrientes || []).map((nutriente, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-lg font-medium"
                      >
                        {nutriente}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======= TAB USUARIOS ======= */}
        {selectedTab === "usuarios" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowNewUserForm(!showNewUserForm)}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Usuario
            </button>

            {showNewUserForm && (
              <div className="bg-white rounded-2xl border border-primary/20 p-6 shadow-lg">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Agregar Usuario
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newUser.nombre}
                    onChange={(e) =>
                      setNewUser((p) => ({ ...p, nombre: e.target.value }))
                    }
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((p) => ({ ...p, email: e.target.value }))
                    }
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <select
                    value={newUser.rol}
                    onChange={(e) =>
                      setNewUser((p) => ({ ...p, rol: e.target.value as any }))
                    }
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operador</option>
                  </select>
                  <select
                    value={newUser.estado}
                    onChange={(e) =>
                      setNewUser((p) => ({
                        ...p,
                        estado: e.target.value as any,
                      }))
                    }
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateUser}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Guardar Usuario
                  </button>
                  <button
                    onClick={() => setShowNewUserForm(false)}
                    className="flex-1 py-3 px-4 border border-border/30 text-foreground font-semibold rounded-xl hover:bg-background transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="bg-white rounded-2xl border border-border/30 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{user.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-2 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.rol === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.rol === "admin" ? "Admin" : "Operador"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.estado === "activo"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteUser(user.id)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======= TAB CONFIG ======= */}
        {selectedTab === "configuracion" && config && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-sm">
              <h3
                className="font-bold text-foreground mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Configuración del Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                  <div>
                    <p className="font-medium text-foreground">
                      Mantenimiento Programado
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modo de mantenimiento del sistema
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={() => handleToggleConfig("maintenanceMode")}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                  <div>
                    <p className="font-medium text-foreground">
                      Backup Automático
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Realizar copias de seguridad diarias
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoBackup}
                    onChange={() => handleToggleConfig("autoBackup")}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                  <div>
                    <p className="font-medium text-foreground">
                      Notificaciones Email
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enviar alertas críticas por correo
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.emailNotifications}
                    onChange={() => handleToggleConfig("emailNotifications")}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Historial Extendido
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Guardar 12 meses de datos
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.extendedHistory}
                    onChange={() => handleToggleConfig("extendedHistory")}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle alga */}
      {selectedAlga && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl"
                  style={{ backgroundColor: selectedAlga.color }}
                />
                <div>
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {selectedAlga.nombre}
                  </h2>
                  <p className="text-xs text-muted-foreground italic">
                    {selectedAlga.nombreCientifico}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlga(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-foreground">
                {selectedAlga.descripcion}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Ciclo Promedio
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedAlga.cicloPromedio}
                  </p>
                  <p className="text-xs text-muted-foreground">días</p>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Rendimiento
                  </p>
                  <p className="text-2xl font-bold text-accent">
                    {selectedAlga.rendimientoEsperado}%
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Temperatura Óptima
                  </p>
                  <p className="font-semibold text-foreground">
                    {selectedAlga.tempOptima.min}°C -{" "}
                    {selectedAlga.tempOptima.max}°C
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    pH Óptimo
                  </p>
                  <p className="font-semibold text-foreground">
                    {selectedAlga.pHOptimo.min} - {selectedAlga.pHOptimo.max}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Salinidad Óptima
                  </p>
                  <p className="font-semibold text-foreground">
                    {selectedAlga.salinidadOptima.min} -{" "}
                    {selectedAlga.salinidadOptima.max} ppt
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  Usos y Aplicaciones
                </p>
                <p className="text-sm text-foreground">{selectedAlga.usos}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                  Editar Especie
                </button>
                <button
                  onClick={() => handleDeleteAlga(selectedAlga.id)}
                  className="flex-1 py-3 px-4 border border-destructive text-destructive font-semibold rounded-xl hover:bg-destructive/10 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
