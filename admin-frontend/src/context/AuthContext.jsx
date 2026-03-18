import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const AuthContext = createContext(null)
const TOKEN_KEY = 'admin_token'

const isTokenExpired = (token) => {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]))
    return exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (saved && !isTokenExpired(saved)) {
      setToken(saved)
      try {
        const payload = JSON.parse(atob(saved.split('.')[1]))
        setAdmin({ storeId: payload.store_id, username: payload.sub })
      } catch {}
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setIsLoading(false)
  }, [])

  const login = async (storeIdentifier, username, password) => {
    const data = await api.post('/auth/admin/login', { store_identifier: storeIdentifier, username, password })
    const t = data.access_token
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
    const payload = JSON.parse(atob(t.split('.')[1]))
    setAdmin({ storeId: payload.store_id, username: payload.sub })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ token, admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
