"use client"
import { Users, Clock, ChevronRight } from "lucide-react"
import styles from "./css/grupo-card.module.css"

interface GrupoCardProps {
  id: string
  materia: string
  profesor: string
  profesorId: string
  cantidad: number
  onClick: (grupoId: string, profesorId: string) => void
  color?: string
  horario?: string
}

export default function GrupoCard({
  id,
  materia,
  profesor,
  profesorId,
  cantidad,
  onClick,
  color = "#3b82f6",
  horario = "Lunes y Miércoles 14:00 - 16:00",
}: GrupoCardProps) {
  return (
    <div className={styles.courseCard} onClick={() => onClick(id, profesorId)}>
      <div className={styles.courseHeader}>
        <div className={styles.courseColor} style={{ backgroundColor: color }} />
        <ChevronRight size={20} className={styles.chevronIcon} />
      </div>

      <h3 className={styles.courseName}>{materia}</h3>
      <p className={styles.courseDescription}>Profesor: {profesor}</p>

      <div className={styles.courseDetails}>
        <div className={styles.scheduleContainer}>
          <Clock size={16} />
          <span>{horario}</span>
        </div>

        <div className={styles.studentsContainer}>
          <div className={styles.studentsInfo}>
            <Users size={16} />
            <span>{cantidad} estudiantes</span>
          </div>
          <span className={styles.activeBadge}>Activo</span>
        </div>
      </div>
    </div>
  )
}
