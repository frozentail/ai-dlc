import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function OrderHistoryModal({ tableId, tableNumber, onClose }) {
  const { token } = useAuth()
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = async () => {
    setIsLoading(true)
    try {
      let url = `/tables/${tableId}/history`
      const params = new URLSearchParams()
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)
      if (params.toString()) url += `?${params}`
      const data = await api.get(url, token)
      setHistory(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [tableId])

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>{tableNumber}번 테이블 과거 내역</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.filter}>
          <input type="date" style={styles.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span>~</span>
          <input type="date" style={styles.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <button style={styles.filterBtn} onClick={load}>조회</button>
        </div>

        {isLoading ? (
          <div style={styles.loading}>불러오는 중...</div>
        ) : history.length === 0 ? (
          <div style={styles.empty}>과거 내역이 없습니다</div>
        ) : (
          <div style={styles.list}>
            {history.map((session) => (
              <div key={session.session_id} style={styles.session}>
                <div style={styles.sessionHeader}>
                  이용 완료: {new Date(session.ended_at).toLocaleString('ko-KR')}
                </div>
                {session.orders.map((order) => (
                  <div key={order.id} style={styles.order}>
                    <div style={styles.orderMeta}>
                      #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} style={styles.item}>
                        <span>{item.menu_name} x{item.quantity}</span>
                        <span>{(item.unit_price * item.quantity).toLocaleString()}원</span>
                      </div>
                    ))}
                    <div style={styles.orderTotal}>{order.total_amount.toLocaleString()}원</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 },
  modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 500, zIndex: 101, maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: 700, fontSize: 16 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', minWidth: 44, minHeight: 44 },
  filter: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 },
  dateInput: { flex: 1, height: 36, padding: '0 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 },
  filterBtn: { height: 36, padding: '0 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  loading: { padding: 40, textAlign: 'center', color: '#999' },
  empty: { padding: 40, textAlign: 'center', color: '#999' },
  list: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 },
  session: { border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' },
  sessionHeader: { background: '#f5f5f5', padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#555' },
  order: { padding: '10px 12px', borderBottom: '1px solid #f0f0f0' },
  orderMeta: { fontSize: 12, color: '#999', marginBottom: 6 },
  item: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0' },
  orderTotal: { textAlign: 'right', fontWeight: 700, fontSize: 13, marginTop: 6, color: '#e53e3e' },
}
