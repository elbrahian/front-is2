"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { X, Calendar, Clock, Users, ChevronRight, RefreshCw, ArrowLeft } from "lucide-react"
import styles from "./css/sesiones-dialog.module.css"

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
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null)

  useEffect(() => {
    if (isOpen) {
      cargarSesiones()
    }
  }, [isOpen, grupoId])

  const cargarSesiones = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/asistencias/grupo/${grupoId}/sesiones`)
      setSesiones(res.data)
    } catch (err) {
      setError("Error al cargar las sesiones")
      console.error("Error cargando sesiones:", err)
    } finally {
      setLoading(false)
    }
  }

  const cargarEstudiantes = async (sesion: Sesion) => {
    setLoading(true)
    setError(null)
    setSelectedSesion(sesion)
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/asistencias/grupo/${grupoId}`)
      setEstudiantes(res.data)
    } catch (err) {
      setError("Error al cargar los estudiantes")
      console.error("Error cargando estudiantes:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEstudiantes(null)
    setSelectedSesion(null)
    onClose()
  }

  const volverASesiones = () => {
    setEstudiantes(null)
    setSelectedSesion(null)
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
              {estudiantes ? (
                <button className={styles.backButton} onClick={volverASesiones}>
                  <ArrowLeft size={16} />
                  <span>Volver a sesiones</span>
                </button>
              ) : null}
              <h2 className={styles.modalTitle}>{estudiantes ? "Estudiantes de la sesión" : "Sesiones del grupo"}</h2>
              <p className={styles.modalSubtitle}>
                {estudiantes && selectedSesion ? `Sesión del ${formatFecha(selectedSesion.fecha)}` : `${grupoNombre}`}
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
              <RefreshCw className={styles.spinner} size={32} />
              <p>Cargando datos...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button className={styles.retryButton} onClick={cargarSesiones}>
                Reintentar
              </button>
            </div>
          ) : !estudiantes ? (
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
                      <ChevronRight size={16} className={styles.sessionArrow} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Vista de estudiantes
            <>
              <div className={styles.statsSection}>
                <div className={styles.statItem}>
                  <Users size={20} color="#3b82f6" />
                  <div>
                    <span className={styles.statValue}>{estudiantes.length}</span>
                    <span className={styles.statLabel}>Estudiantes registrados</span>
                  </div>
                </div>
              </div>

              {estudiantes.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users size={48} color="#9ca3af" />
                  <p className={styles.emptyTitle}>No hay estudiantes disponibles</p>
                  <p className={styles.emptySubtitle}>Esta sesión no tiene estudiantes registrados</p>
                </div>
              ) : (
                <div className={styles.studentsList}>
                  {estudiantes.map((estudiante, index) => (
                    <div
                      key={estudiante.id}
                      className={styles.studentItem}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={styles.studentAvatar}>
                        <Users size={16} />
                      </div>
                      <div className={styles.studentInfo}>
                        <h4 className={styles.studentName}>{estudiante.nombresCompletos}</h4>
                        <span className={styles.studentId}>{estudiante.numeroIdentificacion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
