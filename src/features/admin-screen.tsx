"use client"

import { useState } from "react"
import { Plus, Trash2, Edit2, Search } from "lucide-react"

interface User {
  id: string
  nombre: string
  email: string
  rol: "admin" | "operator"
  estado: "activo" | "inactivo"
  fechaRegistro: string
}

interface Alga {
  id: string
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
  id: string
  nombre: string
  nutrientes: string[]
  dosis: string
  aplicacion: string
}

const mockAlgas: Alga[] = [
  {
    id: "ALG-001",
    nombre: "Spirulina",
    nombreCientifico: "Arthrospira platensis",
    cicloPromedio: 35,
    tempOptima: { min: 25, max: 35 },
    pHOptimo: { min: 8.5, max: 10 },
    salinidadOptima: { min: 0, max: 5 },
    rendimientoEsperado: 25,
    color: "#2D6A4F",
    usos: "Suplemento alimenticio, cosmética",
    descripcion: "Alga azul-verde rica en proteínas y nutrientes",
  },
  {
    id: "ALG-002",
    nombre: "Chlorella",
    nombreCientifico: "Chlorella vulgaris",
    cicloPromedio: 28,
    tempOptima: { min: 20, max: 30 },
    pHOptimo: { min: 7, max: 8.5 },
    salinidadOptima: { min: 0, max: 2 },
    rendimientoEsperado: 30,
    color: "#3FA77A",
    usos: "Detoxificación, biocombustible",
    descripcion: "Microalga verde con alto contenido de clorofila",
  },
  {
    id: "ALG-003",
    nombre: "Laminaria",
    nombreCientifico: "Laminaria digitata",
    cicloPromedio: 120,
    tempOptima: { min: 10, max: 15 },
    pHOptimo: { min: 8, max: 8.5 },
    salinidadOptima: { min: 30, max: 35 },
    rendimientoEsperado: 15,
    color: "#A8E6CF",
    usos: "Alginato, fertilizante, cosméticos",
    descripcion: "Macroalga marrón de agua fría",
  },
]

const mockFormulas: Formula[] = [
  {
    id: "FRM-001",
    nombre: "Nutrientes Premium",
    nutrientes: ["Nitrógeno", "Fósforo", "Potasio", "Oligoelementos"],
    dosis: "5ml por 1000L",
    aplicacion: "Semanal",
  },
  {
    id: "FRM-002",
    nombre: "Micronutrientes",
    nutrientes: ["Hierro", "Manganeso", "Zinc", "Cobre"],
    dosis: "2ml por 1000L",
    aplicacion: "Quincenal",
  },
]

const mockUsers: User[] = [
  {
    id: "USR-001",
    nombre: "Carlos Rivera",
    email: "carlos.rivera@algas.com",
    rol: "admin",
    estado: "activo",
    fechaRegistro: "2024-01-15",
  },
  {
    id: "USR-002",
    nombre: "María López",
    email: "maria.lopez@algas.com",
    rol: "operator",
    estado: "activo",
    fechaRegistro: "2024-02-20",
  },
]

