import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSSE } from '../hooks/useSSE'
import { api } from '../api/client'
import NavBar from '../components/NavBar'
import TableCard from '../components/TableCard'
import OrderDetailModal from '../components/OrderDetailModal'
import TableOrdersModal from '../components/TableOrdersModal'

export default function DashboardPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [historyTable, setHistoryTable] = useState(null)
  const [newTableIds, setNewTableIds] = useState(new Set())
  const { lastEvent, isConnected } = useSSE(token)
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
      const { order_id, table_id } = lastEvent.data
      api.get(`/orders/${order_id}`, token)
        .then(order => {
          setOrders(prev => prev.find(o => o.id === order.id) ? prev : [order, ...prev])
          const tid = table_id
          setNewTableIds(prev => new Set([...prev, tid]))
          if (highlightTimers.current[tid]) clearTimeout(highlightTimers.current[tid])
          highlightTimers.current[tid] = setTimeout(() => {
            setNewTableIds(prev => { const s = new Set(prev); s.delete(tid); return s })
          }, 3000)
        })
        .catch(console.error)
    }

    if (lastEvent.type === 'order_status_changed') {
      const { order_id, status } = lastEvent.data
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status } : o))
      setSelectedOrder(prev => prev?.id === order_id ? { ...prev, status } : prev)
    }

    if (lastEvent.type === 'order_deleted') {
      const { order_id } = lastEvent.data
      setOrders(prev => prev.filter(o => o.id !== order_id))
    }

    if (lastEvent.type === 'session_completed') {
      const { table_id } = lastEvent.data
      setOrders(prev => prev.filter(o => o.table_id !== table_id))
    }
  }, [lastEvent])

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
    setSelectedOrder(null)
  }

  return (
    <div style={styles.page}>
      <NavBar />
      <div style={styles.content}>
        <div style={styles.titleRow}>
          <h2 style={styles.heading}>주문 대시보드</h2>
          <span style={{ ...styles.sseStatus, color: isConnected ? '#10b981' : '#f59e0b' }}>
            {isConnected ? '● 실시간 연결됨' : '● 연결 중...'}
          </span>
        </div>
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
                onMoreClick={() => setHistoryTable({ ...table, orders: ordersByTable[table.id] || [] })}
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
        onOrderUpdate={(updatedOrder) => {
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
          setSelectedOrder(updatedOrder)
        }}
      />
      {historyTable && (
        <TableOrdersModal
          tableNumber={historyTable.table_number}
          orders={historyTable.orders}
          onClose={() => setHistoryTable(null)}
          onOrderClick={(order) => {
            setHistoryTable(null)
            setSelectedOrder(order)
          }}
        />
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  content: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  heading: { margin: 0, fontSize: 20, fontWeight: 700 },
  sseStatus: { fontSize: 12 },
  empty: { padding: 60, textAlign: 'center', color: '#999' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
}
