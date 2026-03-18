import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import SetupPage from './pages/SetupPage'
import MenuPage from './pages/MenuPage'
import OrderConfirmPage from './pages/OrderConfirmPage'
import OrderHistoryPage from './pages/OrderHistoryPage'

function PrivateRoute({ children }) {
  const { auth, isLoading } = useAuth()
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>
  if (!auth) return <Navigate to="/setup" replace />
  return children
}

function AppRoutes() {
  const { auth, isLoading, error } = useAuth()

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>

  // 자동 로그인 실패 시 에러 표시 후 setup으로
  if (error && !auth) return <Navigate to="/setup" replace />

  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/" element={<PrivateRoute><MenuPage /></PrivateRoute>} />
      <Route path="/order/confirm" element={<PrivateRoute><OrderConfirmPage /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
