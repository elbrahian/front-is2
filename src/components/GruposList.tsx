"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import axios from "axios"
import GrupoCard from "./GrupoCard"
import SesionesDialog from "./SesionesDialog"
import styles from "./css/grupos-list.module.css"

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface Grupo {
  id: string;
  profesor: string;
  profesorId: string;
  materia: string;
  cantidadEstudiantes: number;
}

export default function GruposList() {
  const { getAccessTokenSilently } = useAuth0();
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGrupo, setSelectedGrupo] = useState<{ grupoId: string; profesorId: string } | null>(null)

  useEffect(() => {
    cargarGrupos()
  }, [])

  const cargarGrupos = async () => {
    try {
      setLoading(true)
      const token = await getAccessTokenSilently();
      const response = await axios.get<ApiResponse<Grupo[]>>(
        'http://localhost:8080/api/v1/grupos',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log('Grupos cargados:', response.data.data);
        setGrupos(response.data.data)
      } else {
        setError(response.data.message || 'Error al cargar los grupos')
      }
    } catch (err) {
      console.error('Error cargando grupos:', err)
      setError('Error al cargar los grupos')
    } finally {
      setLoading(false)
    }
  }

  const handleGrupoClick = (grupoId: string, profesorId: string) => {
    console.log('Grupo seleccionado:', { grupoId, profesorId });
    setSelectedGrupo({ grupoId, profesorId });
  }

  if (loading) {
    return <div className={styles.loading}>Cargando grupos...</div>
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={cargarGrupos}>Reintentar</button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.gruposGrid}>
        {grupos.map((grupo) => (
          <GrupoCard
            key={grupo.id}
            id={grupo.id}
            materia={grupo.materia}
            profesor={grupo.profesor}
            profesorId={grupo.profesorId}
            cantidad={grupo.cantidadEstudiantes}
            onClick={handleGrupoClick}
          />
        ))}
      </div>

      {selectedGrupo && (
        <SesionesDialog
          grupoId={selectedGrupo.grupoId}
          profesorId={selectedGrupo.profesorId}
          isOpen={true}
          onClose={() => setSelectedGrupo(null)}
          grupoNombre={grupos.find(g => g.id === selectedGrupo.grupoId)?.materia}
        />
      )}
    </div>
  )
} 