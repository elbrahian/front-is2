"use client"

import { useState } from "react"
import axios from "axios"
import { useAuth0 } from "@auth0/auth0-react"
import { Check, X, Save, AlertCircle } from "lucide-react"
import styles from "./css/tomar-asistencia.module.css"

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

interface Props {
  estudiantes: Estudiante[]
  sesionId: string
  grupoId: string
  onSuccess: () => void
}

interface EstudianteAsistencia extends Estudiante {
  asistio: boolean
}

export default function TomarAsistencia({ estudiantes, sesionId, grupoId, onSuccess }: Props) {
  const { getAccessTokenSilently } = useAuth0();
  const [listaAsistencia, setListaAsistencia] = useState<EstudianteAsistencia[]>(
    estudiantes.map((est) => ({ ...est, asistio: false }))
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarExito, setMostrarExito] = useState(false)

  const marcarAsistencia = (estudiante: EstudianteAsistencia, asistio: boolean) => {
    setListaAsistencia((lista) =>
      lista.map((est) => (est.id === estudiante.id ? { ...est, asistio } : est))
    )
  }

  const guardarAsistencia = async () => {
    setGuardando(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently();
      const asistencias = listaAsistencia.map((estudiante) => ({
        estudianteId: estudiante.id,
        sesionId,
        grupoId,
        asistio: estudiante.asistio,
      }))

      await axios.post<ApiResponse<any>>(
        `http://localhost:8080/api/v1/asistencias`,
        { asistencias },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setMostrarExito(true)
      setTimeout(() => {
        setMostrarExito(false)
        onSuccess()
      }, 2000)
    } catch (err) {
      setError("Error al guardar la asistencia")
      console.error("Error guardando asistencia:", err)
    } finally {
      setGuardando(false)
    }
  }

  const totalEstudiantes = listaAsistencia.length
  const estudiantesPresentes = listaAsistencia.filter((est) => est.asistio).length
  const estudiantesAusentes = totalEstudiantes - estudiantesPresentes

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.totalIcon}>👥</div>
          <div>
            <p className={styles.statValue}>{totalEstudiantes}</p>
            <p className={styles.statLabel}>Total Estudiantes</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.presenteIcon}>
            <Check size={16} />
          </div>
          <div>
            <p className={styles.statValue}>{estudiantesPresentes}</p>
            <p className={styles.statLabel}>Presentes</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.ausenteIcon}>
            <X size={16} />
          </div>
          <div>
            <p className={styles.statValue}>{estudiantesAusentes}</p>
            <p className={styles.statLabel}>Ausentes</p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de estudiantes */}
      <div className={styles.studentsList}>
        {listaAsistencia.map((estudiante, index) => (
          <div
            key={estudiante.id}
            className={styles.studentItem}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={styles.studentInfo}>
              <span className={styles.studentName}>{estudiante.nombresCompletos}</span>
              <span className={styles.studentId}>{estudiante.numeroIdentificacion}</span>
            </div>
            <div className={styles.attendanceButtons}>
              <button
                className={`${styles.attendanceButton} ${styles.presentButton} ${
                  estudiante.asistio ? styles.active : ""
                }`}
                onClick={() => marcarAsistencia(estudiante, true)}
              >
                <Check size={16} />
                Presente
              </button>
              <button
                className={`${styles.attendanceButton} ${styles.absentButton} ${
                  !estudiante.asistio ? styles.active : ""
                }`}
                onClick={() => marcarAsistencia(estudiante, false)}
              >
                <X size={16} />
                Ausente
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón guardar */}
      <button
        className={styles.saveButton}
        onClick={guardarAsistencia}
        disabled={guardando}
      >
        {guardando ? (
          <div className={styles.buttonSpinner} />
        ) : (
          <>
            <Save size={16} />
            Guardar Asistencia
          </>
        )}
      </button>

      {/* Notificación de éxito */}
      {mostrarExito && (
        <div className={`${styles.notification} ${mostrarExito ? "" : styles.hide}`}>
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>✓</div>
            <span className={styles.notificationText}>Asistencia guardada con éxito</span>
          </div>
        </div>
      )}
    </div>
  )
}
