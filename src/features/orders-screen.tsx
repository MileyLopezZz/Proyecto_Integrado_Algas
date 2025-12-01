import { useEffect, useState } from "react"
import { api } from "@/connection"
import { useFormik } from "formik"
import * as Yup from "yup"

interface Order {
  id: string
  cliente: string
  producto: string
  cantidad: string
  estado: "pendiente" | "procesando" | "preparación" | "completado"
  prioridad: "alta" | "media" | "baja"
  fecha: string
  fechaEntrega: string
}

// ====== MAPEOS BACK <-> FRONT ======

const mapOrderFromApi = (order: any): Order => {
  const rawStatus = String(order.status || "").toUpperCase()
  const rawPriority = String(order.priority || "").toUpperCase()

  const statusMap: Record<string, Order["estado"]> = {
    PENDING: "pendiente",
    PROCESSING: "procesando",
    PREPARATION: "preparación",
    COMPLETED: "completado",
  }

  const priorityMap: Record<string, Order["prioridad"]> = {
    HIGH: "alta",
    NORMAL: "media",
    LOW: "baja",
  }

  return {
    id: String(order.id),
    cliente: order.clientName,
    producto: order.product,
    cantidad: String(order.quantity),
    estado: statusMap[rawStatus] ?? "pendiente",
    prioridad: priorityMap[rawPriority] ?? "media",
    fecha: order.createdAt,
    fechaEntrega: order.deliveryDate,
  }
}

// Español -> inglés para enviar al back
const statusToApi: Record<Order["estado"], string> = {
  pendiente: "PENDING",
  procesando: "PROCESSING",
  preparación: "PREPARATION",
  completado: "COMPLETED",
}

