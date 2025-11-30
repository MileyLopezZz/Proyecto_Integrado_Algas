"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

interface LoginScreenProps {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    const savedEmail = localStorage.getItem("algae-remembered-email")
    const wasRemembered = localStorage.getItem("algae-remember-me") === "true"
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "El correo es requerido"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Por favor ingresa un correo válido"
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "La contraseña es requerida"
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
    return undefined
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { email?: string; password?: string } = {}

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (rememberMe) {
      localStorage.setItem("algae-remembered-email", email)
      localStorage.setItem("algae-remember-me", "true")
    } else {
      localStorage.removeItem("algae-remembered-email")
      localStorage.setItem("algae-remember-me", "false")
    }

    onLogin()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl -ml-48 -mb-48" />

      <div className="relative z-10 max-w-md w-full mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Gestión de Algas
          </h1>
          <p className="text-muted-foreground text-sm">Plataforma de producción marina</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              placeholder="usuario@empresa.com"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                errors.email
                  ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
              } bg-background`}
            />
            {errors.email && (
              <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none pr-12 ${
                  errors.password
                    ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                    : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
                } bg-background`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </div>
            )}
          </div>

          {/* Remember and Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            
            <button type="button" className="text-primary hover:text-accent font-medium transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 mt-8"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <button type="button" className="text-primary hover:text-accent font-medium transition-colors">
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        
      </div>
    </div>
  )
}
