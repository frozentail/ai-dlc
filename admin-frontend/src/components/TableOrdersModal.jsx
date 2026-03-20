const STATUS_LABEL = { pending: '대기중', preparing: '준비중', completed: '완료' }
const STATUS_COLOR = { pending: '#f59e0b', preparing: '#3b82f6', completed: '#10b981' }

export default function TableOrdersModal({ tableNumber, orders, onClose, onOrderClick }) {
  const sorted = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>{tableNumber}번 테이블 주문 목록</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        {sorted.length === 0 ? (
          <div style={styles.empty}>주문 없음</div>
        ) : (
          <div style={styles.list}>
            {sorted.map(order => (
              <div key={order.id} style={styles.orderRow} onClick={() => { onClose(); onOrderClick(order) }}>
                <div style={styles.orderItems}>
                  {(order.items || []).slice(0, 3).map(i => i.menu_name).join(', ')}
                  {(order.items || []).length > 3 ? ` 외 ${order.items.length - 3}` : ''}
                </div>
                <div style={styles.orderMeta}>
                  <span style={styles.amount}>{order.total_amount.toLocaleString()}원</span>
                  <span style={{ ...styles.badge, background: STATUS_COLOR[order.status] }}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
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
  modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 420, zIndex: 101, maxHeight: '70vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: 700, fontSize: 16 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', minWidth: 44, minHeight: 44 },
  empty: { padding: 40, textAlign: 'center', color: '#999' },
  list: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  orderRow: { padding: '10px 12px', border: '1px solid #eee', borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 },
  orderItems: { fontSize: 14, color: '#333' },
  orderMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontWeight: 700, color: '#e53e3e', fontSize: 14 },
  badge: { fontSize: 11, color: '#fff', padding: '2px 8px', borderRadius: 10 },
}
