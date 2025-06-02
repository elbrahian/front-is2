import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { Auth0Provider } from "@auth0/auth0-react"
import App from "./App"
import Login from "./login"
import { auth0Config } from "./auth0-config"

function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  return isAuthenticated ? (
    <App />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: "openid profile email",
        response_type: "code",
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Root />
    </Auth0Provider>
  </StrictMode>,
)
