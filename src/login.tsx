import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

interface LoginProps {
    onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const handleLoginSuccess = (response: CredentialResponse) => {
    const token = response.credential;
    console.log('Token de Google: ', token);
    onLoginSuccess();
  };

  const handleLoginFailure = () => {
    console.log('Error de login');
  };
  

  return (
    <GoogleOAuthProvider clientId="201196173586-pof97slsj45l1vcslu98bpj20pphvibc.apps.googleusercontent.com">
      <div className="login-container">
        <div className="login-box">
          <h2>Bienvenido a Asistencia UCO</h2>
          <p>Inicia sesión con tu cuenta de Google para continuar</p>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
            theme="filled_blue"
            shape="pill"
            size="large"
            text="signin_with"
            locale="es"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;