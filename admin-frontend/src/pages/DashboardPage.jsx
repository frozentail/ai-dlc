import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
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
  const prevOrderIdsRef = useRef(new Set())
  const highlightTimers = useRef({})

  const fetchOrders = async () => {
    try {
      const ordersData = await api.get('/orders', token)
      setOrders(prev => {
        // 새 주문 감지해서 테이블 하이라이트
        const newIds = ordersData.map(o => o.id)
        const added = ordersData.filter(o => !prevOrderIdsRef.current.has(o.id))
        added.forEach(order => {
          const tid = order.table_id
          setNewTableIds(s => new Set([...s, tid]))
          if (highlightTimers.current[tid]) clearTimeout(highlightTimers.current[tid])
          highlightTimers.current[tid] = setTimeout(() => {
            setNewTableIds(s => { const ns = new Set(s); ns.delete(tid); return ns })
          }, 3000)
        })
        prevOrderIdsRef.current = new Set(newIds)
        return ordersData
      })
    } catch (e) {
      console.error(e)
    }
  }

  // 초기 로드
  useEffect(() => {
    const load = async () => {
      try {
        const [ordersData, tablesData] = await Promise.all([
          api.get('/orders', token),
          api.get('/tables', token),
        ])
        prevOrderIdsRef.current = new Set(ordersData.map(o => o.id))
        setOrders(ordersData)
        setTables(tablesData)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [token])

  // 2초 polling
  useEffect(() => {
    if (!token) return
    const interval = setInterval(fetchOrders, 2000)
    return () => clearInterval(interval)
  }, [token])

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
    setSelectedOrder(null)
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
  heading: { margin: '0 0 20px', fontSize: 20, fontWeight: 700 },
  empty: { padding: 60, textAlign: 'center', color: '#999' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
}