export default function AdminScreen() {
  const [selectedTab, setSelectedTab] = useState<"algas" | "formulas" | "usuarios" | "configuracion">("algas")
  const [selectedAlga, setSelectedAlga] = useState<Alga | null>(null)
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showNewAlgaForm, setShowNewAlgaForm] = useState(false)
  const [showNewFormulaForm, setShowNewFormulaForm] = useState(false)
  const [searchAlga, setSearchAlga] = useState("")

  const filteredAlgas = mockAlgas.filter(
    (alga) =>
      alga.nombre.toLowerCase().includes(searchAlga.toLowerCase()) ||
      alga.nombreCientifico.toLowerCase().includes(searchAlga.toLowerCase()),
  )

  return (
    <div className="pb-24 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-primary via-accent to-primary/80 text-white px-6 py-10 pt-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Centro de Administración
          </h1>
          <p className="text-white/80 text-sm">Gestiona especies, fórmulas, usuarios y configuración del sistema</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Admin Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12a5 5 0 1110 0A5 5 0 017 12z"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Especies</p>
            <p className="text-2xl font-bold text-primary">{mockAlgas.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Fórmulas</p>
            <p className="text-2xl font-bold text-accent">{mockFormulas.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 12H9"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Usuarios</p>
            <p className="text-2xl font-bold text-blue-600">{mockUsers.length}</p>
          </div>
        </div>

        {/* Tab Navigation - Modern Style */}
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

        {/* ALGAS TAB */}
        {selectedTab === "algas" && (
          <div className="space-y-4">
            {/* Search and Add Button */}
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

            {/* New Alga Form */}
            {showNewAlgaForm && (
              <div className="bg-white rounded-2xl border border-primary/20 p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Agregar Nueva Especie de Alga
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nombre común"
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Nombre científico"
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Ciclo (días)"
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Rendimiento esperado"
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Temp. óptima (ej: 20-30°C)"
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="pH óptimo (ej: 7-8.5)"
                    className="px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <textarea
                    placeholder="Usos y aplicaciones"
                    className="col-span-2 px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm h-20 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all">
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

            {/* Algas Grid */}
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {filteredAlgas.map((alga) => (
                <div
                  key={alga.id}
                  onClick={() => setSelectedAlga(alga)}
                  className="bg-white rounded-2xl border border-border/30 p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="w-10 h-10 rounded-xl mb-2" style={{ backgroundColor: alga.color }} />
                      <p className="font-bold text-foreground text-lg">{alga.nombre}</p>
                      <p className="text-xs text-muted-foreground italic">{alga.nombreCientifico}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{alga.descripcion}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-muted-foreground">Ciclo</p>
                      <p className="font-semibold text-foreground">{alga.cicloPromedio} días</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-muted-foreground">Rendimiento</p>
                      <p className="font-semibold text-foreground">{alga.rendimientoEsperado}%</p>
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
                    <span className="font-semibold text-foreground">Usos:</span> {alga.usos}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORMULAS TAB */}
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
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Agregar Nueva Fórmula Nutricional
                </h3>
                <div className="space-y-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nombre de la fórmula"
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <textarea
                    placeholder="Nutrientes (separados por coma)"
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm h-20 resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Dosis recomendada"
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Frecuencia de aplicación"
                    className="w-full px-4 py-3 border border-border/30 rounded-xl bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all">
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
              {mockFormulas.map((formula) => (
                <div
                  key={formula.id}
                  onClick={() => setSelectedFormula(formula)}
                  className="bg-white rounded-2xl border border-border/30 p-5 hover:shadow-lg hover:border-accent/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-lg">{formula.nombre}</p>
                      <p className="text-xs text-muted-foreground">ID: {formula.id}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4 text-accent" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Dosis</p>
                      <p className="font-semibold text-foreground">{formula.dosis}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Aplicación</p>
                      <p className="font-semibold text-foreground">{formula.aplicacion}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formula.nutrientes.map((nutriente, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-lg font-medium">
                        {nutriente}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USUARIOS TAB */}
        {selectedTab === "usuarios" && (
          <div className="space-y-4">
            <button className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Agregar Usuario
            </button>

            <div className="space-y-3">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="bg-white rounded-2xl border border-border/30 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{user.nombre}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.rol === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.rol === "admin" ? "Admin" : "Operador"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.estado === "activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIGURACION TAB */}
        {selectedTab === "configuracion" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Configuración del Sistema
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Mantenimiento Programado",
                    desc: "Modo de mantenimiento del sistema",
                  },
                  { title: "Backup Automático", desc: "Realizar copias de seguridad diarias" },
                  {
                    title: "Notificaciones Email",
                    desc: "Enviar alertas críticas por correo",
                  },
                  {
                    title: "Historial Extendido",
                    desc: "Guardar 12 meses de datos",
                  },
                ].map((setting, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between pb-4 border-b border-border/30 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{setting.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{setting.desc}</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded accent-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alga Details Modal */}
      {selectedAlga && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: selectedAlga.color }} />
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    {selectedAlga.nombre}
                  </h2>
                  <p className="text-xs text-muted-foreground italic">{selectedAlga.nombreCientifico}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAlga(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-foreground">{selectedAlga.descripcion}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Ciclo Promedio</p>
                  <p className="text-2xl font-bold text-primary">{selectedAlga.cicloPromedio}</p>
                  <p className="text-xs text-muted-foreground">días</p>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Rendimiento</p>
                  <p className="text-2xl font-bold text-accent">{selectedAlga.rendimientoEsperado}%</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Temperatura Óptima</p>
                  <p className="font-semibold text-foreground">
                    {selectedAlga.tempOptima.min}°C - {selectedAlga.tempOptima.max}°C
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium mb-1">pH Óptimo</p>
                  <p className="font-semibold text-foreground">
                    {selectedAlga.pHOptimo.min} - {selectedAlga.pHOptimo.max}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Salinidad Óptima</p>
                  <p className="font-semibold text-foreground">
                    {selectedAlga.salinidadOptima.min} - {selectedAlga.salinidadOptima.max} ppt
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-2">Usos y Aplicaciones</p>
                <p className="text-sm text-foreground">{selectedAlga.usos}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                  Editar Especie
                </button>
                <button className="flex-1 py-3 px-4 border border-destructive text-destructive font-semibold rounded-xl hover:bg-destructive/10 transition-all">
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
