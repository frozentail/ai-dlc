import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

const KEYS = {
  storeId: 'table_store_id',
  tableNumber: 'table_number',
  password: 'table_password',
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null) // { token, tableId, sessionId, storeId, tableNumber }
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    autoLogin()
  }, [])

  const autoLogin = async () => {
    const storeIdentifier = localStorage.getItem(KEYS.storeId)
    const tableNumber = localStorage.getItem(KEYS.tableNumber)
    const password = localStorage.getItem(KEYS.password)

    if (!storeIdentifier || !tableNumber || !password) {
      setIsLoading(false)
      return
    }

    try {
      const data = await api.post('/auth/table/login', {
        store_identifier: storeIdentifier,
        table_number: parseInt(tableNumber),
        password,
      })
      setAuth({
        token: data.access_token,
        tableId: data.table_id,
        sessionId: data.session_id,
        storeId: data.store_id,
        tableNumber: parseInt(tableNumber),
      })
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const setup = async (storeIdentifier, tableNumber, password) => {
    const data = await api.post('/auth/table/login', {
      store_identifier: storeIdentifier,
      table_number: parseInt(tableNumber),
      password,
    })
    localStorage.setItem(KEYS.storeId, storeIdentifier)
    localStorage.setItem(KEYS.tableNumber, String(tableNumber))
    localStorage.setItem(KEYS.password, password)
    setAuth({
      token: data.access_token,
      tableId: data.table_id,
      sessionId: data.session_id,
      storeId: data.store_id,
      tableNumber: parseInt(tableNumber),
    })
  }

  const logout = () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, isLoading, error, setup, logout, autoLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
