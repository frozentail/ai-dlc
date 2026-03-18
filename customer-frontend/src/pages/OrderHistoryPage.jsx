import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSSE } from '../hooks/useSSE'
import { api } from '../api/client'
import OrderStatusBadge from '../components/OrderStatusBadge'

export default function OrderHistoryPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const { lastEvent } = useSSE(auth?.sessionId, auth?.token)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/orders/session/${auth.sessionId}`, auth.token)
        setOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [auth.sessionId, auth.token])

  // SSE 이벤트로 주문 상태 실시간 업데이트
  useEffect(() => {
    if (!lastEvent) return
    if (lastEvent.type === 'order_status_updated') {
      const { order_id, status } = lastEvent.data
      setOrders((prev) =>
        prev.map((o) => (o.id === order_id ? { ...o, status } : o))
      )
    }
  }, [lastEvent])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← 뒤로</button>
        <span style={styles.title}>주문 내역</span>
      </div>

      {isLoading ? (
        <div style={styles.loading}>불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div style={styles.empty}>주문 내역이 없습니다</div>
      ) : (
        <div style={styles.list}>
          {orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <span style={styles.orderNum}>주문 #{order.id.slice(0, 8).toUpperCase()}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div style={styles.orderTime}>
                {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={styles.itemList}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={styles.item}>
                    <span>{item.menu_name}</span>
                    <span style={styles.itemRight}>
                      x{item.quantity} · {(item.unit_price * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
              <div style={styles.orderTotal}>
                합계 <strong>{order.total_amount.toLocaleString()}원</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f9f9f9' },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { minHeight: 44, padding: '0 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15 },
  title: { fontWeight: 700, fontSize: 17 },
  loading: { padding: 40, textAlign: 'center', color: '#999' },
  empty: { padding: 60, textAlign: 'center', color: '#999' },
  list: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  orderCard: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNum: { fontWeight: 700, fontSize: 14 },
  orderTime: { color: '#999', fontSize: 13, marginBottom: 10 },
  itemList: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 },
  item: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  itemRight: { color: '#666' },
  orderTotal: { textAlign: 'right', fontSize: 14, color: '#333', borderTop: '1px solid #f0f0f0', paddingTop: 8 },
}
