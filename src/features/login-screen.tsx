import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { api } from "@/connection"
import { useNavigate } from "react-router-dom"


interface FormValues {
  email: string
  password: string
  rememberMe: boolean
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Por favor ingresa un correo válido")
    .required("El correo es requerido"),
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es requerida"),
  rememberMe: Yup.boolean(),
})

export default function LoginScreen() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async(values) => {
      if (values.rememberMe) {
        localStorage.setItem("algae-remembered-email", values.email)
        localStorage.setItem("algae-remember-me", "true")
      } else {
        localStorage.removeItem("algae-remembered-email")
        localStorage.setItem("algae-remember-me", "false")
      }

      const res = await api.post("/auth/login",{email:values.email, password:values.password})
      if (res.data.access_token){
        localStorage.setItem("at_biogeles",res.data.access_token)
        navigate("/dashboard")
      }


    },
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem("algae-remembered-email")
    const wasRemembered = localStorage.getItem("algae-remember-me") === "true"

    if (savedEmail && wasRemembered) {
      formik.setValues({
        email: savedEmail,
        password: "",
        rememberMe: true,
      })
    }
  }, [formik])

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl -ml-48 -mb-48" />

      <div className="relative z-10 max-w-md w-full mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Gestión de Algas
          </h1>
          <p className="text-muted-foreground text-sm">
            Plataforma de producción marina
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="usuario@empresa.com"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                formik.touched.email && formik.errors.email
                  ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
              } bg-background`}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {formik.errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none pr-12 ${
                  formik.touched.password && formik.errors.password
                    ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                    : "border-border focus:border-primary focus:ring-2 focus:ring-primary/10"
                } bg-background`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {formik.errors.password}
              </div>
            )}
          </div>

          {/* Remember & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-foreground">Recordar correo</span>
            </label>

            <button
              type="button"
              className="text-primary hover:text-accent font-medium transition-colors"
            >
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
            <button
              type="button"
              className="text-primary hover:text-accent font-medium transition-colors"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
