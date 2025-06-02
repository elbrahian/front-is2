import { useAuth0 } from '@auth0/auth0-react';
import styles from './components/css/login.module.css';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const { loginWithRedirect, isAuthenticated, isLoading, error, getAccessTokenSilently, user } = useAuth0();

  // Effect to handle successful authentication
  useEffect(() => {
    const handleAuthentication = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: 'https://dev-jewoi3myj56ypvrl.us.auth0.com/api/v2/',
              scope: 'openid profile email'
            }
          });
          // Guardar el token en localStorage para uso posterior si es necesario
          localStorage.setItem('auth_token', token);
          console.log('Token de Auth0: ', token);
          onLoginSuccess();
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };

    handleAuthentication();
  }, [isAuthenticated, getAccessTokenSilently, onLoginSuccess, user]);

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        audience: 'https://dev-jewoi3myj56ypvrl.us.auth0.com/api/v2/',
        scope: 'openid profile email'
      }
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <Loader2 className={styles.spinner} size={36} />
          <h2>Cargando...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h2>Error de Autenticación</h2>
          <p className={styles.errorMessage}>{error.message}</p>
          <button onClick={handleLogin} className={styles.loginButton}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Bienvenido a Asistencia UCO</h2>
        <p>Inicia sesión para continuar</p>
        <button onClick={handleLogin} className={styles.loginButton}>
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}

export default Login;