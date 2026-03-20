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
  const [historyTable, setHistoryTable] = useState(null) // 더보기 클릭한 테이블
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
      const { order_id, table_id, total_amount, items } = lastEvent.data
      // API로 주문 상세 재조회 (items 포함)
      api.get(`/orders/${order_id}`, token)
        .then(order => {
          setOrders(prev => {
            // 중복 방지
            if (prev.find(o => o.id === order.id)) return prev
            return [order, ...prev]
          })
        })
        .catch(() => {
          // fallback: payload 데이터로 임시 추가
          const tempOrder = {
            id: order_id,
            table_id,
            total_amount,
            status: 'pending',
            items: items || [],
            created_at: new Date().toISOString(),
          }
          setOrders(prev => {
            if (prev.find(o => o.id === order_id)) return prev
            return [tempOrder, ...prev]
          })
        })

      // 해당 테이블 하이라이트 3초
      setNewTableIds(prev => new Set([...prev, table_id]))
      if (highlightTimers.current[table_id]) clearTimeout(highlightTimers.current[table_id])
      highlightTimers.current[table_id] = setTimeout(() => {
        setNewTableIds(prev => { const s = new Set(prev); s.delete(table_id); return s })
      }, 3000)
    }

    if (lastEvent.type === 'order_status_changed') {
      const { order_id, status } = lastEvent.data
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status } : o))
      if (selectedOrder?.id === order_id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null)
      }
    }

    if (lastEvent.type === 'order_deleted') {
      const { order_id } = lastEvent.data
      setOrders(prev => prev.filter(o => o.id !== order_id))
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
    setSelectedOrder(null)
  }

  const handleMoreClick = (table) => {
    setHistoryTable(table)
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
                onMoreClick={() => handleMoreClick({ ...table, orders: ordersByTable[table.id] || [] })}
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
