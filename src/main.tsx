import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import Login from "./login"

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
    <Root />
  </StrictMode>,
)
