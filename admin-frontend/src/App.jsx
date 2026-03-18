import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TableManagementPage from './pages/TableManagementPage'
import MenuManagementPage from './pages/MenuManagementPage'

function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth()
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { token, isLoading } = useAuth()
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute><TableManagementPage /></PrivateRoute>} />
      <Route path="/menus" element={<PrivateRoute><MenuManagementPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
