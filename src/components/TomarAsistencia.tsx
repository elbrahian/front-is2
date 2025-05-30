"use client"

import { useState } from "react"
import axios from "axios"
import { Check, X, Save, AlertCircle } from "lucide-react"
import styles from "./css/tomar-asistencia.module.css"

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

export default function TomarAsistencia({ estudiantes, sesionId, grupoId, onSuccess }: Props) {
  const [asistencias, setAsistencias] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleAsistencia = (id: string) => {
    setAsistencias((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const enviarAsistencias = async () => {
    setSaving(true)
    setError(null)
    try {
      await Promise.all(
        estudiantes.map((est) =>
          axios.post("http://localhost:8080/api/v1/asistencias/registrar", {
            estudianteId: est.id,
            grupoId,
            sesionId,
            asistio: asistencias[est.id] ?? false,
          }),
        ),
      )

      // Mostrar notificación de éxito
      const notification = document.createElement("div")
      notification.className = styles.notification
      notification.innerHTML = `
        <div class="${styles.notificationContent}">
          <div class="${styles.notificationIcon}">✓</div>
          <div class="${styles.notificationText}">Asistencia registrada con éxito</div>
        </div>
      `
      document.body.appendChild(notification)

      setTimeout(() => {
        notification.classList.add(styles.hide)
        setTimeout(() => {
          document.body.removeChild(notification)
          onSuccess()
        }, 300)
      }, 2000)
    } catch (error) {
      console.error("Error registrando asistencia", error)
      setError("Error al registrar la asistencia. Intente nuevamente.")
    } finally {
      setSaving(false)
    }
  }

  const presentes = Object.values(asistencias).filter(Boolean).length
  const ausentes = estudiantes.length - presentes

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.totalIcon}>👥</div>
            <div>
              <p className={styles.statValue}>{estudiantes.length}</p>
              <p className={styles.statLabel}>Total</p>
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.presenteIcon}>
              <Check size={16} />
            </div>
            <div>
              <p className={styles.statValue}>{presentes}</p>
              <p className={styles.statLabel}>Presentes</p>
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.ausenteIcon}>
              <X size={16} />
            </div>
            <div>
              <p className={styles.statValue}>{ausentes}</p>
              <p className={styles.statLabel}>Ausentes</p>
            </div>
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
        {estudiantes.map((est, index) => (
          <div key={est.id} className={styles.studentItem} style={{ animationDelay: `${index * 0.03}s` }}>
            <div className={styles.studentInfo}>
              <h4 className={styles.studentName}>{est.nombresCompletos}</h4>
              <p className={styles.studentId}>{est.numeroIdentificacion}</p>
            </div>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={asistencias[est.id] ?? false}
                onChange={() => toggleAsistencia(est.id)}
                className={styles.checkbox}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.checkboxLabel}>{asistencias[est.id] ? "Presente" : "Ausente"}</span>
            </label>
          </div>
        ))}
      </div>

      {/* Botón guardar */}
      <button onClick={enviarAsistencias} disabled={saving} className={styles.saveButton}>
        {saving ? (
          <>
            <div className={styles.buttonSpinner}></div>
            Guardando...
          </>
        ) : (
          <>
            <Save size={16} />
            Guardar asistencia
          </>
        )}
      </button>
    </div>
  )
}
