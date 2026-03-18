import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import NavBar from '../components/NavBar'
import ConfirmDialog from '../components/ConfirmDialog'
import OrderHistoryModal from '../components/OrderHistoryModal'

export default function TableManagementPage() {
  const { token } = useAuth()
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [completeTarget, setCompleteTarget] = useState(null)
  const [historyTarget, setHistoryTarget] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [tablesData, ordersData] = await Promise.all([
          api.get('/tables', token),
          api.get('/orders', token),
        ])
        setTables(tablesData)
        setOrders(ordersData)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [token])

  const handleComplete = async () => {
    try {
      await api.post(`/tables/${completeTarget.id}/complete`, {}, token)
      setOrders(prev => prev.filter(o => o.table_id !== completeTarget.id))
      setCompleteTarget(null)
    } catch (e) {
      console.error(e)
    }
  }

  const ordersByTable = orders.reduce((acc, o) => {
    if (!acc[o.table_id]) acc[o.table_id] = []
    acc[o.table_id].push(o)
    return acc
  }, {})

  return (
    <div style={styles.page}>
      <NavBar />
      <div style={styles.content}>
        <h2 style={styles.heading}>테이블 관리</h2>
        {isLoading ? (
          <div style={styles.loading}>불러오는 중...</div>
        ) : (
          <div style={styles.tableList}>
            {tables.map(table => {
              const tableOrders = ordersByTable[table.id] || []
              const total = tableOrders.reduce((s, o) => s + o.total_amount, 0)
              return (
                <div key={table.id} style={styles.row}>
                  <div style={styles.tableInfo}>
                    <span style={styles.tableNum}>{table.table_number}번 테이블</span>
                    <span style={styles.orderCount}>주문 {tableOrders.length}건</span>
                    <span style={styles.totalAmount}>{total.toLocaleString()}원</span>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={styles.historyBtn}
                      onClick={() => setHistoryTarget(table)}
                    >
                      과거 내역
                    </button>
                    <button
                      style={styles.completeBtn}
                      onClick={() => setCompleteTarget(table)}
                    >
                      이용 완료
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {completeTarget && (
        <ConfirmDialog
          message={`${completeTarget.table_number}번 테이블을 이용 완료 처리하시겠습니까?`}
          onConfirm={handleComplete}
          onCancel={() => setCompleteTarget(null)}
        />
      )}

      {historyTarget && (
        <OrderHistoryModal
          tableId={historyTarget.id}
          tableNumber={historyTarget.table_number}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  content: { padding: 24, maxWidth: 800, margin: '0 auto' },
  heading: { margin: '0 0 20px', fontSize: 20, fontWeight: 700 },
  loading: { padding: 40, textAlign: 'center', color: '#999' },
  tableList: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: { background: '#fff', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  tableInfo: { display: 'flex', alignItems: 'center', gap: 16 },
  tableNum: { fontWeight: 700, fontSize: 15 },
  orderCount: { color: '#666', fontSize: 14 },
  totalAmount: { fontWeight: 700, color: '#e53e3e', fontSize: 15 },
  actions: { display: 'flex', gap: 8 },
  historyBtn: { height: 40, padding: '0 14px', border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  completeBtn: { height: 40, padding: '0 14px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
}
