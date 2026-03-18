import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSSE } from '../hooks/useSSE'
import { api } from '../api/client'
import NavBar from '../components/NavBar'
import TableCard from '../components/TableCard'
import OrderDetailModal from '../components/OrderDetailModal'

export default function DashboardPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newTableIds, setNewTableIds] = useState(new Set())
  const { lastEvent } = useSSE(token)
  const highlightTimers = useRef({})

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersData, tablesData] = await Promise.all([
          api.get('/orders', token),
          api.get('/tables', token),
        ])
        setOrders(ordersData)
        setTables(tablesData)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [token])

  // SSE 이벤트 처리
  useEffect(() => {
    if (!lastEvent) return
    if (lastEvent.type === 'new_order') {
      const order = lastEvent.data
      setOrders(prev => [order, ...prev])
      // 해당 테이블 하이라이트 3초
      const tid = order.table_id
      setNewTableIds(prev => new Set([...prev, tid]))
      if (highlightTimers.current[tid]) clearTimeout(highlightTimers.current[tid])
      highlightTimers.current[tid] = setTimeout(() => {
        setNewTableIds(prev => { const s = new Set(prev); s.delete(tid); return s })
      }, 3000)
    }
    if (lastEvent.type === 'order_status_updated') {
      const { order_id, status } = lastEvent.data
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status } : o))
      if (selectedOrder?.id === order_id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null)
      }
    }
  }, [lastEvent])

  // 테이블별 주문 그룹핑
  const ordersByTable = orders.reduce((acc, o) => {
    if (!acc[o.table_id]) acc[o.table_id] = []
    acc[o.table_id].push(o)
    return acc
  }, {})

  const handleStatusChange = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status } : prev)
  }

  const handleDelete = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }

  return (
    <div style={styles.page}>
      <NavBar />
      <div style={styles.content}>
        <h2 style={styles.heading}>주문 대시보드</h2>
        {tables.length === 0 ? (
          <div style={styles.empty}>등록된 테이블이 없습니다</div>
        ) : (
          <div style={styles.grid}>
            {tables.map(table => (
              <TableCard
                key={table.id}
                tableNumber={table.table_number}
                orders={ordersByTable[table.id] || []}
                isNew={newTableIds.has(table.id)}
                onOrderClick={setSelectedOrder}
              />
            ))}
          </div>
        )}
      </div>
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  content: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  heading: { margin: '0 0 20px', fontSize: 20, fontWeight: 700 },
  empty: { padding: 60, textAlign: 'center', color: '#999' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
}
