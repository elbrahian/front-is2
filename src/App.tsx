"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { RefreshCw, AlertCircle, BookOpen, LogOut } from "lucide-react"
import { useAuth0 } from "@auth0/auth0-react"
import GrupoCard from "./components/GrupoCard"
import SesionesDialog from "./components/SesionesDialog"
import styles from "./components/css/app.module.css"

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface Grupo {
  id: string
  profesor: string
  materia: string
  cantidadEstudiantes: number
}

function App() {
  const { logout, user, getAccessTokenSilently } = useAuth0();
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  };

  const generarColorMateria = (materia: string): string => {
    const colores = ["#3b82f6", "#10b981", "#8b5cf6", "#f97316", "#ef4444", "#14b8a6", "#f59e0b", "#6366f1"]
    let hash = 0
    for (let i = 0; i < materia.length; i++) {
      hash = materia.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colores[Math.abs(hash) % colores.length]
  }

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://dev-jewoi3myj56ypvrl.us.auth0.com/api/v2/',
          scope: 'openid profile email'
        }
      });

      const res = await axios.get<ApiResponse<Grupo[]>>("http://localhost:8080/api/v1/grupos", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setGrupos(res.data.data)
      } else {
        setError(res.data.message || "Error al cargar los datos")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los datos")
      console.error("Error cargando datos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [getAccessTokenSilently])

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const totalEstudiantes = grupos.reduce((sum, grupo) => sum + grupo.cantidadEstudiantes, 0)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>Asistencia UCO</h1>
                <div className={styles.userInfo}>
                  {user?.email && <span className={styles.userEmail}>{user.email}</span>}
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
              <p className={styles.subtitle}>{currentDate}</p>
            </div>
            <button className={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
              <RefreshCw size={16} className={loading ? styles.spinning : ""} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={20} />
            <div>
              <h3 className={styles.errorTitle}>Error de conexión</h3>
              <p className={styles.errorMessage}>{error}</p>
              <button className={styles.retryButton} onClick={cargarDatos}>
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <BookOpen size={32} color="#3b82f6" />
            <div>
              <span className={styles.statValue}>{grupos.length}</span>
              <span className={styles.statLabel}>Grupos Activos</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.studentsIcon}>👥</div>
            <div>
              <span className={styles.statValue}>{totalEstudiantes}</span>
              <span className={styles.statLabel}>Total Estudiantes</span>
            </div>
          </div>
        </div>

        {/* Estados */}
        {loading && grupos.length === 0 && (
          <div className={styles.loadingContainer}>
            <RefreshCw className={styles.spinner} size={32} />
            <p>Cargando grupos...</p>
          </div>
        )}

        {!loading && grupos.length === 0 && !error && (
          <div className={styles.emptyState}>
            <BookOpen size={64} color="#9ca3af" />
            <h3>No hay grupos disponibles</h3>
            <p>No se encontraron grupos en el sistema.</p>
          </div>
        )}

        {/* Grupos */}
        {grupos.length > 0 && (
          <div className={styles.groupsGrid}>
            {grupos.map((grupo, index) => (
              <div key={grupo.id} style={{ animationDelay: `${index * 0.1}s` }} className={styles.groupItem}>
                <GrupoCard
                  materia={grupo.materia}
                  profesor={grupo.profesor}
                  cantidad={grupo.cantidadEstudiantes}
                  color={generarColorMateria(grupo.materia)}
                  onClick={() => setGrupoSeleccionado(grupo)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Modal de sesiones */}
        <SesionesDialog
          grupoId={grupoSeleccionado?.id ?? ""}
          isOpen={!!grupoSeleccionado}
          onClose={() => setGrupoSeleccionado(null)}
        />
      </div>
    </div>
  )
}

export default App
