import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../api/client'

export default function OrderConfirmPage() {
  const { auth } = useAuth()
  const { items, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [countdown, setCountdown] = useState(5)

  // 장바구니 비어있으면 메뉴 화면으로
  useEffect(() => {
    if (items.length === 0 && !orderId) navigate('/', { replace: true })
  }, [items, orderId, navigate])

  // 주문 성공 후 카운트다운
  useEffect(() => {
    if (!orderId) return
    if (countdown === 0) {
      clearCart()
      navigate('/', { replace: true })
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [orderId, countdown, clearCart, navigate])

  const handleOrder = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.post(
        '/orders',
        {
          items: items.map((i) => ({
            menu_id: i.menuId,
            menu_name: i.menuName,
            quantity: i.quantity,
            unit_price: i.price,
          })),
        },
        auth.token
      )
      setOrderId(result.id)
    } catch (e) {
      setError(e.message || '주문에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (orderId) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>✅</div>
        <h2 style={styles.successTitle}>주문이 완료됐습니다!</h2>
        <p style={styles.orderId}>주문번호: {orderId.slice(0, 8).toUpperCase()}</p>
        <p style={styles.countdown}>{countdown}초 후 메뉴 화면으로 이동합니다</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← 뒤로</button>
        <span style={styles.title}>주문 확인</span>
      </div>

      <div style={styles.list}>
        {items.map((item) => (
          <div key={item.menuId} style={styles.item}>
            <span style={styles.itemName}>{item.menuName}</span>
            <span style={styles.itemQty}>x{item.quantity}</span>
            <span style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
      </div>

      <div style={styles.totalRow}>
        <span>합계</span>
        <span style={styles.totalAmount}>{totalAmount.toLocaleString()}원</span>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button style={styles.orderBtn} onClick={handleOrder} disabled={isLoading}>
        {isLoading ? '주문 중...' : '주문 확정'}
      </button>
    </div>
  )
}

const styles = {
  container: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff' },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #eee' },
  backBtn: { minHeight: 44, padding: '0 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15 },
  title: { fontWeight: 700, fontSize: 17 },
  list: { padding: '0 20px' },
  item: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', borderBottom: '1px solid #f5f5f5' },
  itemName: { flex: 1, fontWeight: 500 },
  itemQty: { color: '#666', fontSize: 14 },
  itemPrice: { fontWeight: 600, minWidth: 80, textAlign: 'right' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderTop: '2px solid #eee', fontWeight: 700, fontSize: 16 },
  totalAmount: { color: '#e53e3e', fontSize: 18 },
  error: { margin: '0 20px', padding: 12, background: '#fff5f5', color: '#e53e3e', borderRadius: 8, fontSize: 14 },
  orderBtn: { display: 'block', width: 'calc(100% - 40px)', margin: '20px', height: 52, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 17, cursor: 'pointer' },
  successContainer: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  successIcon: { fontSize: 64 },
  successTitle: { margin: 0, fontSize: 22, fontWeight: 700 },
  orderId: { margin: 0, color: '#666', fontSize: 15 },
  countdown: { margin: 0, color: '#999', fontSize: 14 },
}
