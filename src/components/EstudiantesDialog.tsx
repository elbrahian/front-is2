"use client"

import React, { useEffect } from "react"
import { X, Users, User, Hash, Search } from "lucide-react"
import styles from "./css/estudiantes-dialog.module.css"

interface Estudiante {
  id: string
  nombresCompletos: string
  numeroIdentificacion: string
}

interface EstudiantesDialogProps {
  estudiantes: Estudiante[]
  isOpen: boolean
  onClose: () => void
  materia?: string
  profesor?: string
}

export default function EstudiantesDialog({
  estudiantes,
  isOpen,
  onClose,
  materia = "Materia",
  profesor = "Profesor",
}: EstudiantesDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  // Filtrar estudiantes por búsqueda
  const filteredEstudiantes = estudiantes.filter(
    (estudiante) =>
      estudiante.nombresCompletos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.numeroIdentificacion.includes(searchTerm),
  )

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h2 className={styles.modalTitle}>Lista de Estudiantes</h2>
              <p className={styles.modalSubtitle}>
                {materia} - {profesor}
              </p>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Stats */}
          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <Users size={20} color="#3b82f6" />
              <div>
                <span className={styles.statValue}>{estudiantes.length}</span>
                <span className={styles.statLabel}>Total Estudiantes</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por nombre o identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Students List */}
          <div className={styles.studentsSection}>
            {filteredEstudiantes.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={48} color="#9ca3af" />
                <p className={styles.emptyTitle}>
                  {searchTerm ? "No se encontraron estudiantes" : "No hay estudiantes registrados"}
                </p>
                <p className={styles.emptySubtitle}>
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "Este grupo aún no tiene estudiantes asignados"}
                </p>
              </div>
            ) : (
              <div className={styles.studentsList}>
                {filteredEstudiantes.map((estudiante, index) => (
                  <div
                    key={estudiante.id}
                    className={styles.studentItem}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={styles.studentAvatar}>
                      <User size={16} />
                    </div>
                    <div className={styles.studentInfo}>
                      <h4 className={styles.studentName}>{estudiante.nombresCompletos}</h4>
                      <div className={styles.studentId}>
                        <Hash size={12} />
                        <span>{estudiante.numeroIdentificacion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