const priorityToApi: Record<Order["prioridad"], string> = {
  alta: "HIGH",
  media: "NORMAL",
  baja: "LOW",
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "completado":
      return "bg-green-100 text-green-700"
    case "preparación":
      return "bg-blue-100 text-blue-700"
    case "procesando":
      return "bg-yellow-100 text-yellow-700"
    case "pendiente":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getPrioridadColor = (prioridad: Order["prioridad"]) => {
  switch (prioridad) {
    case "alta":
      return "bg-red-100 text-red-700"
    case "media":
      return "bg-orange-100 text-orange-700"
    case "baja":
      return "bg-emerald-100 text-emerald-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

// ====== VALIDACIONES FORMULARIOS ======

interface CreateOrderValues {
  cliente: string
  producto: string
  cantidad: number | ""
  fechaEntrega: string // yyyy-mm-dd
  prioridad: "alta" | "media" | "baja"
}

type EditOrderValues = CreateOrderValues

const orderSchema = Yup.object({
  cliente: Yup.string().required("El nombre del cliente es obligatorio"),
  producto: Yup.string().required("El producto es obligatorio"),
  cantidad: Yup.number()
    .typeError("La cantidad debe ser un número")
    .positive("La cantidad debe ser mayor a 0")
    .required("La cantidad es obligatoria"),
  fechaEntrega: Yup.string().required("La fecha de entrega es obligatoria"),
  prioridad: Yup.mixed<"alta" | "media" | "baja">()
    .oneOf(["alta", "media", "baja"])
    .required("La prioridad es obligatoria"),
})

// ====== COMPONENTE PRINCIPAL ======

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<
    "todos" | "pendiente" | "procesando" | "preparación" | "completado"
  >("todos")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState(false) // 👈 nuevo estado

  // ====== Traer pedidos ======
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get("/orders")
      setOrders((res.data as any[]).map(mapOrderFromApi))
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 401) {
        setError("No autorizado. Vuelve a iniciar sesión.")
      } else {
        setError("Error al cargar pedidos.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders =
    filter === "todos" ? orders : orders.filter((order) => order.estado === filter)

  // ====== Formik: Crear pedido ======
  const createFormik = useFormik<CreateOrderValues>({
    initialValues: {
      cliente: "",
      producto: "",
      cantidad: "",
      fechaEntrega: "",
      prioridad: "media",
    },
    validationSchema: orderSchema,
    onSubmit: async (values) => {
      try {
        setCreatingOrder(true)

        const deliveryISO = new Date(values.fechaEntrega + "T00:00:00").toISOString()

        await api.post("/orders", {
          clientName: values.cliente,
          product: values.producto,
          quantity: Number(values.cantidad),
          deliveryDate: deliveryISO,
          priority: priorityToApi[values.prioridad],
        })

        await fetchOrders()
        setIsCreateOpen(false)
        createFormik.resetForm()
      } catch (err: any) {
        console.error(err)
        alert("No se pudo crear el pedido")
      } finally {
        setCreatingOrder(false)
      }
    },
  })

  // ====== Formik: Editar pedido ======
  const editFormik = useFormik<EditOrderValues>({
    enableReinitialize: true,
    initialValues: selectedOrder
      ? {
          cliente: selectedOrder.cliente,
          producto: selectedOrder.producto,
          cantidad: Number(selectedOrder.cantidad),
          fechaEntrega: selectedOrder.fechaEntrega
            ? selectedOrder.fechaEntrega.slice(0, 10)
            : "",
          prioridad: selectedOrder.prioridad,
        }
      : {
          cliente: "",
          producto: "",
          cantidad: "",
          fechaEntrega: "",
          prioridad: "media",
        },
    validationSchema: orderSchema,
    onSubmit: async (values) => {
      if (!selectedOrder) return

      try {
        setSavingEdit(true)

        const deliveryISO = new Date(values.fechaEntrega + "T00:00:00").toISOString()

        const res = await api.patch(`/orders/${selectedOrder.id}`, {
          clientName: values.cliente,
          product: values.producto,
          quantity: Number(values.cantidad),
          deliveryDate: deliveryISO,
          priority: priorityToApi[values.prioridad],
        })

        const updatedOrder = mapOrderFromApi(res.data)

        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
        )
        setSelectedOrder(updatedOrder)

        setIsEditing(false)
      } catch (err: any) {
        console.error(err)
        alert("No se pudo actualizar el pedido")
      } finally {
        setSavingEdit(false)
      }
    },
  })

  // ====== Cambiar estado ======
  const handleChangeStatus = async (nuevoEstado: Order["estado"]) => {
    if (!selectedOrder) return
    try {
      setSavingStatus(true)

      await api.patch(`/orders/${selectedOrder.id}/status`, {
        status: statusToApi[nuevoEstado],
      })

      await fetchOrders()
      const updated = orders.find((o) => o.id === selectedOrder.id)
      if (updated) setSelectedOrder(updated)
    } catch (err: any) {
      console.error(err)
      alert("No se pudo actualizar el estado del pedido")
    } finally {
      setSavingStatus(false)
    }
  }

  // ====== ELIMINAR PEDIDO ======
  const handleDeleteOrder = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este pedido?")) return
    try {
      setDeletingOrder(true)
      await api.delete(`/orders/${id}`) // DELETE /orders/{id}

      // Actualizamos la lista en el front
      setOrders((prev) => prev.filter((o) => o.id !== id))

      // Cerramos modal si el que estaba abierto es el eliminado
      if (selectedOrder?.id === id) {
        setSelectedOrder(null)
        setIsEditing(false)
      }
    } catch (err: any) {
      console.error(err)
      alert("No se pudo eliminar el pedido")
    } finally {
      setDeletingOrder(false)
    }
  }

  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-8 pt-12">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Gestión de Pedidos
        </h1>
        <p className="text-primary-foreground/80 text-sm">
          {filteredOrders.length} pedido{filteredOrders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Botón Nuevo Pedido */}
        <button
          className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => setIsCreateOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Pedido
        </button>

        {/* Mensajes de carga / error */}
        {loading && (
          <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["todos", "pendiente", "procesando", "preparación", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-border text-foreground hover:border-primary"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {!loading && filteredOrders.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">No hay pedidos para mostrar.</p>
          )}

          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                setSelectedOrder(order)
                setIsEditing(false)
              }}
              className="bg-white rounded-lg border border-border p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold text-foreground">{order.cliente}</p>
                  <p className="text-xs text-muted-foreground">#{order.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                      order.estado,
                    )}`}
                  >
                    {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getPrioridadColor(
                      order.prioridad,
                    )}`}
                  >
                    Prioridad{" "}
                    {order.prioridad.charAt(0).toUpperCase() +
                      order.prioridad.slice(1)}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">{order.producto}</p>
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>{order.cantidad} unidades</span>
                  <span>
                    Entrega:{" "}
                    {new Date(order.fechaEntrega).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL: Detalles + editar + cambio de estado + eliminar */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
            <div className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Detalles del Pedido
                </h2>
                <button
                  onClick={() => {
                    setSelectedOrder(null)
                    setIsEditing(false)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {/* Detalles básicos */}
              <div className="space-y-4 mb-6">
                <div className="bg-background p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Número de Pedido
                    </p>
                    <p className="font-bold text-lg">#{selectedOrder.id}</p>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(
                      selectedOrder.prioridad,
                    )}`}
                  >
                    Prioridad{" "}
                    {selectedOrder.prioridad.charAt(0).toUpperCase() +
                      selectedOrder.prioridad.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                    <p className="font-semibold">{selectedOrder.cliente}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Estado</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                        selectedOrder.estado,
                      )}`}
                    >
                      {selectedOrder.estado.charAt(0).toUpperCase() +
                        selectedOrder.estado.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="bg-background p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Producto</p>
                  <p className="font-semibold text-lg">{selectedOrder.producto}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Cantidad</p>
                    <p className="font-bold text-xl">{selectedOrder.cantidad}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Fecha Pedido
                    </p>
                    <p className="font-semibold">
                      {selectedOrder.fecha
                        ? new Date(selectedOrder.fecha).toLocaleDateString("es-ES")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="bg-background p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Fecha Entrega
                  </p>
                  <p className="font-bold text-lg">
                    {selectedOrder.fechaEntrega
                      ? new Date(selectedOrder.fechaEntrega).toLocaleDateString(
                          "es-ES",
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Selector de estado */}
              <div className="bg-background p-4 rounded-lg space-y-2 mb-6">
                <p className="text-xs text-muted-foreground">Actualizar estado</p>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  value={selectedOrder.estado}
                  onChange={(e) =>
                    setSelectedOrder({
                      ...selectedOrder,
                      estado: e.target.value as Order["estado"],
                    })
                  }
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="procesando">Procesando</option>
                  <option value="preparación">Preparación</option>
                  <option value="completado">Completado</option>
                </select>
                <button
                  onClick={() => handleChangeStatus(selectedOrder.estado)}
                  disabled={savingStatus}
                  className="w-full mt-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-60"
                >
                  {savingStatus ? "Guardando..." : "Guardar estado"}
                </button>
              </div>

              {/* Form de edición de datos */}
              <div className="border-t border-border pt-4 mt-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 px-4 border border-border rounded-lg text-sm font-semibold hover:bg-background"
                  >
                    Editar datos del pedido
                  </button>
                ) : (
                  <form
                    onSubmit={editFormik.handleSubmit}
                    className="space-y-4 mt-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          Cliente
                        </label>
                        <input
                          type="text"
                          name="cliente"
                          value={editFormik.values.cliente}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                        />
                        {editFormik.touched.cliente &&
                          editFormik.errors.cliente && (
                            <p className="text-xs text-destructive mt-1">
                              {editFormik.errors.cliente}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          Producto
                        </label>
                        <input
                          type="text"
                          name="producto"
                          value={editFormik.values.producto}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                        />
                        {editFormik.touched.producto &&
                          editFormik.errors.producto && (
                            <p className="text-xs text-destructive mt-1">
                              {editFormik.errors.producto}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          name="cantidad"
                          value={editFormik.values.cantidad}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                        />
                        {editFormik.touched.cantidad &&
                          editFormik.errors.cantidad && (
                            <p className="text-xs text-destructive mt-1">
                              {editFormik.errors.cantidad}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          Fecha entrega
                        </label>
                        <input
                          type="date"
                          name="fechaEntrega"
                          value={editFormik.values.fechaEntrega}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                        />
                        {editFormik.touched.fechaEntrega &&
                          editFormik.errors.fechaEntrega && (
                            <p className="text-xs text-destructive mt-1">
                              {editFormik.errors.fechaEntrega}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          Prioridad
                        </label>
                        <select
                          name="prioridad"
                          value={editFormik.values.prioridad}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                        {editFormik.touched.prioridad &&
                          editFormik.errors.prioridad && (
                            <p className="text-xs text-destructive mt-1">
                              {editFormik.errors.prioridad}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-60"
                      >
                        {savingEdit ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2 px-4 border border-border rounded-lg text-sm font-semibold hover:bg-background"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Botón ELIMINAR PEDIDO */}
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                disabled={deletingOrder}
                className="w-full mt-6 py-2 px-4 border border-destructive text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/10 disabled:opacity-60"
              >
                {deletingOrder ? "Eliminando..." : "Eliminar pedido"}
              </button>
            </div>
          </div>
        )}

        {/* MODAL: Crear pedido */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
            <div className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Nuevo Pedido
                </h2>
                <button
                  onClick={() => {
                    setIsCreateOpen(false)
                    createFormik.resetForm()
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={createFormik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Cliente
                    </label>
                    <input
                      type="text"
                      name="cliente"
                      value={createFormik.values.cliente}
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    />
                    {createFormik.touched.cliente &&
                      createFormik.errors.cliente && (
                        <p className="text-xs text-destructive mt-1">
                          {createFormik.errors.cliente}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Producto
                    </label>
                    <input
                      type="text"
                      name="producto"
                      value={createFormik.values.producto}
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    />
                    {createFormik.touched.producto &&
                      createFormik.errors.producto && (
                        <p className="text-xs text-destructive mt-1">
                          {createFormik.errors.producto}
                        </p>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      name="cantidad"
                      value={createFormik.values.cantidad}
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    />
                    {createFormik.touched.cantidad &&
                      createFormik.errors.cantidad && (
                        <p className="text-xs text-destructive mt-1">
                          {createFormik.errors.cantidad}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Fecha de entrega
                    </label>
                    <input
                      type="date"
                      name="fechaEntrega"
                      value={createFormik.values.fechaEntrega}
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    />
                    {createFormik.touched.fechaEntrega &&
                      createFormik.errors.fechaEntrega && (
                        <p className="text-xs text-destructive mt-1">
                          {createFormik.errors.fechaEntrega}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Prioridad
                    </label>
                    <select
                      name="prioridad"
                      value={createFormik.values.prioridad}
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                    {createFormik.touched.prioridad &&
                      createFormik.errors.prioridad && (
                        <p className="text-xs text-destructive mt-1">
                          {createFormik.errors.prioridad}
                        </p>
                      )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {creatingOrder ? "Creando..." : "Crear Pedido"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
