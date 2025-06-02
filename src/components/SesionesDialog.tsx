"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { X, Calendar, Clock, ArrowLeft } from "lucide-react"
import { useAuth0 } from "@auth0/auth0-react"
import TomarAsistencia from "./TomarAsistencia"
import styles from "./css/sesiones-dialog.module.css"

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface Estudiante {
  id: string
  nombresCompletos: string
  numeroIdentificacion: string
}

interface Sesion {
  id: string
  fecha: string
  grupoId: string
}

interface Props {
  grupoId: string
  isOpen: boolean
  onClose: () => void
  grupoNombre?: string
}

export default function SesionesDialog({ grupoId, isOpen, onClose, grupoNombre = "Grupo" }: Props) {
  const { getAccessTokenSilently } = useAuth0();
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && grupoId) {
      cargarSesiones()
    }
  }, [grupoId, isOpen])

const cargarSesiones = async () => {
  setLoading(true)
  setError(null)
  try {
    const token = await getAccessTokenSilently();
    const res = await axios.get<ApiResponse<Sesion[]>>(
      `http://localhost:8080/api/v1/grupos/${grupoId}/sesiones`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (res.data.success) {
      setSesiones(res.data.data)
    } else {
      setError(res.data.message || "Error al cargar las sesiones")
    }
  } catch (err) {
    setError("Error al cargar las sesiones")
    console.error("Error cargando sesiones", err)
  } finally {
    setLoading(false)
  }

  setSesionSeleccionada(null)
  setEstudiantes([])
}

const cargarEstudiantes = async (sesion: Sesion) => {
  setLoading(true)
  setError(null)
  try {
    const token = await getAccessTokenSilently();
    const res = await axios.get<ApiResponse<Estudiante[]>>(
      `http://localhost:8080/api/v1/grupos/${grupoId}/estudiantes`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (res.data.success) {
      setEstudiantes(res.data.data)
      setSesionSeleccionada(sesion)
    } else {
      setError(res.data.message || "Error al cargar los estudiantes")
    }
  } catch (err) {
    setError("Error al cargar los estudiantes")
    console.error("Error cargando estudiantes", err)
  } finally {
    setLoading(false)
  }
}

  const handleClose = () => {
    setSesionSeleccionada(null)
    setEstudiantes([])
    onClose()
  }

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha)
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              {sesionSeleccionada && (
                <button className={styles.backButton} onClick={() => setSesionSeleccionada(null)}>
                  <ArrowLeft size={16} />
                  <span>Volver a sesiones</span>
                </button>
              )}
              <h2 className={styles.modalTitle}>{sesionSeleccionada ? "Tomar asistencia" : "Sesiones del grupo"}</h2>
              <p className={styles.modalSubtitle}>
                {sesionSeleccionada
                  ? `Sesión del ${formatFecha(sesionSeleccionada.fecha)}`
                  : `${grupoNombre || "Grupo"}`}
              </p>
            </div>
            <button className={styles.closeButton} onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Cargando datos...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button className={styles.retryButton} onClick={cargarSesiones}>
                Reintentar
              </button>
            </div>
          ) : !sesionSeleccionada ? (
            // Vista de sesiones
            <>
              <div className={styles.statsSection}>
                <div className={styles.statItem}>
                  <Calendar size={20} color="#3b82f6" />
                  <div>
                    <span className={styles.statValue}>{sesiones.length}</span>
                    <span className={styles.statLabel}>Sesiones registradas</span>
                  </div>
                </div>
              </div>

              {sesiones.length === 0 ? (
                <div className={styles.emptyState}>
                  <Calendar size={48} color="#9ca3af" />
                  <p className={styles.emptyTitle}>No hay sesiones disponibles</p>
                  <p className={styles.emptySubtitle}>Este grupo aún no tiene sesiones registradas</p>
                </div>
              ) : (
                <div className={styles.sessionsList}>
                  {sesiones.map((sesion, index) => (
                    <div
                      key={sesion.id}
                      className={styles.sessionItem}
                      onClick={() => cargarEstudiantes(sesion)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={styles.sessionIcon}>
                        <Clock size={16} />
                      </div>
                      <div className={styles.sessionInfo}>
                        <span className={styles.sessionDate}>{formatFecha(sesion.fecha)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Vista de tomar asistencia
            <TomarAsistencia
              estudiantes={estudiantes}
              sesionId={sesionSeleccionada.id}
              grupoId={grupoId}
              onSuccess={() => {
                handleClose()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
