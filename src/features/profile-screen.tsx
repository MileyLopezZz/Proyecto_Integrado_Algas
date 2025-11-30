"use client"

export default function ProfileScreen() {
  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-8 pt-12">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Mi Perfil
        </h1>
        <p className="text-primary-foreground/80 text-sm">Administra tu cuenta y preferencias</p>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Carlos Rivera</h2>
              <p className="text-sm text-muted-foreground">Gerente de Producción</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-border pt-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Correo Electrónico</p>
              <p className="text-sm font-medium text-foreground">carlos.rivera@algas.com</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Empresa</p>
              <p className="text-sm font-medium text-foreground">{"Biokel\n"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
              <p className="text-sm font-medium text-foreground">{"Copiapó,Chile"}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Preferencias
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Notificaciones</p>
                <p className="text-xs text-muted-foreground mt-1">Recibir alertas de eventos importantes</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Modo Oscuro</p>
                <p className="text-xs text-muted-foreground mt-1">Activar tema oscuro</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dos Factores</p>
                <p className="text-xs text-muted-foreground mt-1">Mayor seguridad en tu cuenta</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded" />
            </div>
          </div>
        </div>

        {/* Statistics */}
        

        {/* Security */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Seguridad
          </h3>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 text-foreground font-semibold rounded-lg border border-border hover:bg-background transition-all text-left">
              Cambiar Contraseña
            </button>
            <button className="w-full py-3 px-4 text-foreground font-semibold rounded-lg border border-border hover:bg-background transition-all text-left">
              Historial de Sesiones
            </button>
            <button className="w-full py-3 px-4 text-destructive font-semibold rounded-lg border border-destructive hover:bg-destructive/10 transition-all text-left">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground">Versión 1.0.0 • © 2025 Gestión de Algas</p>
        </div>
      </div>
    </div>
  )
}
