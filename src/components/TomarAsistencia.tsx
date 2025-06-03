"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth0 } from "@auth0/auth0-react"
import { Check, X, AlertCircle } from "lucide-react"
import styles from "./css/tomar-asistencia.module.css"

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface Estudiante {
  id: string               // ID del estudiante
  estudianteGrupoId: string  // ID de la relación estudiante_grupo
  nombresCompletos: string
  numeroIdentificacion: string
}

interface Props {
  estudiantes: Estudiante[]
  sesionId: string
  grupoId: string
  onSuccess: () => void
  profesorId: string
}

interface EstudianteAsistencia extends Estudiante {
  asistio: boolean
  guardado: boolean
}

export default function TomarAsistencia({ estudiantes, sesionId, grupoId, onSuccess, profesorId }: Props) {
  const { getAccessTokenSilently } = useAuth0();
  const [listaAsistencia, setListaAsistencia] = useState<EstudianteAsistencia[]>(
    estudiantes.map((est) => ({ ...est, asistio: false, guardado: false }))
  )
  const [error, setError] = useState<string | null>(null)
  const [procesandoEstudiante, setProcesandoEstudiante] = useState<string | null>(null)

  // Validar props al montar el componente
  useEffect(() => {
    console.log('Props recibidas en TomarAsistencia:', {
      sesionId,
      profesorId,
      grupoId,
      estudiantes: estudiantes.map(e => ({
        id: e.id,
        estudianteGrupoId: e.estudianteGrupoId,
        nombresCompletos: e.nombresCompletos
      }))
    });

    if (!profesorId) {
      console.error('profesorId es requerido');
      setError('Error: No se ha proporcionado el ID del profesor');
    }

    if (!estudiantes.every(e => e.estudianteGrupoId)) {
      console.error('Algunos estudiantes no tienen estudianteGrupoId');
      setError('Error: Datos de estudiantes incompletos');
    }
  }, [estudiantes, profesorId, sesionId, grupoId]);

  const marcarAsistencia = async (estudiante: EstudianteAsistencia, asistio: boolean) => {
    if (!profesorId) {
      setError('No se puede registrar asistencia: ID del profesor no disponible');
      return;
    }

    if (!estudiante.estudianteGrupoId) {
      setError(`No se puede registrar asistencia para ${estudiante.nombresCompletos}: ID de estudiante-grupo no disponible`);
      return;
    }

    setProcesandoEstudiante(estudiante.id)
    setError(null)
    
    try {
      const token = await getAccessTokenSilently();
      
      const payload = {
        sesion: sesionId,
        profesor: profesorId,
        estudianteGrupo: estudiante.estudianteGrupoId,
        asistio: asistio
      };

      console.log('Enviando datos de asistencia:', payload);

      const response = await axios.post<ApiResponse<any>>(
        `http://localhost:8080/api/v1/asistencias`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);

      if (response.data.success) {
        setListaAsistencia((lista) =>
          lista.map((est) =>
            est.id === estudiante.id
              ? { ...est, asistio, guardado: true }
              : est
          )
        );

        // Si todos los estudiantes tienen asistencia marcada, llamar a onSuccess
        const todosGuardados = listaAsistencia.every((est) => est.guardado);
        if (todosGuardados) {
          setTimeout(onSuccess, 1000);
        }
      } else {
        throw new Error(response.data.message || 'Error al registrar asistencia');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.errors?.join(', ') ||
                         err.message ||
                         `Error al registrar asistencia para ${estudiante.nombresCompletos}`;
      setError(errorMessage);
      console.error("Error guardando asistencia:", err.response?.data || err);
    } finally {
      setProcesandoEstudiante(null)
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
            key={`${estudiante.id}-${index}`}
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
                disabled={procesandoEstudiante === estudiante.id || estudiante.guardado}
              >
                <Check size={16} />
                {estudiante.guardado ? "Presente ✓" : "Presente"}
              </button>
              <button
                className={`${styles.attendanceButton} ${styles.absentButton} ${
                  !estudiante.asistio ? styles.active : ""
                }`}
                onClick={() => marcarAsistencia(estudiante, false)}
                disabled={procesandoEstudiante === estudiante.id || estudiante.guardado}
              >
                <X size={16} />
                {estudiante.guardado ? "Ausente ✓" : "Ausente"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
